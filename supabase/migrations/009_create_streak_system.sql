-- Create user_streaks table to track streak data
CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak integer DEFAULT 0 NOT NULL,
  longest_streak integer DEFAULT 0 NOT NULL,
  last_activity_date date,
  streak_start_date date,
  total_applications integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create daily_activities table to track daily application submissions
CREATE TABLE IF NOT EXISTS daily_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date date NOT NULL,
  applications_count integer DEFAULT 0 NOT NULL,
  streak_maintained boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, activity_date)
);

-- Create streak_milestones table to track achievements
CREATE TABLE IF NOT EXISTS streak_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type text NOT NULL, -- 'streak_3', 'streak_7', 'streak_14', 'streak_21', 'streak_30', 'total_apps_10', etc.
  milestone_value integer NOT NULL,
  achieved_date timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add RLS policies for user_streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for daily_activities
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON daily_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON daily_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON daily_activities
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for streak_milestones
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones" ON streak_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" ON streak_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_activities_updated_at
  BEFORE UPDATE ON daily_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_daily_activities_user_id ON daily_activities(user_id);
CREATE INDEX idx_daily_activities_date ON daily_activities(activity_date);
CREATE INDEX idx_daily_activities_user_date ON daily_activities(user_id, activity_date);
CREATE INDEX idx_streak_milestones_user_id ON streak_milestones(user_id);
CREATE INDEX idx_streak_milestones_type ON streak_milestones(milestone_type);

-- Create function to initialize user streak record
CREATE OR REPLACE FUNCTION initialize_user_streak(user_uuid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_applications)
  VALUES (user_uuid, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create function to update streak when application is created
CREATE OR REPLACE FUNCTION update_streak_on_application()
RETURNS TRIGGER AS $$
DECLARE
  today_date date := CURRENT_DATE;
  yesterday_date date := CURRENT_DATE - INTERVAL '1 day';
  user_streak_record user_streaks%ROWTYPE;
  activity_exists boolean;
  new_streak integer;
  streak_broken boolean := false;
BEGIN
  -- Initialize user streak if doesn't exist
  PERFORM initialize_user_streak(NEW.user_id);
  
  -- Get current streak record
  SELECT * INTO user_streak_record 
  FROM user_streaks 
  WHERE user_id = NEW.user_id;
  
  -- Check if user already has activity today
  SELECT EXISTS(
    SELECT 1 FROM daily_activities 
    WHERE user_id = NEW.user_id AND activity_date = today_date
  ) INTO activity_exists;
  
  -- Update or insert today's activity
  INSERT INTO daily_activities (user_id, activity_date, applications_count, streak_maintained)
  VALUES (NEW.user_id, today_date, 1, true)
  ON CONFLICT (user_id, activity_date) 
  DO UPDATE SET 
    applications_count = daily_activities.applications_count + 1,
    streak_maintained = true;
  
  -- Only update streak if this is the first application today
  IF NOT activity_exists THEN
    -- Check if streak should continue
    IF user_streak_record.last_activity_date IS NULL THEN
      -- First ever application
      new_streak := 1;
    ELSIF user_streak_record.last_activity_date = yesterday_date THEN
      -- Streak continues
      new_streak := user_streak_record.current_streak + 1;
    ELSIF user_streak_record.last_activity_date = today_date THEN
      -- Already counted today, no change
      new_streak := user_streak_record.current_streak;
    ELSE
      -- Streak broken, restart
      new_streak := 1;
      streak_broken := true;
    END IF;
    
    -- Update user streak record
    UPDATE user_streaks SET
      current_streak = new_streak,
      longest_streak = GREATEST(longest_streak, new_streak),
      last_activity_date = today_date,
      streak_start_date = CASE 
        WHEN new_streak = 1 THEN today_date 
        ELSE COALESCE(streak_start_date, today_date)
      END,
      total_applications = total_applications + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Check for milestone achievements
    PERFORM check_streak_milestones(NEW.user_id, new_streak, user_streak_record.total_applications + 1);
  ELSE
    -- Just increment total applications if already counted today
    UPDATE user_streaks SET
      total_applications = total_applications + 1,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to check and award milestones
CREATE OR REPLACE FUNCTION check_streak_milestones(user_uuid uuid, current_streak_val integer, total_apps integer)
RETURNS void AS $$
DECLARE
  milestone_types text[] := ARRAY['streak_3', 'streak_7', 'streak_14', 'streak_21', 'streak_30', 'streak_50', 'streak_100'];
  milestone_values integer[] := ARRAY[3, 7, 14, 21, 30, 50, 100];
  app_milestones integer[] := ARRAY[1, 5, 10, 25, 50, 100, 200, 500];
  i integer;
BEGIN
  -- Check streak milestones
  FOR i IN 1..array_length(milestone_values, 1) LOOP
    IF current_streak_val >= milestone_values[i] THEN
      INSERT INTO streak_milestones (user_id, milestone_type, milestone_value)
      VALUES (user_uuid, milestone_types[i], milestone_values[i])
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  
  -- Check total applications milestones
  FOR i IN 1..array_length(app_milestones, 1) LOOP
    IF total_apps >= app_milestones[i] THEN
      INSERT INTO streak_milestones (user_id, milestone_type, milestone_value)
      VALUES (user_uuid, 'total_apps_' || app_milestones[i], app_milestones[i])
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on job_applications to update streak
CREATE TRIGGER update_streak_on_new_application
  AFTER INSERT ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_on_application();

-- Create function to get user's weekly activity (last 7 days)
CREATE OR REPLACE FUNCTION get_weekly_activity(user_uuid uuid)
RETURNS TABLE(
  activity_date date,
  applications_count integer,
  streak_maintained boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS date
  )
  SELECT 
    ds.date,
    COALESCE(da.applications_count, 0) as applications_count,
    COALESCE(da.streak_maintained, false) as streak_maintained
  FROM date_series ds
  LEFT JOIN daily_activities da ON da.activity_date = ds.date AND da.user_id = user_uuid
  ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset broken streaks (run daily via cron job)
CREATE OR REPLACE FUNCTION reset_broken_streaks()
RETURNS void AS $$
DECLARE
  yesterday_date date := CURRENT_DATE - INTERVAL '1 day';
  user_record record;
BEGIN
  -- Find users whose streak should be broken (no activity yesterday and current streak > 0)
  FOR user_record IN
    SELECT us.user_id, us.current_streak
    FROM user_streaks us
    WHERE us.current_streak > 0
    AND us.last_activity_date < yesterday_date
    AND NOT EXISTS (
      SELECT 1 FROM daily_activities da 
      WHERE da.user_id = us.user_id 
      AND da.activity_date = yesterday_date
    )
  LOOP
    -- Reset the streak to 0
    UPDATE user_streaks 
    SET 
      current_streak = 0,
      updated_at = now()
    WHERE user_id = user_record.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

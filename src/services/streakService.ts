import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserStreak = Database['public']['Tables']['user_streaks']['Row'];
type DailyActivity = Database['public']['Tables']['daily_activities']['Row'];
type StreakMilestone = Database['public']['Tables']['streak_milestones']['Row'];

export interface StreakData {
  current: number;
  longest: number;
  lastActivity: string | null;
  streakStart: string | null;
  totalApplications: number;
}

export interface WeeklyActivity {
  date: string;
  count: number;
  hasActivity: boolean;
}

export interface Milestone {
  id: string;
  type: string;
  value: number;
  achievedDate: string;
}

export class StreakService {
  static async getUserStreak(): Promise<StreakData> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (!data) {
      // Initialize user streak if it doesn't exist
      await this.initializeUserStreak();
      return {
        current: 0,
        longest: 0,
        lastActivity: null,
        streakStart: null,
        totalApplications: 0
      };
    }

    return {
      current: data.current_streak,
      longest: data.longest_streak,
      lastActivity: data.last_activity_date,
      streakStart: data.streak_start_date,
      totalApplications: data.total_applications
    };
  }

  static async initializeUserStreak(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase.rpc('initialize_user_streak', {
      user_uuid: user.id
    });

    if (error) {
      throw error;
    }
  }

  static async getWeeklyActivity(): Promise<WeeklyActivity[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.rpc('get_weekly_activity', {
      user_uuid: user.id
    });

    if (error) {
      throw error;
    }

    return (data || []).map((day: any) => ({
      date: day.activity_date,
      count: day.applications_count,
      hasActivity: day.streak_maintained
    }));
  }

  static async getUserMilestones(): Promise<Milestone[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(milestone => ({
      id: milestone.id,
      type: milestone.milestone_type,
      value: milestone.milestone_value,
      achievedDate: milestone.achieved_date
    }));
  }

  static async getRecentMilestones(): Promise<Milestone[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('streak_milestones')
      .select('*')
      .eq('user_id', user.id)
      .gte('achieved_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('achieved_date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(milestone => ({
      id: milestone.id,
      type: milestone.milestone_type,
      value: milestone.milestone_value,
      achievedDate: milestone.achieved_date
    }));
  }
}

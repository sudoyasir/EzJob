-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  location text,
  status text CHECK (status IN ('applied', 'interview', 'offer', 'rejected', 'withdrawn')) DEFAULT 'applied',
  applied_date date NOT NULL,
  notes text,
  salary_range text,
  job_url text,
  contact_person text,
  contact_email text,
  follow_up_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create enum for job application status
CREATE TYPE job_application_status AS ENUM ('applied', 'interview', 'offer', 'rejected', 'withdrawn');

-- Add RLS (Row Level Security) policies
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own applications
CREATE POLICY "Users can view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own applications
CREATE POLICY "Users can insert own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own applications
CREATE POLICY "Users can update own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own applications
CREATE POLICY "Users can delete own applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- Migration: Create resume management system
-- File: 005_create_resume_management.sql

-- Create resumes table for managing multiple resume versions
CREATE TABLE IF NOT EXISTS resumes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL, -- User-friendly name like "Software Engineer Resume 2024"
  description text, -- Optional description
  file_name text NOT NULL, -- Original file name
  file_url text NOT NULL, -- Supabase storage URL
  file_path text NOT NULL, -- Storage path for deletion
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  is_default boolean DEFAULT false, -- Mark one as default
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on resumes
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- RLS policies for resumes
CREATE POLICY "Users can view own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for resumes updated_at
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_created_at ON resumes(created_at);
CREATE INDEX idx_resumes_is_default ON resumes(user_id, is_default);

-- Update job_applications table to reference resume instead of storing documents
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL;

-- Create index for resume_id
CREATE INDEX IF NOT EXISTS idx_job_applications_resume_id ON job_applications(resume_id);

-- Function to ensure only one default resume per user
CREATE OR REPLACE FUNCTION ensure_single_default_resume()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this resume as default, unset all other defaults for this user
  IF NEW.is_default = true THEN
    UPDATE resumes 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single default resume
CREATE TRIGGER ensure_single_default_resume_trigger
  BEFORE INSERT OR UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_resume();

-- Add comment to explain the resume system
COMMENT ON TABLE resumes IS 'Stores user resume versions with friendly names for easy selection during job applications';
COMMENT ON COLUMN resumes.name IS 'User-friendly name like "Senior Developer Resume" or "Frontend Specialist CV"';
COMMENT ON COLUMN resumes.is_default IS 'Only one resume per user can be marked as default';
COMMENT ON COLUMN job_applications.resume_id IS 'References the resume used for this application';

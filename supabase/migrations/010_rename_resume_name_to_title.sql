-- Migration: Rename resume 'name' column to 'title' for consistency with application code
-- File: 010_rename_resume_name_to_title.sql

-- Rename the 'name' column to 'title' in the resumes table
ALTER TABLE resumes RENAME COLUMN name TO title;

-- Update the comment to reflect the new column name
COMMENT ON COLUMN resumes.title IS 'User-friendly title like "Senior Developer Resume" or "Frontend Specialist CV"';

-- Update the function comment to use the correct column name
COMMENT ON TABLE resumes IS 'Stores user resume versions with friendly titles for easy selection during job applications';

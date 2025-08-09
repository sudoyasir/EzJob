-- Migration: Fix resumes table schema to match application code
-- File: 011_fix_resumes_schema.sql

-- Remove NOT NULL constraint from file_url and file_type since they're not used by the application
ALTER TABLE resumes ALTER COLUMN file_url DROP NOT NULL;
ALTER TABLE resumes ALTER COLUMN file_type DROP NOT NULL;

-- Alternatively, if we want to remove these columns entirely since they're not used:
-- ALTER TABLE resumes DROP COLUMN IF EXISTS file_url;
-- ALTER TABLE resumes DROP COLUMN IF EXISTS file_type;

-- Update comments to reflect actual usage
COMMENT ON COLUMN resumes.file_path IS 'Storage path in Supabase storage bucket for file access and deletion';
COMMENT ON COLUMN resumes.file_name IS 'Original filename as uploaded by user';
COMMENT ON COLUMN resumes.file_size IS 'File size in bytes';

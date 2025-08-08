-- Remove unused documents column from job_applications table
ALTER TABLE job_applications 
DROP COLUMN IF EXISTS documents;

-- Remove the index for documents column
DROP INDEX IF EXISTS idx_job_applications_documents;

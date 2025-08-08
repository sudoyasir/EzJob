-- Add documents column to job_applications table
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

-- Add index for documents column for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_documents 
ON job_applications USING gin (documents);

-- Add comment to explain the documents column structure
COMMENT ON COLUMN job_applications.documents IS 'JSON array of uploaded documents with structure: [{"id": "uuid", "name": "string", "url": "string", "path": "string", "size": "number", "type": "string", "uploadedAt": "timestamp"}]';

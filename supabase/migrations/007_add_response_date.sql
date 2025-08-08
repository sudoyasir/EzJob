-- Add response_date column to track when companies respond to applications
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS response_date date;

-- Add index for better performance when calculating response times
CREATE INDEX IF NOT EXISTS idx_job_applications_response_date 
ON job_applications(response_date);

-- Add index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_response_dates 
ON job_applications(applied_date, response_date) 
WHERE response_date IS NOT NULL;

-- Add comment to explain the response_date column
COMMENT ON COLUMN job_applications.response_date IS 'Date when the company responded to the application (interview invitation, rejection, etc.)';

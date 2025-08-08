-- Migration: Encrypt existing TOTP secrets and add security columns
-- File: 004_encrypt_totp_secrets.sql

-- Add columns for encrypted 2FA and security tracking
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS totp_secret_encrypted TEXT,
ADD COLUMN IF NOT EXISTS totp_backup_codes TEXT[], -- Encrypted backup codes
ADD COLUMN IF NOT EXISTS security_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ;

-- Create index for performance on security queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_security 
ON user_profiles(account_locked_until, last_failed_login);

-- Create a function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    codes TEXT[] := '{}';
    i INTEGER;
    code TEXT;
BEGIN
    -- Generate 10 backup codes
    FOR i IN 1..10 LOOP
        -- Generate a random 8-character alphanumeric code
        code := upper(substring(md5(random()::text || user_id::text || i::text) from 1 for 8));
        codes := array_append(codes, code);
    END LOOP;
    
    RETURN codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a table for tracking security events
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on security_events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS policy for security_events - users can only see their own events
CREATE POLICY "Users can view their own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

-- Create index for performance on security events
CREATE INDEX IF NOT EXISTS idx_security_events_user_id_created_at 
ON security_events(user_id, created_at DESC);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_security_events_ip_created_at 
ON security_events(ip_address, created_at DESC);

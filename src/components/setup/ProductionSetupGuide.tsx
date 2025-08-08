import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, AlertTriangle, CheckCircle, ExternalLink, Mail } from "lucide-react";
import { toast } from "sonner";
import { emailNotificationService } from "@/services/emailNotifications";
import { useAuth } from "@/contexts/AuthContext";

const ProductionSetupGuide = () => {
  const { user } = useAuth();
  const [envVars, setEnvVars] = useState({
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: '',
    FROM_EMAIL: '',
    ENCRYPTION_SECRET: '',
    RATE_LIMIT_WINDOW_MS: '900000',
    RATE_LIMIT_MAX_REQUESTS: '5'
  });
  const [copied, setCopied] = useState<string | null>(null);

  // Check which env vars are set
  const envStatus = {
    SMTP_HOST: !!import.meta.env.SMTP_HOST,
    SMTP_PORT: !!import.meta.env.SMTP_PORT, 
    SMTP_USER: !!import.meta.env.SMTP_USER,
    SMTP_PASS: !!import.meta.env.SMTP_PASS,
    FROM_EMAIL: !!import.meta.env.FROM_EMAIL,
    ENCRYPTION_SECRET: !!import.meta.env.ENCRYPTION_SECRET,
    RATE_LIMIT_WINDOW_MS: !!import.meta.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: !!import.meta.env.RATE_LIMIT_MAX_REQUESTS,
  };

  const allConfigured = Object.values(envStatus).every(Boolean);

  const generateEncryptionSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setEnvVars(prev => ({ ...prev, ENCRYPTION_SECRET: secret }));
    toast.success('Encryption secret generated!');
  };

  const testEmailConfiguration = async () => {
    try {
      const testResult = await emailNotificationService.testEmailConfiguration();
      if (testResult && user?.email) {
        await emailNotificationService.sendWelcomeEmail(
          user.email,
          user.user_metadata?.full_name || 'Test User'
        );
        toast.success('Test email sent successfully! Check your inbox.');
      } else if (testResult) {
        toast.success('Email configuration is working! (Mock mode)');
      } else {
        toast.error('Email configuration test failed. Check your SMTP settings.');
      }
    } catch (error) {
      console.error('Email test error:', error);
      toast.error('Failed to test email configuration');
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const generateEnvFile = () => {
    const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${import.meta.env.VITE_SUPABASE_URL || 'your_supabase_project_url'}
VITE_SUPABASE_ANON_KEY=${import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key'}

# Gmail SMTP Configuration (Free)
# Use your Gmail account with App Password
SMTP_HOST=${envVars.SMTP_HOST}
SMTP_PORT=${envVars.SMTP_PORT}
SMTP_USER=${envVars.SMTP_USER || 'your_gmail@gmail.com'}
SMTP_PASS=${envVars.SMTP_PASS || 'your_app_password'}
FROM_EMAIL=${envVars.FROM_EMAIL || 'your_gmail@gmail.com'}

# Security Configuration
# Use a strong secret for encrypting 2FA secrets
ENCRYPTION_SECRET=${envVars.ENCRYPTION_SECRET || 'your_32_character_encryption_secret'}

# Rate Limiting Configuration  
RATE_LIMIT_WINDOW_MS=${envVars.RATE_LIMIT_WINDOW_MS}
RATE_LIMIT_MAX_REQUESTS=${envVars.RATE_LIMIT_MAX_REQUESTS}`;

    copyToClipboard(envContent, 'env_file');
  };

  const migrationSQL = `-- Run this in your Supabase SQL Editor to enable security features

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

-- RLS policy for security_events
CREATE POLICY "Users can view their own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_user_id_created_at 
ON security_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_ip_created_at 
ON security_events(ip_address, created_at DESC);`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Production Setup Guide
          </CardTitle>
          <CardDescription>
            Configure your production environment with these essential security and email features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="space-y-3">
            <h3 className="font-semibold">Current Configuration Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(envStatus).map(([key, isSet]) => (
                <div key={key} className="flex items-center gap-2">
                  {isSet ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm">{key}</span>
                  <Badge variant={isSet ? "default" : "destructive"} className="text-xs">
                    {isSet ? "Set" : "Missing"}
                  </Badge>
                </div>
              ))}
            </div>
            {allConfigured && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-700">
                  All production features are properly configured! 🎉
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Step 1: Email Service Setup */}
          <div className="space-y-3">
            <h3 className="font-semibold">1. Email Service (Gmail SMTP - Free)</h3>
            <Alert>
              <AlertDescription>
                <strong>Frontend Note:</strong> Email notifications are currently in mock mode for the frontend.
                <br />For production emails, implement a backend API with Gmail SMTP:
                <br />1. Enable 2-factor authentication on your Gmail account
                <br />2. Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">Google App Passwords <ExternalLink className="h-3 w-3" /></a>
                <br />3. Generate an app password for "Mail"
                <br />4. Use these credentials in your backend service
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_user">Gmail Address</Label>
                <Input
                  id="smtp_user"
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={envVars.SMTP_USER}
                  onChange={(e) => setEnvVars(prev => ({ ...prev, SMTP_USER: e.target.value, FROM_EMAIL: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp_pass">Gmail App Password</Label>
                <Input
                  id="smtp_pass"
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={envVars.SMTP_PASS}
                  onChange={(e) => setEnvVars(prev => ({ ...prev, SMTP_PASS: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Security Configuration */}
          <div className="space-y-3">
            <h3 className="font-semibold">2. Security Configuration</h3>
            <div className="space-y-2">
              <Label htmlFor="encryption_secret">Encryption Secret (32 characters)</Label>
              <div className="flex gap-2">
                <Input
                  id="encryption_secret"
                  type="password"
                  placeholder="your_32_character_encryption_secret"
                  value={envVars.ENCRYPTION_SECRET}
                  onChange={(e) => setEnvVars(prev => ({ ...prev, ENCRYPTION_SECRET: e.target.value }))}
                />
                <Button variant="outline" onClick={generateEncryptionSecret}>
                  Generate
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Rate Limiting */}
          <div className="space-y-3">
            <h3 className="font-semibold">3. Rate Limiting</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="window_ms">Window (milliseconds)</Label>
                <Input
                  id="window_ms"
                  type="number"
                  value={envVars.RATE_LIMIT_WINDOW_MS}
                  onChange={(e) => setEnvVars(prev => ({ ...prev, RATE_LIMIT_WINDOW_MS: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_requests">Max Requests</Label>
                <Input
                  id="max_requests"
                  type="number"
                  value={envVars.RATE_LIMIT_MAX_REQUESTS}
                  onChange={(e) => setEnvVars(prev => ({ ...prev, RATE_LIMIT_MAX_REQUESTS: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Generate .env File */}
          <div className="space-y-3">
            <h3 className="font-semibold">4. Environment File</h3>
            <div className="flex gap-2">
              <Button onClick={generateEnvFile} className="flex-1">
                {copied === 'env_file' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy Complete .env File
              </Button>
              <Button 
                onClick={testEmailConfiguration} 
                variant="outline"
                className="flex-shrink-0"
                disabled={!envVars.SMTP_USER || !envVars.SMTP_PASS}
              >
                <Mail className="h-4 w-4 mr-2" />
                Test Email
              </Button>
            </div>
          </div>

          {/* Database Migration */}
          <div className="space-y-3">
            <h3 className="font-semibold">5. Database Migration</h3>
            <Alert>
              <AlertDescription>
                Run this SQL in your Supabase Dashboard → SQL Editor to enable security features:
              </AlertDescription>
            </Alert>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-48">
                {migrationSQL}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(migrationSQL, 'migration')}
              >
                {copied === 'migration' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Features Enabled */}
          <div className="space-y-3">
            <h3 className="font-semibold">✨ Features Enabled</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">🔐 Security Features</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Encrypted TOTP 2FA secrets</li>
                  <li>• Backup codes generation</li>
                  <li>• Rate limiting on login/signup</li>
                  <li>• Security event logging</li>
                  <li>• Suspicious activity detection</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">📧 Email Features</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Welcome emails</li>
                  <li>• Application reminders</li>
                  <li>• Interview reminders</li>
                  <li>• Weekly digest emails</li>
                  <li>• 2FA enabled notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionSetupGuide;

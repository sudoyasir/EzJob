# Email Templates & Notifications

This document covers EzJob's email system, template management, and notification features.

## 📧 Email System Overview

EzJob uses Supabase Auth for transactional emails with custom templates for various user interactions including signup confirmation, password reset, and magic link authentication.

### Email Template Structure

All email templates follow a consistent structure with both HTML and plain text versions:

```
email-templates/
├── README.md              # Template overview and customization guide
├── confirm-signup.html     # HTML version of signup confirmation
├── confirm-signup.txt      # Plain text version of signup confirmation
├── magic-link.html        # HTML version of magic link
├── magic-link.txt         # Plain text version of magic link
├── reset-password.html    # HTML version of password reset
└── reset-password.txt     # Plain text version of password reset
```

## 🎨 Template Design System

### Brand Colors and Styling

All email templates use EzJob's consistent brand palette:

```css
/* Primary brand colors */
--primary-blue: #3b82f6;      /* Main brand color */
--primary-blue-dark: #1d4ed8; /* Hover states */
--success-green: #10b981;     /* Success messages */
--warning-orange: #f59e0b;    /* Warning messages */
--danger-red: #ef4444;        /* Error messages */

/* Neutral colors */
--gray-50: #f9fafb;          /* Light backgrounds */
--gray-100: #f3f4f6;         /* Card backgrounds */
--gray-600: #4b5563;         /* Secondary text */
--gray-900: #111827;         /* Primary text */

/* Typography */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Template Components

#### Header Component
```html
<div style="background-color: #f9fafb; padding: 20px 0;">
  <div style="max-width: 600px; margin: 0 auto; text-align: center;">
    <img src="https://ezjob.sudoyasir.space.com/logo.png" alt="EzJob" style="height: 40px;">
    <h1 style="color: #111827; font-size: 24px; margin: 20px 0 0 0;">EzJob</h1>
    <p style="color: #6b7280; margin: 5px 0 0 0;">Track Your Job Applications</p>
  </div>
</div>
```

#### Button Component
```html
<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600;
            display: inline-block;">
    Confirm Email Address
  </a>
</div>
```

#### Footer Component
```html
<div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin-top: 40px;">
  <p style="color: #6b7280; font-size: 14px; margin: 0;">
    © 2024 EzJob. Made with ❤️ for job seekers.
  </p>
  <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
    If you didn't request this email, you can safely ignore it.
  </p>
</div>
```

## 📨 Email Templates

### 1. Signup Confirmation Email

**Purpose**: Sent when users register to verify their email address.

**Template Variables**:
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .SiteURL }}` - Application URL

**HTML Template** (`confirm-signup.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your EzJob Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
    
    <!-- Header -->
    <div style="background-color: #f9fafb; padding: 20px 0;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
            <h1 style="color: #111827; font-size: 24px; margin: 0;">🎯 EzJob</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Track Your Job Applications</p>
        </div>
    </div>

    <!-- Main Content -->
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px 0;">Welcome to EzJob!</h2>
            
            <p style="color: #374151; margin: 0 0 20px 0;">
                Thanks for signing up! We're excited to help you track your job applications and achieve your career goals.
            </p>
            
            <p style="color: #374151; margin: 0 0 30px 0;">
                To get started, please confirm your email address by clicking the button below:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" 
                   style="background-color: #3b82f6; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 600;
                          display: inline-block;">
                    Confirm Email Address
                </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #3b82f6; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>

            <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
                <h3 style="color: #111827; font-size: 16px; margin: 0 0 15px 0;">What's next?</h3>
                <ul style="color: #374151; margin: 0; padding-left: 20px;">
                    <li>Set up your profile and preferences</li>
                    <li>Upload your resumes for easy application tracking</li>
                    <li>Start logging your job applications</li>
                    <li>Track your progress with our analytics dashboard</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2024 EzJob. Made with ❤️ for job seekers.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
            If you didn't create an EzJob account, you can safely ignore this email.
        </p>
    </div>

</body>
</html>
```

**Plain Text Template** (`confirm-signup.txt`):
```text
Welcome to EzJob!

Thanks for signing up! We're excited to help you track your job applications and achieve your career goals.

To get started, please confirm your email address by clicking this link:
{{ .ConfirmationURL }}

What's next?
- Set up your profile and preferences
- Upload your resumes for easy application tracking
- Start logging your job applications
- Track your progress with our analytics dashboard

If you didn't create an EzJob account, you can safely ignore this email.

---
© 2024 EzJob. Made with ❤️ for job seekers.
```

### 2. Magic Link Email

**Purpose**: Sent for passwordless authentication via email.

**Template Variables**:
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Magic link token
- `{{ .TokenHash }}` - Hashed token for URL
- `{{ .SiteURL }}` - Application URL

**HTML Template** (`magic-link.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to EzJob</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
    
    <!-- Header -->
    <div style="background-color: #f9fafb; padding: 20px 0;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
            <h1 style="color: #111827; font-size: 24px; margin: 0;">🎯 EzJob</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Track Your Job Applications</p>
        </div>
    </div>

    <!-- Main Content -->
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px 0;">Sign in to EzJob</h2>
            
            <p style="color: #374151; margin: 0 0 20px 0;">
                Click the button below to securely sign in to your EzJob account:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink" 
                   style="background-color: #10b981; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 600;
                          display: inline-block;">
                    Sign In to EzJob
                </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink" style="color: #10b981; word-break: break-all;">
                    {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink
                </a>
            </p>

            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin-top: 20px;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                    ⚠️ <strong>Security Note:</strong> This link will expire in 1 hour for your security. If you didn't request this sign-in link, please ignore this email.
                </p>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2024 EzJob. Made with ❤️ for job seekers.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
            This link was requested for {{ .Email }}
        </p>
    </div>

</body>
</html>
```

### 3. Password Reset Email

**Purpose**: Sent when users request a password reset.

**Template Variables**:
- `{{ .Email }}` - User's email address
- `{{ .TokenHash }}` - Reset token hash
- `{{ .SiteURL }}` - Application URL

**HTML Template** (`reset-password.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your EzJob Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
    
    <!-- Header -->
    <div style="background-color: #f9fafb; padding: 20px 0;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
            <h1 style="color: #111827; font-size: 24px; margin: 0;">🎯 EzJob</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Track Your Job Applications</p>
        </div>
    </div>

    <!-- Main Content -->
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px 0;">Reset Your Password</h2>
            
            <p style="color: #374151; margin: 0 0 20px 0;">
                We received a request to reset the password for your EzJob account ({{ .Email }}).
            </p>
            
            <p style="color: #374151; margin: 0 0 30px 0;">
                Click the button below to create a new password:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery" 
                   style="background-color: #ef4444; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 600;
                          display: inline-block;">
                    Reset Password
                </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery" style="color: #ef4444; word-break: break-all;">
                    {{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery
                </a>
            </p>

            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 15px; margin-top: 20px;">
                <p style="color: #991b1b; font-size: 14px; margin: 0;">
                    🔒 <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                </p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
                <h3 style="color: #111827; font-size: 16px; margin: 0 0 10px 0;">Need help?</h3>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    If you're having trouble with password reset, try signing in with a magic link instead or contact our support team.
                </p>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © 2024 EzJob. Made with ❤️ for job seekers.
        </p>
        <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
            This password reset was requested for {{ .Email }}
        </p>
    </div>

</body>
</html>
```

## ⚙️ Email Configuration

### Supabase Email Settings

Configure email templates in your Supabase project:

1. **Navigate to Authentication > Email Templates**
2. **Select template type** (Confirm signup, Magic Link, etc.)
3. **Upload custom templates** or use the built-in editor
4. **Configure sender details**:
   - Sender name: "EzJob"
   - Sender email: "noreply@yourdomain.com"

### SMTP Configuration (Optional)

For custom SMTP servers, configure in Supabase dashboard:

```json
{
  "smtp": {
    "host": "smtp.yourdomain.com",
    "port": 587,
    "user": "noreply@yourdomain.com",
    "pass": "your-smtp-password",
    "admin_email": "admin@yourdomain.com",
    "max_frequency": 3600
  }
}
```

## 🔧 Email Service Integration

### Email Notification Service

```typescript
// src/services/emailNotifications.ts
import { supabase } from "@/integrations/supabase/client";

export class EmailNotificationService {
  /**
   * Send signup confirmation email
   */
  static async sendSignupConfirmation(email: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password: 'temporary', // Will be updated by user
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(`Failed to send signup confirmation: ${error.message}`);
    }
  }

  /**
   * Send magic link for passwordless authentication
   */
  static async sendMagicLink(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(`Failed to send magic link: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw new Error(`Failed to send password reset: ${error.message}`);
    }
  }

  /**
   * Resend confirmation email
   */
  static async resendConfirmation(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(`Failed to resend confirmation: ${error.message}`);
    }
  }
}
```

### Email Template Management Hook

```typescript
// src/hooks/useEmailNotifications.ts
import { useState } from 'react';
import { EmailNotificationService } from '@/services/emailNotifications';
import { toast } from '@/hooks/use-toast';

export const useEmailNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendSignupConfirmation = async (email: string) => {
    setIsLoading(true);
    try {
      await EmailNotificationService.sendSignupConfirmation(email);
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email and click the confirmation link.",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Email",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async (email: string) => {
    setIsLoading(true);
    try {
      await EmailNotificationService.sendMagicLink(email);
      toast({
        title: "Magic Link Sent",
        description: "Check your email for a secure sign-in link.",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Magic Link",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setIsLoading(true);
    try {
      await EmailNotificationService.sendPasswordReset(email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Reset Email",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendSignupConfirmation,
    sendMagicLink,
    sendPasswordReset,
  };
};
```

## 📱 Email Template Testing

### Development Testing

```typescript
// Test email templates in development
const testEmailTemplates = async () => {
  const testEmail = "test@example.com";
  
  try {
    // Test signup confirmation
    console.log("Testing signup confirmation...");
    await EmailNotificationService.sendSignupConfirmation(testEmail);
    
    // Test magic link
    console.log("Testing magic link...");
    await EmailNotificationService.sendMagicLink(testEmail);
    
    // Test password reset
    console.log("Testing password reset...");
    await EmailNotificationService.sendPasswordReset(testEmail);
    
    console.log("All email tests completed successfully!");
  } catch (error) {
    console.error("Email test failed:", error);
  }
};
```

### Email Preview Component

```tsx
// src/components/EmailPreview.tsx
import React from 'react';

interface EmailPreviewProps {
  template: 'signup' | 'magic-link' | 'reset-password';
  variables: Record<string, string>;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ template, variables }) => {
  const getTemplateContent = () => {
    // In a real implementation, you'd load the actual template files
    const templates = {
      signup: {
        subject: "Confirm Your EzJob Account",
        preview: "Welcome to EzJob! Please confirm your email address to get started.",
      },
      'magic-link': {
        subject: "Sign in to EzJob",
        preview: "Your secure sign-in link for EzJob",
      },
      'reset-password': {
        subject: "Reset Your EzJob Password",
        preview: "Reset your password to regain access to your account",
      },
    };

    return templates[template];
  };

  const templateContent = getTemplateContent();

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="border-b pb-2 mb-4">
        <h3 className="font-semibold">{templateContent.subject}</h3>
        <p className="text-sm text-gray-600">{templateContent.preview}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h4 className="font-medium mb-2">Template Variables:</h4>
        <ul className="text-sm space-y-1">
          {Object.entries(variables).map(([key, value]) => (
            <li key={key} className="flex">
              <span className="font-mono text-blue-600">{{ .{key} }}</span>
              <span className="mx-2">→</span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

## 🛡️ Security & Privacy

### Email Security Best Practices

1. **Token Expiry**: All authentication tokens expire within 1 hour
2. **Rate Limiting**: Email sending is rate-limited to prevent abuse
3. **Domain Verification**: Only send emails from verified domains
4. **GDPR Compliance**: Users can opt out of non-essential emails

### Privacy Considerations

```typescript
// Email privacy settings
export interface EmailPreferences {
  marketing: boolean;           // Marketing emails (opt-in)
  security: boolean;           // Security notifications (required)
  applicationReminders: boolean; // Application follow-up reminders
  weeklyDigest: boolean;       // Weekly progress summary
}

// Update user email preferences
const updateEmailPreferences = async (preferences: EmailPreferences) => {
  const { error } = await supabase
    .from('profiles')
    .update({ email_preferences: preferences })
    .eq('id', userId);

  if (error) throw error;
};
```

## 📊 Email Analytics

### Tracking Email Performance

```sql
-- Email engagement analytics (if using custom SMTP)
CREATE TABLE email_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  email_type text NOT NULL,
  event_type text NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked'
  timestamp timestamptz DEFAULT now(),
  metadata jsonb
);

-- Get email performance metrics
SELECT 
  email_type,
  COUNT(*) FILTER (WHERE event_type = 'sent') as sent,
  COUNT(*) FILTER (WHERE event_type = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE event_type = 'opened') as opened,
  COUNT(*) FILTER (WHERE event_type = 'clicked') as clicked,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'opened')::numeric / 
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'delivered'), 0) * 100, 2
  ) as open_rate
FROM email_events
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY email_type;
```

---

This comprehensive email documentation ensures that EzJob's communication with users is professional, secure, and effective across all touchpoints.

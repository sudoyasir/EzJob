# Email Templates Setup Guide for Supabase

This guide explains how to set up the custom email templates for EzJob in your Supabase project.

## 📧 Email Templates Included

1. **Confirm Signup** (`confirm-signup.html` & `.txt`)
   - Used when users register for a new account
   - Clean, welcoming design with feature highlights
   - Branded with EzJob colors and messaging

2. **Reset Password** (`reset-password.html` & `.txt`)
   - Used when users request a password reset
   - Red accent color for urgency/security context
   - Clear security messaging

3. **Magic Link** (`magic-link.html` & `.txt`)
   - Used for passwordless sign-in
   - Green accent color for positive/secure feeling
   - Emphasizes convenience and security

## 🔧 Setting Up in Supabase

### Step 1: Access Email Templates
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your EzJob project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Each Template

#### Confirm Signup Template
1. Click on **"Confirm signup"** template
2. Switch to **"Custom"** from the dropdown
3. Copy the content from `confirm-signup.html` and paste it in the HTML editor
4. For the subject line, use: `Welcome to EzJob - Confirm Your Account`

#### Reset Password Template
1. Click on **"Reset password"** template
2. Switch to **"Custom"** from the dropdown  
3. Copy the content from `reset-password.html` and paste it in the HTML editor
4. For the subject line, use: `Reset Your EzJob Password`

#### Magic Link Template
1. Click on **"Magic link"** template
2. Switch to **"Custom"** from the dropdown
3. Copy the content from `magic-link.html` and paste it in the HTML editor
4. For the subject line, use: `Sign in to EzJob - Magic Link`

### Step 3: Configure SMTP Settings (Optional)
For production, configure custom SMTP settings:

1. Go to **Authentication** → **Settings**
2. Scroll to **SMTP Settings**
3. Enable **"Enable custom SMTP"**
4. Configure with your email provider (Gmail, SendGrid, etc.)

Example Gmail setup:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password
Sender Name: EzJob
Sender Email: noreply@your-domain.com
```

## 🎨 Design Features

### Color Scheme
- **Primary (Signup)**: Blue gradient (`#667eea` to `#764ba2`)
- **Warning (Password)**: Red gradient (`#ef4444` to `#dc2626`)
- **Success (Magic Link)**: Green gradient (`#10b981` to `#059669`)

### Typography
- **Font Stack**: System fonts for best compatibility
- **Headers**: Bold, gradient text effects
- **Body**: Clean, readable sans-serif

### Responsive Design
- Mobile-optimized layouts
- Scalable buttons and text
- Consistent spacing across devices

### Accessibility
- High contrast ratios
- Clear call-to-action buttons
- Semantic HTML structure

## 🔒 Security Features

- **Expiration Warnings**: Clear messaging about link expiration
- **Security Notices**: Prominent security information
- **Safe Ignore**: Instructions for unwanted emails

## 📱 Variables Available

Supabase provides these template variables:

- `{{ .ConfirmationURL }}` - The action link (signup, reset, magic link)
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - The confirmation token
- `{{ .RedirectTo }}` - Redirect URL after action

## 🎯 Customization Tips

### Brand Consistency
- Logo uses "Ez" icon with "EzJob" text
- Consistent gradient backgrounds
- Professional, modern styling

### Content Strategy
- Welcoming, friendly tone
- Clear action items
- Feature highlights in signup emails
- Security-focused messaging

### Performance
- Optimized for email clients
- Fallback text versions included
- Minimal external dependencies

## 🚀 Testing

After setup, test each template:

1. **Signup**: Create a new account
2. **Password Reset**: Use "Forgot Password" flow  
3. **Magic Link**: Try passwordless sign-in

## 📞 Support

If you need help with setup:
- Check Supabase [email templates documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- Ensure all template variables are properly formatted
- Test with different email clients for compatibility

## 🎨 Template Previews

Each template includes:
- ✅ Mobile-responsive design
- ✅ Clear branding and messaging
- ✅ Professional appearance
- ✅ Security-focused content
- ✅ Accessibility features
- ✅ Multiple format support (HTML + Text)

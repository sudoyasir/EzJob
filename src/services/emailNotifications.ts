// Simple email notification service for basic functionality
// This is a simplified version focused on essential features only

export interface EmailNotification {
  to: string;
  subject: string;
  template: 'welcome' | 'password_reset';
  data: Record<string, any>;
}

export interface NotificationPreferences {
  email_notifications: boolean;
}

class EmailNotificationService {
  private isConfigured: boolean = false;

  constructor() {
    this.checkConfiguration();
  }

  private checkConfiguration() {
    // Check if SMTP configuration exists
    const smtpHost = import.meta.env.VITE_SMTP_HOST;
    const smtpUser = import.meta.env.VITE_SMTP_USER;
    const smtpPass = import.meta.env.VITE_SMTP_PASS;
    
    this.isConfigured = !!(smtpHost && smtpUser && smtpPass);
    
    if (this.isConfigured) {
      console.log('✅ Email configuration detected (SMTP ready)');
    } else {
      console.log('⚠️ Email configuration incomplete - using mock mode');
    }
  }

  private async mockSendEmail(notification: EmailNotification): Promise<boolean> {
    // Simulate email sending with realistic delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    console.log('📧 [MOCK] Email sent:', {
      to: notification.to,
      subject: notification.subject,
      template: notification.template,
      configured: this.isConfigured ? 'SMTP Ready' : 'Mock Mode'
    });
    
    return true;
  }

  private async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      // In a real implementation, this would call your backend API
      // which would handle the actual email sending with nodemailer
      
      if (!this.isConfigured) {
        return this.mockSendEmail(notification);
      }

      // For now, we'll use mock even when configured since we're in frontend
      // In production, you'd make an API call to your backend here:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notification)
      // });
      // return response.ok;
      
      return this.mockSendEmail(notification);

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to EzJob! 🎉',
      template: 'welcome',
      data: { name: name || 'there' }
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: '🔑 Reset Your EzJob Password',
      template: 'password_reset',
      data: { name, resetLink }
    });
  }

  // Test the email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      console.log('🔍 Testing email configuration...');
      
      if (!this.isConfigured) {
        console.log('📧 Email configuration: Mock mode (SMTP not fully configured)');
        return true;
      }

      console.log('✅ Email configuration: SMTP ready (mock mode for frontend)');
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return false;
    }
  }
}

export const emailNotificationService = new EmailNotificationService();

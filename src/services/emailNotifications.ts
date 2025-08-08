// Frontend email notification service (mock/API-based)
// Note: Actual email sending should be handled by a backend service

export interface EmailNotification {
  to: string;
  subject: string;
  template: 'welcome' | 'application_reminder' | 'interview_reminder' | 'weekly_digest' | 'password_reset' | 'two_factor_enabled';
  data: Record<string, any>;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  application_reminders: boolean;
  weekly_digest: boolean;
  interview_reminders: boolean;
  offer_notifications: boolean;
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

  async sendTwoFactorEnabledEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: '🔐 Two-Factor Authentication Enabled',
      template: 'two_factor_enabled',
      data: { name }
    });
  }

  async sendApplicationReminder(
    email: string, 
    applicationCount: number,
    oldestApplication?: { company: string; role: string; daysSince: number }
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `📋 Follow up on your ${applicationCount} job applications`,
      template: 'application_reminder',
      data: { 
        applicationCount,
        oldestApplication 
      }
    });
  }

  async sendInterviewReminder(
    email: string,
    company: string,
    role: string,
    interviewDate: Date
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `🎯 Interview reminder: ${role} at ${company}`,
      template: 'interview_reminder',
      data: {
        company,
        role,
        interviewDate: interviewDate.toLocaleDateString(),
        interviewTime: interviewDate.toLocaleTimeString()
      }
    });
  }

  async sendWeeklyDigest(
    email: string,
    stats: {
      applicationsThisWeek: number;
      totalApplications: number;
      interviewsScheduled: number;
      offersReceived: number;
      responseRate: number;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: '📊 Your weekly job search summary',
      template: 'weekly_digest',
      data: stats
    });
  }

  // Schedule notifications based on user preferences
  async scheduleNotifications(
    userId: string,
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      // In production, this would integrate with a job queue system
      // For now, we'll store in localStorage for demo
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(preferences));
      }
      
      console.log('📅 Notifications scheduled for user:', userId);
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
    }
  }

  // Check and send due notifications (would run on a schedule)
  async processScheduledNotifications(): Promise<void> {
    try {
      console.log('🔄 Processing scheduled notifications...');
      
      // This would typically run as a background job/cron
      // For demo purposes, just log
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Scheduled notifications processed');
    } catch (error) {
      console.error('Failed to process notifications:', error);
    }
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

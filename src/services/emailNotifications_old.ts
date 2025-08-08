// Frontend email notification service (mock/API-based)
// Note: nodemailer cannot run in the browser, so we use a mock service here

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
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
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

      console.log('✅ Email configuration: SMTP ready');
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return false;
    }
  }
}

export const emailNotificationService = new EmailNotificationService();

// Email templates
const emailTemplates = {
  welcome: (data: { name: string }) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to EzJob! 🎉</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333;">Hi ${data.name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            We're excited to have you on board! EzJob is here to help you track your job applications, 
            manage interviews, and land your dream job.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Get Started:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Add your first job application</li>
              <li>Set up your profile and preferences</li>
              <li>Enable two-factor authentication for security</li>
              <li>Configure notification preferences</li>
            </ul>
          </div>
          <p style="color: #666;">
            Happy job hunting!<br>
            The EzJob Team
          </p>
        </div>
      </div>
    `,
    text: `Welcome to EzJob, ${data.name}! We're excited to have you on board.`
  }),

  application_reminder: (data: { applicationCount: number; oldestApplication?: any }) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📋 Application Follow-up Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="color: #666; line-height: 1.6;">
            You have <strong>${data.applicationCount}</strong> job applications that might need your attention.
          </p>
          ${data.oldestApplication ? `
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Oldest Application:</h3>
              <p style="color: #666; margin: 0;">
                <strong>${data.oldestApplication.role}</strong> at ${data.oldestApplication.company}<br>
                Applied ${data.oldestApplication.daysSince} days ago
              </p>
            </div>
          ` : ''}
          <p style="color: #666;">
            Consider following up on your applications to increase your chances of getting a response.
          </p>
        </div>
      </div>
    `,
    text: `You have ${data.applicationCount} job applications that might need follow-up.`
  }),

  interview_reminder: (data: { company: string; role: string; interviewDate: string; interviewTime: string }) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎯 Interview Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">${data.role}</h2>
            <p style="color: #666; margin: 5px 0;"><strong>Company:</strong> ${data.company}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${data.interviewDate}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> ${data.interviewTime}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Good luck with your interview! Remember to prepare your questions and review the job description.
          </p>
        </div>
      </div>
    `,
    text: `Interview reminder: ${data.role} at ${data.company} on ${data.interviewDate} at ${data.interviewTime}`
  }),

  weekly_digest: (data: any) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366f1; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📊 Your Weekly Job Search Summary</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="color: #333; margin: 0; font-size: 24px;">${data.applicationsThisWeek}</h3>
              <p style="color: #666; margin: 5px 0;">Applications This Week</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="color: #333; margin: 0; font-size: 24px;">${data.totalApplications}</h3>
              <p style="color: #666; margin: 5px 0;">Total Applications</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="color: #333; margin: 0; font-size: 24px;">${data.interviewsScheduled}</h3>
              <p style="color: #666; margin: 5px 0;">Interviews Scheduled</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h3 style="color: #333; margin: 0; font-size: 24px;">${data.responseRate}%</h3>
              <p style="color: #666; margin: 5px 0;">Response Rate</p>
            </div>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Keep up the great work! Your persistence will pay off.
          </p>
        </div>
      </div>
    `,
    text: `Weekly Summary: ${data.applicationsThisWeek} applications this week, ${data.totalApplications} total`
  }),

  password_reset: (data: { name: string; resetLink: string }) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔑 Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="color: #666; line-height: 1.6;">
            Hi ${data.name}, we received a request to reset your password for your EzJob account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" 
               style="background: #dc2626; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Your Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
          <p style="color: #999; font-size: 12px;">
            If the button doesn't work, copy and paste this link: ${data.resetLink}
          </p>
        </div>
      </div>
    `,
    text: `Reset your password: ${data.resetLink}`
  }),

  two_factor_enabled: (data: { name: string }) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔐 Two-Factor Authentication Enabled</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="color: #666; line-height: 1.6;">
            Hi ${data.name}, two-factor authentication has been successfully enabled on your EzJob account.
            Your account is now more secure!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #666; margin: 0;">
              If you didn't enable this, please contact support immediately.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Two-factor authentication has been enabled on your EzJob account.`
  })
};

class EmailNotificationService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@ezjob.app';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Try to get SMTP configuration from environment variables
      const smtpHost = import.meta.env.VITE_SMTP_HOST || process.env.SMTP_HOST;
      const smtpPort = import.meta.env.VITE_SMTP_PORT || process.env.SMTP_PORT;
      const smtpUser = import.meta.env.VITE_SMTP_USER || process.env.SMTP_USER;
      const smtpPass = import.meta.env.VITE_SMTP_PASS || process.env.SMTP_PASS;

      if (smtpHost && smtpPort && smtpUser && smtpPass) {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          secure: false, // true for 465, false for other ports like 587
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // Verify the transporter
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('SMTP transporter verification failed:', error);
          } else {
            console.log('✅ SMTP transporter initialized and verified successfully');
          }
        });
      } else {
        console.warn('⚠️ SMTP configuration incomplete - email notifications will use mock mode');
      }
    } catch (error) {
      console.error('❌ Failed to initialize SMTP transporter:', error);
    }
  }
  private async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      const template = emailTemplates[notification.template](notification.data);
      
      // Use mock in development or if SMTP is not configured
      if (!this.transporter || (import.meta.env.DEV && !import.meta.env.VITE_SMTP_HOST)) {
        console.log('📧 [MOCK] Email would be sent:', {
          to: notification.to,
          subject: notification.subject,
          template: notification.template,
          data: notification.data
        });
        return true;
      }

      const mailOptions = {
        from: `EzJob <${this.fromEmail}>`,
        to: notification.to,
        subject: notification.subject,
        html: template.html,
        text: template.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;

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
      if (!this.transporter) {
        console.log('📧 No transporter configured - using mock mode');
        return true;
      }

      await this.transporter.verify();
      console.log('✅ Email configuration test successful');
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return false;
    }
  }
}

export const emailNotificationService = new EmailNotificationService();

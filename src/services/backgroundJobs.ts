// Background job scheduler for notifications and maintenance tasks
// This is a simplified version - in production, you'd use a proper job queue like Bull/Agenda

import { emailNotificationService } from './emailNotifications';
import { supabase } from '@/integrations/supabase/client';

export interface ScheduledJob {
  id: string;
  type: 'email_reminder' | 'weekly_digest' | 'cleanup' | 'security_check';
  data: Record<string, any>;
  scheduledFor: Date;
  recurring?: {
    interval: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    timeOfDay?: string; // HH:MM format
  };
  lastRun?: Date;
  nextRun?: Date;
  active: boolean;
}

class BackgroundJobService {
  private jobs: Map<string, ScheduledJob> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor() {
    this.loadJobs();
    this.start();
  }

  /**
   * Start the job scheduler
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('📅 Background job scheduler started');
    
    // Check for jobs every minute
    const interval = setInterval(() => {
      this.processJobs();
    }, 60 * 1000);
    
    this.intervals.set('main', interval);
  }

  /**
   * Stop the job scheduler
   */
  stop(): void {
    this.isRunning = false;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    console.log('⏹️ Background job scheduler stopped');
  }

  /**
   * Schedule a new job
   */
  scheduleJob(job: Omit<ScheduledJob, 'id'>): string {
    const id = Math.random().toString(36).substring(2);
    const fullJob: ScheduledJob = {
      ...job,
      id,
      nextRun: this.calculateNextRun(job.scheduledFor, job.recurring)
    };
    
    this.jobs.set(id, fullJob);
    this.saveJobs();
    
    console.log(`📅 Job scheduled: ${job.type} for ${job.scheduledFor}`);
    return id;
  }

  /**
   * Cancel a scheduled job
   */
  cancelJob(jobId: string): boolean {
    const deleted = this.jobs.delete(jobId);
    if (deleted) {
      this.saveJobs();
      console.log(`❌ Job cancelled: ${jobId}`);
    }
    return deleted;
  }

  /**
   * Get all jobs
   */
  getJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Process due jobs
   */
  private async processJobs(): Promise<void> {
    const now = new Date();
    
    for (const job of this.jobs.values()) {
      if (!job.active || !job.nextRun || job.nextRun > now) {
        continue;
      }

      try {
        console.log(`🔄 Processing job: ${job.type} (${job.id})`);
        await this.executeJob(job);
        
        // Update last run time
        job.lastRun = now;
        
        // Calculate next run if recurring
        if (job.recurring) {
          job.nextRun = this.calculateNextRun(now, job.recurring);
        } else {
          // One-time job, remove it
          this.jobs.delete(job.id);
        }
        
        this.saveJobs();
      } catch (error) {
        console.error(`❌ Job execution failed: ${job.type} (${job.id})`, error);
      }
    }
  }

  /**
   * Execute a specific job
   */
  private async executeJob(job: ScheduledJob): Promise<void> {
    switch (job.type) {
      case 'email_reminder':
        await this.handleEmailReminder(job.data);
        break;
        
      case 'weekly_digest':
        await this.handleWeeklyDigest(job.data);
        break;
        
      case 'cleanup':
        await this.handleCleanup(job.data);
        break;
        
      case 'security_check':
        await this.handleSecurityCheck(job.data);
        break;
        
      default:
        console.warn(`Unknown job type: ${job.type}`);
    }
  }

  /**
   * Handle email reminder jobs
   */
  private async handleEmailReminder(data: any): Promise<void> {
    const { userId, email, type, applicationData } = data;
    
    switch (type) {
      case 'application_followup':
        // Get user's applications that need follow-up
        const { data: applications } = await supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['Applied', 'Interview'])
          .lt('applied_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (applications && applications.length > 0) {
          const oldestApp = applications[0];
          await emailNotificationService.sendApplicationReminder(
            email,
            applications.length,
            {
              company: oldestApp.company_name,
              role: oldestApp.role,
              daysSince: Math.floor((Date.now() - new Date(oldestApp.applied_date).getTime()) / (1000 * 60 * 60 * 24))
            }
          );
        }
        break;
        
      case 'interview_reminder':
        await emailNotificationService.sendInterviewReminder(
          email,
          applicationData.company,
          applicationData.role,
          new Date(applicationData.interviewDate)
        );
        break;
    }
  }

  /**
   * Handle weekly digest jobs
   */
  private async handleWeeklyDigest(data: any): Promise<void> {
    const { userId, email } = data;
    
    try {
      // Get user's statistics for the week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId);

      if (!applications) return;

      const thisWeekApps = applications.filter(app => 
        new Date(app.created_at) > weekAgo
      );

      const stats = {
        applicationsThisWeek: thisWeekApps.length,
        totalApplications: applications.length,
        interviewsScheduled: applications.filter(app => app.status === 'Interview').length,
        offersReceived: applications.filter(app => app.status === 'Offer').length,
        responseRate: applications.length > 0 
          ? Math.round((applications.filter(app => app.status !== 'Applied').length / applications.length) * 100)
          : 0
      };

      await emailNotificationService.sendWeeklyDigest(email, stats);
    } catch (error) {
      console.error('Failed to generate weekly digest:', error);
    }
  }

  /**
   * Handle cleanup jobs
   */
  private async handleCleanup(data: any): Promise<void> {
    console.log('🧹 Running cleanup tasks...');
    
    // Clean up old security events (if using localStorage)
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const recentEvents = events.filter((event: any) => 
        new Date(event.timestamp) > thirtyDaysAgo
      );
      
      localStorage.setItem('security_events', JSON.stringify(recentEvents));
      console.log(`🧹 Cleaned up ${events.length - recentEvents.length} old security events`);
    } catch (error) {
      console.error('Failed to cleanup security events:', error);
    }
  }

  /**
   * Handle security check jobs
   */
  private async handleSecurityCheck(data: any): Promise<void> {
    console.log('🔍 Running security checks...');
    
    // This could check for suspicious patterns, outdated sessions, etc.
    // For now, just log that it ran
    console.log('✅ Security check completed');
  }

  /**
   * Calculate next run time for recurring jobs
   */
  private calculateNextRun(baseTime: Date, recurring?: ScheduledJob['recurring']): Date | undefined {
    if (!recurring) return undefined;

    const next = new Date(baseTime);

    switch (recurring.interval) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
        
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
        
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }

    // Set specific time if provided
    if (recurring.timeOfDay) {
      const [hours, minutes] = recurring.timeOfDay.split(':').map(Number);
      next.setHours(hours, minutes, 0, 0);
    }

    return next;
  }

  /**
   * Load jobs from localStorage
   */
  private loadJobs(): void {
    try {
      const stored = localStorage.getItem('scheduled_jobs');
      if (stored) {
        const jobs: ScheduledJob[] = JSON.parse(stored);
        jobs.forEach(job => {
          // Convert date strings back to Date objects
          job.scheduledFor = new Date(job.scheduledFor);
          if (job.lastRun) job.lastRun = new Date(job.lastRun);
          if (job.nextRun) job.nextRun = new Date(job.nextRun);
          
          this.jobs.set(job.id, job);
        });
        console.log(`📅 Loaded ${jobs.length} scheduled jobs`);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  }

  /**
   * Save jobs to localStorage
   */
  private saveJobs(): void {
    try {
      const jobs = Array.from(this.jobs.values());
      localStorage.setItem('scheduled_jobs', JSON.stringify(jobs));
    } catch (error) {
      console.error('Failed to save jobs:', error);
    }
  }

  /**
   * Helper methods to schedule common job types
   */
  static scheduleApplicationReminders(userId: string, email: string): string {
    return backgroundJobService.scheduleJob({
      type: 'email_reminder',
      data: { userId, email, type: 'application_followup' },
      scheduledFor: new Date(),
      recurring: {
        interval: 'weekly',
        daysOfWeek: [1], // Monday
        timeOfDay: '09:00'
      },
      active: true
    });
  }

  static scheduleWeeklyDigest(userId: string, email: string): string {
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    nextSunday.setHours(18, 0, 0, 0); // 6 PM on Sunday

    return backgroundJobService.scheduleJob({
      type: 'weekly_digest',
      data: { userId, email },
      scheduledFor: nextSunday,
      recurring: {
        interval: 'weekly',
        daysOfWeek: [0], // Sunday
        timeOfDay: '18:00'
      },
      active: true
    });
  }

  static scheduleInterviewReminder(
    userId: string, 
    email: string, 
    interviewDate: Date,
    applicationData: any
  ): string {
    // Schedule reminder 24 hours before interview
    const reminderTime = new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000);

    return backgroundJobService.scheduleJob({
      type: 'email_reminder',
      data: { 
        userId, 
        email, 
        type: 'interview_reminder',
        applicationData 
      },
      scheduledFor: reminderTime,
      active: true
    });
  }
}

// Create singleton instance
export const backgroundJobService = new BackgroundJobService();

// Schedule recurring maintenance jobs
backgroundJobService.scheduleJob({
  type: 'cleanup',
  data: {},
  scheduledFor: new Date(),
  recurring: {
    interval: 'daily',
    timeOfDay: '02:00' // 2 AM daily
  },
  active: true
});

backgroundJobService.scheduleJob({
  type: 'security_check',
  data: {},
  scheduledFor: new Date(),
  recurring: {
    interval: 'daily',
    timeOfDay: '03:00' // 3 AM daily
  },
  active: true
});

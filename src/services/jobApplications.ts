import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];
export type JobApplicationUpdate = Database['public']['Tables']['job_applications']['Update'];
export type JobApplicationStatus = Database['public']['Enums']['job_application_status'];

export class JobApplicationService {
  // Get all job applications for the current user
  static async getApplications(): Promise<JobApplication[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return data || [];
  }

  // Get a single job application by ID
  static async getApplication(id: string): Promise<JobApplication | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch application: ${error.message}`);
    }

    return data;
  }

  // Create a new job application
  static async createApplication(application: Omit<JobApplicationInsert, 'user_id'>): Promise<JobApplication> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          ...application,
          user_id: user.id,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create application: ${error.message}`);
    }

    return data;
  }

  // Update an existing job application
  static async updateApplication(id: string, updates: JobApplicationUpdate): Promise<JobApplication> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update application: ${error.message}`);
    }

    return data;
  }

  // Delete a job application
  static async deleteApplication(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }

  // Get application statistics
  static async getApplicationStats(): Promise<{
    total: number;
    interviews: number;
    offers: number;
    responseRate: number;
  }> {
    const applications = await this.getApplications();
    
    const total = applications.length;
    const interviews = applications.filter(app => app.status === 'Interview').length;
    const offers = applications.filter(app => app.status === 'Offer').length;
    const responded = applications.filter(app => 
      app.status === 'Interview' || app.status === 'Offer' || app.status === 'Rejected'
    ).length;
    
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    return {
      total,
      interviews,
      offers,
      responseRate,
    };
  }
}

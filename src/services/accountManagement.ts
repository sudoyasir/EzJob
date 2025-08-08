import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface ExportedData {
  exportDate: string;
  account: {
    id: string;
    email: string | undefined;
    createdAt: string | undefined;
    lastSignIn: string | undefined;
    emailConfirmed: string | undefined;
  };
  profile: any;
  jobApplications: any[];
  resumes: any[];
  preferences: any;
  notifications: any;
}

export class AccountManagementService {
  
  /**
   * Export all user data as a downloadable JSON file
   */
  static async exportUserData(
    user: User, 
    preferences: any, 
    notifications: any,
    onProgress?: (step: string) => void
  ): Promise<void> {
    try {
      onProgress?.("Gathering profile data...");
      
      // Gather all user data
      const [profileData, applicationsData, resumesData] = await Promise.all([
        // Get profile data
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        
        // Get job applications
        supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user.id),
        
        // Get resumes
        supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
      ]);

      onProgress?.("Compiling export data...");

      // Compile export data
      const exportData: ExportedData = {
        exportDate: new Date().toISOString(),
        account: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in_at,
          emailConfirmed: user.email_confirmed_at
        },
        profile: profileData.data || {},
        jobApplications: applicationsData.data || [],
        resumes: resumesData.data || [],
        preferences: preferences,
        notifications: notifications
      };

      onProgress?.("Preparing download...");

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ezjob-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Export error:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  /**
   * Delete all user data and account
   * 
   * Note: This implementation removes all user data but cannot delete the auth user
   * from the client side. The auth user remains in Supabase but has no associated data.
   * 
   * For production environments, consider implementing a server-side endpoint that uses
   * Supabase Admin API to fully delete the auth user:
   * 
   * ```javascript
   * // Server-side example (Node.js/Edge Function)
   * const { createClient } = require('@supabase/supabase-js')
   * const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY)
   * await supabaseAdmin.auth.admin.deleteUser(userId)
   * ```
   */
  static async deleteUserAccount(user: User): Promise<void> {
    try {
      // Delete user data in order
      // 1. Delete job applications
      await supabase
        .from('job_applications')
        .delete()
        .eq('user_id', user.id);

      // 2. Delete resumes
      await supabase
        .from('resumes')
        .delete()
        .eq('user_id', user.id);

      // 3. Delete user profile completely
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      // 4. Delete storage files (avatars and documents)
      await this.deleteUserStorageFiles(user.id);

      // 5. Sign out the user immediately
      // This approach avoids email confirmations while ensuring clean data removal
      await supabase.auth.signOut();

    } catch (error: any) {
      console.error('Delete account error:', error);
      throw new Error('Failed to delete account. Some data may have been removed.');
    }
  }

  /**
   * Delete all user files from storage buckets
   */
  private static async deleteUserStorageFiles(userId: string): Promise<void> {
    try {
      // Delete avatar files
      const { data: avatarFiles } = await supabase.storage
        .from('avatars')
        .list(userId);
      
      if (avatarFiles && avatarFiles.length > 0) {
        const avatarPaths = avatarFiles.map(file => `${userId}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(avatarPaths);
      }

      // Delete document files
      const { data: documents } = await supabase.storage
        .from('documents')
        .list(userId);
      
      if (documents && documents.length > 0) {
        const docPaths = documents.map(doc => `${userId}/${doc.name}`);
        await supabase.storage
          .from('documents')
          .remove(docPaths);
      }
    } catch (error: any) {
      console.error('Error deleting storage files:', error);
      // Don't throw here - we want to continue with account deletion even if file deletion fails
    }
  }

  /**
   * Get data export summary for display to user
   */
  static async getDataExportSummary(userId: string): Promise<{
    applicationsCount: number;
    resumesCount: number;
    storageFilesCount: number;
  }> {
    try {
      const [applicationsData, resumesData, avatarFiles, documentFiles] = await Promise.all([
        supabase
          .from('job_applications')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        supabase
          .from('resumes')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        supabase.storage
          .from('avatars')
          .list(userId),
        
        supabase.storage
          .from('documents')
          .list(userId)
      ]);

      return {
        applicationsCount: applicationsData.count || 0,
        resumesCount: resumesData.count || 0,
        storageFilesCount: (avatarFiles.data?.length || 0) + (documentFiles.data?.length || 0)
      };
    } catch (error: any) {
      console.error('Error getting data summary:', error);
      return {
        applicationsCount: 0,
        resumesCount: 0,
        storageFilesCount: 0
      };
    }
  }
}

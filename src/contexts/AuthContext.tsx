import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { emailNotificationService } from '@/services/emailNotifications';
import { rateLimitService, securityEventService } from '@/services/rateLimitService';
import { backgroundJobService } from '@/services/backgroundJobs';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Log security events
      if (event === 'SIGNED_IN' && session?.user) {
        await securityEventService.logSecurityEvent({
          type: 'login_success',
          userId: session.user.id,
          success: true,
          metadata: { method: 'email' }
        });

        // Check for suspicious activity
        const suspiciousActivity = await securityEventService.checkSuspiciousActivity(session.user.id);
        if (suspiciousActivity.suspicious) {
          toast.warning(`Security Alert: ${suspiciousActivity.reason}. ${suspiciousActivity.recommendation}`);
        }

        // Schedule notification jobs for new users
        const isNewUser = new Date(session.user.created_at!).getTime() > Date.now() - 5000; // Created within last 5 seconds
        if (isNewUser) {
          // Schedule weekly digest
          backgroundJobService.scheduleJob({
            type: 'weekly_digest',
            data: { userId: session.user.id, email: session.user.email },
            scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
            recurring: {
              interval: 'weekly',
              daysOfWeek: [0], // Sunday
              timeOfDay: '18:00'
            },
            active: true
          });

          // Schedule application reminders
          backgroundJobService.scheduleJob({
            type: 'email_reminder',
            data: { userId: session.user.id, email: session.user.email, type: 'application_followup' },
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            recurring: {
              interval: 'weekly',
              daysOfWeek: [1], // Monday
              timeOfDay: '09:00'
            },
            active: true
          });
        }
      }

      if (event === 'SIGNED_OUT') {
        await securityEventService.logSecurityEvent({
          type: 'login_attempt',
          success: false,
          metadata: { reason: 'signed_out' }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Rate limit check
    const rateLimitResult = rateLimitService.checkRateLimit(
      `oauth:google:${window.location.hostname}`,
      rateLimitService.constructor.prototype.defaultConfig
    );

    if (!rateLimitResult.allowed) {
      const resetTimeMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / (1000 * 60));
      throw new Error(`Too many login attempts. Try again in ${resetTimeMinutes} minutes.`);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      await securityEventService.logSecurityEvent({
        type: 'login_failure',
        success: false,
        metadata: { provider: 'google', error: error.message }
      });
      throw error;
    }
  };

  const signInWithGithub = async () => {
    // Rate limit check
    const rateLimitResult = rateLimitService.checkRateLimit(
      `oauth:github:${window.location.hostname}`,
      rateLimitService.constructor.prototype.defaultConfig
    );

    if (!rateLimitResult.allowed) {
      const resetTimeMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / (1000 * 60));
      throw new Error(`Too many login attempts. Try again in ${resetTimeMinutes} minutes.`);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      await securityEventService.logSecurityEvent({
        type: 'login_failure',
        success: false,
        metadata: { provider: 'github', error: error.message }
      });
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    // Rate limit check
    const rateLimitResult = rateLimitService.checkRateLimit(
      `login:${email}`,
      { windowMs: 15 * 60 * 1000, maxRequests: 5 } // 5 attempts per 15 minutes
    );

    if (!rateLimitResult.allowed) {
      const resetTimeMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / (1000 * 60));
      await securityEventService.logSecurityEvent({
        type: 'login_failure',
        success: false,
        metadata: { email, reason: 'rate_limited' }
      });
      throw new Error(`Too many login attempts. Try again in ${resetTimeMinutes} minutes.`);
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      await securityEventService.logSecurityEvent({
        type: 'login_failure',
        success: false,
        metadata: { email, error: error.message }
      });
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    // Rate limit check
    const rateLimitResult = rateLimitService.checkRateLimit(
      `signup:${email}`,
      { windowMs: 60 * 60 * 1000, maxRequests: 3 } // 3 signups per hour per email
    );

    if (!rateLimitResult.allowed) {
      const resetTimeMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / (1000 * 60));
      throw new Error(`Too many signup attempts. Try again in ${resetTimeMinutes} minutes.`);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    
    if (error) {
      await securityEventService.logSecurityEvent({
        type: 'login_attempt',
        success: false,
        metadata: { email, type: 'signup', error: error.message }
      });
      throw error;
    }
    
    // Send welcome email
    try {
      await emailNotificationService.sendWelcomeEmail(email);
    } catch (emailError) {
      console.log('Welcome email failed, but signup succeeded');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JobApplicationService } from '@/services/jobApplications';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  totalApplications: number;
}

export interface WeeklyActivity {
  date: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
  applicationsCount: number;
}

export const useStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    totalApplications: 0,
  });
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStreakFromApplications = useCallback(async () => {
    try {
      setError(null);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          totalApplications: 0,
        });
        return;
      }
      
      const applications = await JobApplicationService.getApplications();
      
      if (applications.length === 0) {
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          totalApplications: 0,
        });
        return;
      }

      // Group applications by date
      const applicationsByDate = new Map<string, number>();
      
      applications.forEach(app => {
        const date = app.applied_date || app.created_at.split('T')[0];
        applicationsByDate.set(date, (applicationsByDate.get(date) || 0) + 1);
      });

      // Sort dates
      const sortedDates = Array.from(applicationsByDate.keys()).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      
      // Check if we have activity today or yesterday (to maintain streak)
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let streakStartDate: Date | null = null;
      
      if (applicationsByDate.has(todayStr)) {
        streakStartDate = today;
        currentStreak = 1;
      } else if (applicationsByDate.has(yesterdayStr)) {
        streakStartDate = yesterday;
        currentStreak = 1;
      }

      // Calculate streak going backwards from start date
      if (streakStartDate) {
        let checkDate = new Date(streakStartDate);
        currentStreak = 0;
        
        while (true) {
          const checkDateStr = checkDate.toISOString().split('T')[0];
          if (applicationsByDate.has(checkDateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Calculate longest streak ever
      for (let i = 0; i < sortedDates.length; i++) {
        tempStreak = 1;
        let currentDate = new Date(sortedDates[i]);
        
        for (let j = i + 1; j < sortedDates.length; j++) {
          const nextDate = new Date(sortedDates[j]);
          const dayDiff = Math.round((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            tempStreak++;
            currentDate = nextDate;
          } else {
            break;
          }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      const lastActivityDate = sortedDates.length > 0 ? sortedDates[0] : null;

      setStreakData({
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        lastActivityDate,
        totalApplications: applications.length,
      });

    } catch (error) {
      console.error('Error calculating streak:', error);
      setError('Failed to calculate streak data');
      setStreakData({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        totalApplications: 0,
      });
    }
  }, []);

  const generateWeeklyActivity = useCallback(async () => {
    try {
      setError(null);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWeeklyActivity([]);
        return;
      }
      
      const applications = await JobApplicationService.getApplications();
      
      // Group applications by date
      const applicationsByDate = new Map<string, number>();
      applications.forEach(app => {
        const date = app.applied_date || app.created_at.split('T')[0];
        applicationsByDate.set(date, (applicationsByDate.get(date) || 0) + 1);
      });

      // Generate last 7 days
      const today = new Date();
      const weeklyData: WeeklyActivity[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const isToday = i === 0;
        const isFuture = i < 0;
        const applicationsCount = applicationsByDate.get(dateStr) || 0;
        const completed = applicationsCount > 0;
        
        weeklyData.push({
          date: dateStr,
          completed,
          isToday,
          isFuture,
          applicationsCount,
        });
      }
      
      setWeeklyActivity(weeklyData);
    } catch (error) {
      console.error('Error generating weekly activity:', error);
      setError('Failed to generate weekly activity');
      setWeeklyActivity([]);
    }
  }, []);

  const refreshStreak = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      calculateStreakFromApplications(),
      generateWeeklyActivity(),
    ]);
    setLoading(false);
  }, [calculateStreakFromApplications, generateWeeklyActivity]);

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  // Listen for changes in job applications
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Clean up any existing subscription
      if (channel) {
        supabase.removeChannel(channel);
      }

      channel = supabase
        .channel(`streak-updates-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'job_applications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Job application change detected:', payload);
            // Add a small delay to ensure the database transaction is complete
            setTimeout(() => {
              refreshStreak();
            }, 100);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_streaks',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('User streak change detected:', payload);
            // Add a small delay to ensure the database transaction is complete
            setTimeout(() => {
              refreshStreak();
            }, 100);
          }
        )
        .subscribe((status) => {
          console.log('Streak subscription status:', status);
        });
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshStreak]);

  return {
    streak: {
      current: streakData.currentStreak,
      longest: streakData.longestStreak,
      lastActivity: streakData.lastActivityDate,
      totalApplications: streakData.totalApplications,
    },
    weeklyActivity,
    loading,
    error,
    refreshStreak,
  };
};

// Helper functions for UI
export const getStreakLevel = (streak: number): string => {
  if (streak >= 100) return 'Legendary';
  if (streak >= 50) return 'Master';
  if (streak >= 30) return 'Expert';
  if (streak >= 21) return 'Pro';
  if (streak >= 14) return 'Advanced';
  if (streak >= 7) return 'Committed';
  if (streak >= 3) return 'Rising';
  return 'Beginner';
};

export const getStreakEmoji = (streak: number): string => {
  if (streak >= 100) return '🏆';
  if (streak >= 50) return '💎';
  if (streak >= 30) return '👑';
  if (streak >= 21) return '⭐';
  if (streak >= 14) return '🔥';
  if (streak >= 7) return '💪';
  if (streak >= 3) return '🌟';
  return '✨';
};

export const getStreakColor = (streak: number): string => {
  if (streak >= 30) return 'from-purple-500 to-pink-500';
  if (streak >= 21) return 'from-blue-500 to-purple-500';
  if (streak >= 14) return 'from-orange-500 to-red-500';
  if (streak >= 7) return 'from-yellow-500 to-orange-500';
  if (streak >= 3) return 'from-green-500 to-blue-500';
  return 'from-gray-400 to-gray-500';
};

import React, { createContext, useContext, useCallback } from 'react';
import { useStreak } from '@/hooks/useStreak';

interface StreakContextType {
  streak: {
    current: number;
    longest: number;
    lastActivity: string | null;
    totalApplications: number;
  };
  weeklyActivity: Array<{
    date: string;
    completed: boolean;
    isToday: boolean;
    isFuture: boolean;
    applicationsCount: number;
  }>;
  loading: boolean;
  error: string | null;
  refreshStreak: () => Promise<void>;
  triggerUpdate: () => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const StreakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const streakData = useStreak();
  
  // Additional trigger function for manual updates
  const triggerUpdate = useCallback(() => {
    console.log('Manual streak update triggered');
    streakData.refreshStreak();
  }, [streakData.refreshStreak]);

  const contextValue = {
    ...streakData,
    triggerUpdate,
  };

  return (
    <StreakContext.Provider value={contextValue}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreakContext = () => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreakContext must be used within a StreakProvider');
  }
  return context;
};

// Hook specifically for triggering updates after application creation
export const useStreakTrigger = () => {
  const context = useContext(StreakContext);
  return {
    triggerUpdate: context?.triggerUpdate || (() => {}),
  };
};

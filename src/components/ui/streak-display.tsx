import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Trophy, Star, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayStatus {
  date: Date;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

interface WeeklyActivity {
  date: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
  applicationsCount: number;
}

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak?: number;
  variant?: 'compact' | 'full' | 'minimal';
  showWeekly?: boolean;
  className?: string;
  weeklyData?: WeeklyActivity[];
}

export function StreakDisplay({ 
  currentStreak, 
  longestStreak = 0,
  variant = 'compact',
  showWeekly = true,
  className 
}: StreakDisplayProps) {
  // Generate last 7 days for weekly view
  const generateWeeklyData = (): DayStatus[] => {
    const today = new Date();
    const days: DayStatus[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const isToday = i === 0;
      const isFuture = i < 0;
      // Mock completion data - in real app, this would come from props/API
      const completed = !isFuture && (i === 0 || Math.random() > 0.3);
      
      days.push({
        date,
        completed,
        isToday,
        isFuture
      });
    }
    
    return days;
  };

  const weeklyData = generateWeeklyData();
  const streakLevel = getStreakLevel(currentStreak);
  const streakEmoji = getStreakEmoji(currentStreak);

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1">
          <span className="text-lg">{streakEmoji}</span>
          <span className="font-bold text-orange-500">{currentStreak}</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn(
        "p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800 shadow-lg",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Flame icon with glow effect */}
            <div className="relative">
              {/* <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-pulse"></div> */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Flame className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {currentStreak}
                </span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs px-2 py-0.5">
                  {streakLevel}
                </Badge>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                Day Streak
              </p>
            </div>
          </div>

          {longestStreak > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="h-3 w-3" />
                <span>Best: {longestStreak}</span>
              </div>
            </div>
          )}
        </div>

        {/* Weekly progress dots */}
        {showWeekly && (
          <div className="mt-4 pt-3 border-t border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">This Week</span>
              <div className="flex gap-1">
                {weeklyData.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full border-2 transition-all duration-200",
                      day.completed
                        ? "bg-orange-500 border-orange-500 shadow-sm"
                        : day.isToday
                        ? "bg-orange-200 border-orange-400 animate-slow-pulse"
                        : day.isFuture
                        ? "bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                        : "bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    )}
                    title={day.date.toLocaleDateString()}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-pink-950/30 border-orange-200 dark:border-orange-800 shadow-xl overflow-hidden",
      className
    )}>
      <div className="text-center space-y-4">
        {/* Main streak display */}
        <div className="relative flex justify-center">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-20 scale-125 animate-pulse max-w-20 max-h-20 mx-auto"></div>
          
          {/* Main circle */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
            <div className="absolute inset-1 bg-gradient-to-br from-orange-300 to-red-400 rounded-full flex items-center justify-center">
              <Flame className="h-8 w-8 text-white animate-pulse" />
            </div>
            {/* Sparkle effects */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-300 rounded-full animate-ping delay-150"></div>
          </div>
        </div>

        {/* Streak number and level */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
              {currentStreak}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Day{currentStreak !== 1 ? 's' : ''}
              </span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                {streakLevel}
              </Badge>
            </div>
          </div>
          
          <p className="text-orange-700 dark:text-orange-300 font-medium">
            Keep the momentum going! 🚀
          </p>
        </div>

        {/* Weekly calendar */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">This Week</span>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {day.date.toLocaleDateString('en', { weekday: 'short' })[0]}
                </div>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    day.completed
                      ? "bg-orange-500 border-orange-500 shadow-lg scale-110"
                      : day.isToday
                      ? "bg-orange-200 border-orange-400 animate-slow-pulse"
                      : day.isFuture
                      ? "bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                      : "bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  )}
                >
                  {day.completed && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                  {day.isToday && !day.completed && (
                    <Target className="h-3 w-3 text-orange-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        {longestStreak > 0 && (
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-1 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Best:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{longestStreak}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function getStreakLevel(streak: number): string {
  if (streak >= 100) return 'Legendary';
  if (streak >= 50) return 'Master';
  if (streak >= 30) return 'Expert';
  if (streak >= 21) return 'Pro';
  if (streak >= 14) return 'Advanced';
  if (streak >= 7) return 'Committed';
  if (streak >= 3) return 'Rising';
  return 'Beginner';
}

function getStreakEmoji(streak: number): string {
  if (streak >= 100) return '🏆';
  if (streak >= 50) return '💎';
  if (streak >= 30) return '👑';
  if (streak >= 21) return '⭐';
  if (streak >= 14) return '🔥';
  if (streak >= 7) return '�';
  if (streak >= 3) return '🌟';
  return '✨';
}

// Hook for streak management
export function useStreak() {
  const [currentStreak, setCurrentStreak] = React.useState(7); // Mock data
  const [longestStreak, setLongestStreak] = React.useState(12); // Mock data

  // In a real app, you'd fetch this from your API
  const updateStreak = React.useCallback(() => {
    // Logic to update streak based on user activity
    console.log('Updating streak...');
  }, []);

  return {
    currentStreak,
    longestStreak,
    updateStreak
  };
}

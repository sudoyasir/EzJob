import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStreakContext } from '@/contexts/StreakContext';

interface StreakDisplayProps {
  variant?: 'compact' | 'full' | 'minimal';
  showWeekly?: boolean;
  className?: string;
}

export function StreakDisplay({ 
  variant = 'compact',
  showWeekly = true,
  className
}: StreakDisplayProps) {
  const { streak, weeklyActivity, loading, error } = useStreakContext();

  if (loading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 w-16 bg-muted rounded"></div>
              <div className="h-4 w-20 bg-muted rounded"></div>
            </div>
          </div>
          {showWeekly && (
            <div className="flex gap-1 justify-end">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-muted rounded-full"></div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-4 border-destructive/50", className)}>
        <div className="text-center text-sm text-destructive">
          Failed to load streak data
        </div>
      </Card>
    );
  }

  const streakLevel = getStreakLevel(streak.current);
  const streakEmoji = getStreakEmoji(streak.current);

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1">
          <span className="text-lg">{streakEmoji}</span>
          <span className="font-bold text-primary">{streak.current}</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn(
        "p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 transition-all duration-200 hover:shadow-md",
        className
      )}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Flame icon with glow effect */}
            <div className="relative flex-shrink-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <span className="text-xl sm:text-2xl font-bold text-primary truncate">
                  {streak.current}
                </span>
                <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0">
                  {streakLevel}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Day Streak
              </p>
            </div>
          </div>

          {streak.longest > 0 && (
            <div className="text-right flex-shrink-0 hidden sm:block">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="h-3 w-3" />
                <span>Best: {streak.longest}</span>
              </div>
            </div>
          )}
        </div>

        {/* Weekly progress dots */}
        {showWeekly && weeklyActivity.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground font-medium flex-shrink-0">This Week</span>
              <div className="flex gap-0.5 sm:gap-1 overflow-x-auto">
                {weeklyActivity.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 transition-all duration-200 flex-shrink-0",
                      day.completed
                        ? "bg-primary border-primary shadow-sm"
                        : day.isToday
                        ? "bg-primary/30 border-primary/50 animate-slow-pulse"
                        : day.isFuture
                        ? "bg-muted border-muted-foreground/20"
                        : "bg-muted border-muted-foreground/30"
                    )}
                    title={`${day.date}: ${day.applicationsCount} applications`}
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
      "p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 border-primary/20 shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl",
      className
    )}>
      <div className="text-center space-y-4 sm:space-y-6">
        {/* Main streak display */}
        <div className="relative flex justify-center">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full opacity-50 scale-125 animate-pulse w-16 h-16 sm:w-20 sm:h-20 mx-auto"></div>
          
          {/* Main circle */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-2xl">
            <div className="absolute inset-1 bg-gradient-to-br from-primary/90 to-primary/70 rounded-full flex items-center justify-center">
              <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
            {/* Sparkle effects */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-ping delay-150"></div>
          </div>
        </div>

        {/* Streak number and level */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl font-bold text-primary">
              {streak.current}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                Day{streak.current !== 1 ? 's' : ''}
              </span>
              <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 text-center">
                {streakLevel}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Keep the momentum going! 🚀
          </p>
        </div>

        {/* Weekly calendar */}
        {showWeekly && weeklyActivity.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">This Week</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2 max-w-xs mx-auto">
              {weeklyActivity.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1 sm:mb-2">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })[0]}
                  </div>
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 mx-auto",
                      day.completed
                        ? "bg-primary border-primary shadow-lg scale-110"
                        : day.isToday
                        ? "bg-primary/20 border-primary/50 animate-slow-pulse"
                        : day.isFuture
                        ? "bg-muted border-muted-foreground/20"
                        : "bg-muted border-muted-foreground/30"
                    )}
                    title={`${day.date}: ${day.applicationsCount} applications`}
                  >
                    {day.completed && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-foreground rounded-full"></div>
                    )}
                    {day.isToday && !day.completed && (
                      <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-2 sm:pt-3 border-t border-border">
            {streak.longest > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">Best Streak:</span>
                <span className="font-bold text-primary">{streak.longest}</span>
              </div>
            )}
            
            {streak.totalApplications > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total Apps:</span>
                <span className="font-semibold text-foreground">{streak.totalApplications}</span>
              </div>
            )}
          </div>
        </div>
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
  if (streak >= 7) return '💪';
  if (streak >= 3) return '🌟';
  return '✨';
}

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  rows?: number;
  showAvatar?: boolean;
  showHeader?: boolean;
  variant?: "default" | "compact" | "card";
}

export function LoadingState({ 
  className, 
  rows = 3, 
  showAvatar = false, 
  showHeader = true,
  variant = "default" 
}: LoadingStateProps) {
  if (variant === "card") {
    return (
      <Card className={cn("p-6", className)}>
        <div className="space-y-4">
          {showHeader && (
            <div className="flex items-center space-x-4">
              {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          )}
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <Skeleton 
                key={i} 
                className={cn(
                  "h-3",
                  i === rows - 1 ? "w-2/3" : "w-full"
                )}
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "h-3",
              i === 0 ? "w-3/4" : i === rows - 1 ? "w-1/2" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center space-x-4">
          {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "h-3",
              i === rows - 1 ? "w-2/3" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-primary/30 border-t-primary",
        sizeClasses[size]
      )} />
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  loadingText = "Loading...",
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

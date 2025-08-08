import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ApplicationCardSkeleton = () => {
  return (
    <Card className="p-6 bg-card border-border relative overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between relative">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="space-y-3 flex-1">
              {/* Company and role */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 bg-muted animate-pulse" />
                <Skeleton className="h-5 w-32 bg-muted animate-pulse" />
              </div>
              
              {/* Location and date */}
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24 bg-muted animate-pulse" />
                <Skeleton className="h-4 w-32 bg-muted animate-pulse" />
              </div>
            </div>
            
            {/* Status badge area */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-16 rounded-full bg-muted animate-pulse" />
              <Skeleton className="h-4 w-20 bg-muted animate-pulse" />
            </div>
          </div>
          
          {/* Notes preview */}
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full bg-muted animate-pulse" />
            <Skeleton className="h-4 w-3/4 bg-muted animate-pulse" />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 mt-4 md:mt-0 md:ml-4">
          <Skeleton className="h-8 w-16 bg-muted animate-pulse" />
          <Skeleton className="h-8 w-16 bg-muted animate-pulse" />
          <Skeleton className="h-8 w-8 bg-muted animate-pulse" />
        </div>
      </div>
    </Card>
  );
};

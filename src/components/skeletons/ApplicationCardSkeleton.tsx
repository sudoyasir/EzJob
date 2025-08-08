import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ApplicationCardSkeleton = () => {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-96 mt-3" />
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </Card>
  );
};

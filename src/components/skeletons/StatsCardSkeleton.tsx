import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const StatsCardSkeleton = () => {
  return (
    <Card className="p-6 bg-card border-border">
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-24" />
    </Card>
  );
};

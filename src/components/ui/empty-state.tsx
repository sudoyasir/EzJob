import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  variant?: "default" | "card" | "inline";
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  variant = "default",
  size = "md"
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "p-6",
      icon: "w-12 h-12",
      iconWrapper: "w-16 h-16 mb-4",
      title: "text-lg",
      description: "text-sm",
      spacing: "space-y-3"
    },
    md: {
      container: "p-8 lg:p-12",
      icon: "w-16 h-16",
      iconWrapper: "w-24 h-24 mb-6",
      title: "text-2xl",
      description: "text-base",
      spacing: "space-y-4"
    },
    lg: {
      container: "p-12 lg:p-16",
      icon: "w-20 h-20",
      iconWrapper: "w-32 h-32 mb-8",
      title: "text-3xl",
      description: "text-lg",
      spacing: "space-y-6"
    }
  };

  const classes = sizeClasses[size];

  const content = (
    <div className={cn("text-center", classes.spacing)}>
      {/* Icon */}
      <div className={cn(
        "mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center",
        classes.iconWrapper
      )}>
        <Icon className={cn(classes.icon, "text-primary")} />
      </div>

      {/* Content */}
      <div className={classes.spacing}>
        <h3 className={cn("font-bold text-card-foreground", classes.title)}>
          {title}
        </h3>
        <p className={cn("text-muted-foreground leading-relaxed max-w-md mx-auto", classes.description)}>
          {description}
        </p>
      </div>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {actionLabel && onAction && (
            <Button 
              onClick={onAction}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
              size={size === "sm" ? "sm" : "lg"}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              variant="outline" 
              onClick={onSecondaryAction}
              className="w-full sm:w-auto border-border hover:bg-accent hover:text-accent-foreground"
              size={size === "sm" ? "sm" : "lg"}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <Card className={cn(
        classes.container,
        "bg-gradient-to-br from-muted/30 to-muted/10 border-dashed border-2",
        className
      )}>
        {content}
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("py-8", className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-[400px] flex items-center justify-center",
      classes.container,
      className
    )}>
      <div className="w-full max-w-md">
        {content}
      </div>
    </div>
  );
}

// Specific empty state variants for common use cases
export const NoApplicationsEmptyState = (props: Partial<EmptyStateProps>) => (
  <EmptyState
    title="No Applications Yet"
    description="Start tracking your job applications to see them here. Every application brings you closer to your dream job!"
    {...props}
  />
);

export const NoDataEmptyState = (props: Partial<EmptyStateProps>) => (
  <EmptyState
    title="No Data Available"
    description="There's no data to display right now. Add some content to get started."
    variant="card"
    size="md"
    {...props}
  />
);

export const SearchEmptyState = (props: Partial<EmptyStateProps>) => (
  <EmptyState
    title="No Results Found"
    description="We couldn't find anything matching your search. Try adjusting your filters or search terms."
    variant="inline"
    size="sm"
    {...props}
  />
);

import React from 'react';

export const Skeleton = ({ className = "", variant = "default", ...props }) => {
  const variants = {
    default: "animate-pulse rounded-md bg-muted",
    shimmer: "animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer",
    pulse: "animate-pulse rounded-md bg-muted/80"
  };
  
  return (
    <div
      className={`${variants[variant]} ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = ({ variant = "default" }) => (
  <div className="border rounded-lg p-6 space-y-4">
    <div className="flex gap-4">
      <Skeleton variant={variant} className="w-20 h-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton variant={variant} className="h-6 w-3/4" />
        <Skeleton variant={variant} className="h-4 w-1/2" />
        <Skeleton variant={variant} className="h-4 w-2/3" />
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3, variant = "default" }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} variant={variant} />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-4 gap-4 p-4 border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 p-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-4 w-full" />
        ))}
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-20 w-full" />
    </div>
    <Skeleton className="h-10 w-full" />
  </div>
);

export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid md:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    ))}
  </div>
);
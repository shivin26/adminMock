import React from 'react';
import { Store, CreditCard, ShieldCheck, Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Skeleton } from '../feedback/Skeleton';
import { ActivityItem } from '../../types/dashboard';

export interface RecentActivitiesFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

export const RecentActivitiesFeed: React.FC<RecentActivitiesFeedProps> = ({ activities, isLoading }) => {
  if (isLoading || !activities) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getCategoryIcon = (category: ActivityItem['category']) => {
    switch (category) {
      case 'vendor':
        return <Store className="h-4 w-4 text-[var(--gold)]" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-[var(--primary)]" />;
      case 'security':
        return <ShieldCheck className="h-4 w-4 text-emerald-700" />;
      default:
        return <Cpu className="h-4 w-4 text-indigo-700" />;
    }
  };

  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="text-xl">Platform Activity Audit Feed</CardTitle>
        <CardDescription>REAL-TIME AUDIT LOG TRAIL</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
          {activities.map((act) => (
            <div key={act.id} className="relative flex items-start justify-between gap-4">
              {/* Timeline Icon Marker */}
              <div className="absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)] shadow-xs">
                {getCategoryIcon(act.category)}
              </div>

              <div>
                <h5 className="font-body text-xs font-semibold text-[var(--foreground)]">
                  {act.title}
                </h5>
                <p className="text-xs font-body text-[var(--muted-foreground)] mt-0.5">
                  {act.description}
                </p>
              </div>

              <span className="font-mono text-[10px] text-[var(--gold)] shrink-0 font-medium">
                {act.timestamp}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

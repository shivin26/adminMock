import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../feedback/Skeleton';
import { RecentVendor } from '../../types/dashboard';

export interface RecentVendorsListProps {
  vendors?: RecentVendor[];
  isLoading?: boolean;
}

export const RecentVendorsList: React.FC<RecentVendorsListProps> = ({ vendors, isLoading }) => {
  if (isLoading || !vendors) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="text-xl">Newly Onboarded Vendors</CardTitle>
        <CardDescription>RECENTLY REGISTERED LOCAL STORES</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between p-3.5 rounded-md bg-[var(--secondary)] border border-[var(--border)] hover:border-[var(--gold)] transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <img
                src={v.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'}
                alt={v.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--gold)]/40 shrink-0"
              />
              <div>
                <h5 className="font-serif font-bold text-sm text-[var(--foreground)]">{v.name}</h5>
                <p className="text-[11px] font-mono text-[var(--muted-foreground)]">
                  {v.ownerName} • {v.location}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Badge variant={v.status === 'active' ? 'gold' : 'secondary'} className="capitalize">
                {v.category}
              </Badge>
              <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{v.joinedDate}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

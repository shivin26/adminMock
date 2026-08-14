import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../feedback/Skeleton';
import { PaymentRecord } from '../../types/dashboard';
import { formatCurrency } from '../../utils/formatters';

export interface RecentPaymentsTableProps {
  payments?: PaymentRecord[];
  isLoading?: boolean;
}

export const RecentPaymentsTable: React.FC<RecentPaymentsTableProps> = ({ payments, isLoading }) => {
  if (isLoading || !payments) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      <CardHeader>
        <CardTitle className="text-xl">Recent Payment Transactions</CardTitle>
        <CardDescription>PLATFORM PAYOUTS & SUBSCRIPTION BILLING</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="border-b border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] font-mono-meta">
              <tr>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Vendor / Business</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--secondary)]/60 transition-colors">
                  <td className="p-3 font-mono font-semibold text-[var(--foreground)]">{p.id}</td>
                  <td className="p-3">
                    <div className="font-semibold text-[var(--foreground)]">{p.vendorName}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">{p.vendorCategory}</div>
                  </td>
                  <td className="p-3 font-mono font-bold text-[var(--foreground)]">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="p-3 font-mono text-[var(--muted-foreground)]">{p.date}</td>
                  <td className="p-3 text-right">
                    <Badge
                      variant={
                        p.status === 'completed'
                          ? 'forest'
                          : p.status === 'pending'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

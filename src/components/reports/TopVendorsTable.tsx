import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../feedback/Skeleton';
import { TopVendorReport } from '../../types/report';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export interface TopVendorsTableProps {
  data?: TopVendorReport[];
  isLoading?: boolean;
}

export const TopVendorsTable: React.FC<TopVendorsTableProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[var(--gold)]" />
          <CardTitle className="text-xl">Top Merchant Leaderboard</CardTitle>
        </div>
        <CardDescription>HIGHEST PERFORMING LOCAL VENDORS BY VOLUME</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-[var(--secondary)] font-mono-meta border-b border-[var(--border)] text-[var(--muted-foreground)]">
              <tr>
                <th className="p-3">Rank & Store</th>
                <th className="p-3">Category</th>
                <th className="p-3">Society Location</th>
                <th className="p-3 align-right">Orders</th>
                <th className="p-3 align-right">Rating</th>
                <th className="p-3 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
              {data.map((v, idx) => (
                <tr key={v.vendorId} className="hover:bg-[var(--secondary)]/60 transition">
                  <td className="p-3 flex items-center gap-3">
                    <span
                      className={`h-6 w-6 rounded-full font-mono font-bold text-xs flex items-center justify-center ${
                        idx === 0
                          ? 'bg-[var(--gold)] text-black'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-serif font-bold text-sm text-[var(--foreground)]">{v.storeName}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary">{v.category}</Badge>
                  </td>
                  <td className="p-3 font-mono text-[var(--muted-foreground)]">{v.societyName}</td>
                  <td className="p-3 font-mono font-bold text-[var(--foreground)]">{formatNumber(v.totalOrders)}</td>
                  <td className="p-3 font-mono text-[var(--gold)] flex items-center gap-1">
                    <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
                    <span>{v.rating}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-[var(--foreground)]">
                    {formatCurrency(v.totalRevenue)}
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

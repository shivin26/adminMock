import React from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-7xl mx-auto animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-2">
          <LoadingSkeleton width={220} height={28} />
          <LoadingSkeleton width={340} height={16} />
        </div>
        <LoadingSkeleton width={140} height={40} borderRadius={8} />
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <LoadingSkeleton width={100} height={14} />
              <LoadingSkeleton width={36} height={36} borderRadius={8} />
            </div>
            <LoadingSkeleton width={120} height={32} />
            <LoadingSkeleton width={80} height={14} />
          </div>
        ))}
      </div>

      {/* Main Charts & Table Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl flex flex-col gap-4">
          <LoadingSkeleton width={180} height={20} />
          <LoadingSkeleton width="100%" height={240} borderRadius={12} />
        </div>
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl flex flex-col gap-4">
          <LoadingSkeleton width={180} height={20} />
          <LoadingSkeleton width="100%" height={240} borderRadius={12} />
        </div>
      </div>
    </div>
  );
};

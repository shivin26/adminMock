import React from 'react';
import { StatCard } from '../common/StatCard/StatCard';
import { usePeopleAnalytics, usePeopleList } from '../../hooks/usePeople';
import { Users, Store, ShieldAlert, Activity } from 'lucide-react';

export interface PeopleAnalyticsHeaderProps {
  onSelectCategory?: (category: 'all' | 'user' | 'user_vendor' | 'flagged') => void;
  activeCategory?: string;
}

export const PeopleAnalyticsHeader: React.FC<PeopleAnalyticsHeaderProps> = ({
  onSelectCategory,
  activeCategory,
}) => {
  const { data: analytics } = usePeopleAnalytics();
  const { data: peopleList = [], isLoading } = usePeopleList();

  const totalPeopleCount = analytics?.totalPeopleCount ?? peopleList.length;
  const usersCount = analytics?.usersCount ?? peopleList.filter((p) => p.personType === 'user').length;
  const dualRoleCount = analytics?.vendorsCount ?? peopleList.filter((p) => p.personType === 'user_vendor').length;
  const warnedCount = analytics?.warnedCount ?? peopleList.filter((p) => p.status === 'warned').length;
  const bannedCount = analytics?.bannedCount ?? peopleList.filter((p) => p.status === 'banned' || p.status === 'suspended').length;

  if (isLoading && peopleList.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Directory Users"
        value={totalPeopleCount.toLocaleString()}
        subtitle="Registered resident & dual-role accounts"
        icon={<Users size={22} className="text-[#C8A878]" />}
        change={`${totalPeopleCount} Total Accounts`}
        isPositive={true}
        onClick={() => onSelectCategory?.('all')}
      />

      <StatCard
        title="Resident Customers"
        value={usersCount.toLocaleString()}
        subtitle="Active consumer accounts on Website"
        icon={<Activity size={22} className="text-[#D97706]" />}
        change={`${usersCount} Residents`}
        isPositive={true}
        onClick={() => onSelectCategory?.('user')}
      />

      <StatCard
        title="User & Vendor (Dual Role)"
        value={dualRoleCount.toLocaleString()}
        subtitle="Dual role customer & store owners"
        icon={<Store size={22} className="text-[#211A19]" />}
        change={`${dualRoleCount} Dual Role Stores`}
        isPositive={true}
        onClick={() => onSelectCategory?.('user_vendor')}
      />

      <StatCard
        title="Flagged / Banned Accounts"
        value={(warnedCount + bannedCount).toLocaleString()}
        subtitle={`${bannedCount} accounts auto-banned via 3-strike meter`}
        icon={<ShieldAlert size={22} className="text-rose-500" />}
        change={`${warnedCount + bannedCount} Flagged Records`}
        isPositive={false}
        onClick={() => onSelectCategory?.('flagged')}
      />
    </div>
  );
};

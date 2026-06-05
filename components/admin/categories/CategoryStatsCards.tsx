'use client';

import { ComponentType, SVGProps } from 'react';

interface StatCard {
  label: string;
  value: number | string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
}

interface CategoryStatsCardsProps {
  stats: StatCard[];
}

export default function CategoryStatsCards({ stats }: CategoryStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} mb-4`}>
            <stat.Icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
            {stat.label}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

'use client';

import React, { ComponentType, SVGProps } from 'react';

interface StatCard {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  bgColor: string;
  label: string;
  value: string | number;
}

interface PageStatsProps {
  stats: StatCard[];
}

export default function PageStats({ stats }: PageStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4"
        >
          <div className={`${stat.bgColor} p-3 rounded-lg`}>
            <stat.Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-lg font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

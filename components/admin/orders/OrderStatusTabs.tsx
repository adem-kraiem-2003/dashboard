'use client';

import React from 'react';

export type OrderStatus = 'all' | 'pending' | 'shipped' | 'delivered' | 'cancelled';

interface StatusTab {
  key: OrderStatus;
  label: string;
  count: number;
}

interface OrderStatusTabsProps {
  tabs: StatusTab[];
  activeTab: OrderStatus;
  onChange: (status: OrderStatus) => void;
}

export default function OrderStatusTabs({ tabs, activeTab, onChange }: OrderStatusTabsProps) {
  return (
    <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
            activeTab === tab.key
              ? 'bg-[#e2366a] text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {tab.label}
          <span className="ml-2 text-xs opacity-75">({tab.count})</span>
        </button>
      ))}
    </div>
  );
}

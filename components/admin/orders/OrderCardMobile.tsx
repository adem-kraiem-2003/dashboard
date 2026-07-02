'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Order } from './CommandeListPanel';

const STATUS_CONFIG = {
  pending:   { dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',     label: 'En attente' },
  shipped:   { dot: 'bg-blue-500',    text: 'text-blue-700 dark:text-blue-400',       label: 'Expédiée'   },
  delivered: { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', label: 'Livrée'     },
  cancelled: { dot: 'bg-red-500',     text: 'text-red-700 dark:text-red-400',         label: 'Annulée'    },
} as const;

interface OrderCardMobileProps {
  order: Order;
  isSelected: boolean;
  onView: (id: string) => void;
}

export default function OrderCardMobile({ order, isSelected, onView }: OrderCardMobileProps) {
  const cfg = STATUS_CONFIG[order.status];
  const date = new Date(order.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const initials = order.customer.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <button
      type="button"
      data-testid={`order-card-mobile-${order.id}`}
      onClick={() => onView(order.id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 text-left transition-colors active:bg-slate-50 dark:active:bg-slate-800/50 ${
        isSelected ? 'bg-pink-50 dark:bg-pink-900/10 border-l-4 border-l-[#e2366a] pl-3' : ''
      }`}
    >
      <div
        className="w-9 h-9 rounded-full bg-[#e2366a]/10 text-[#e2366a] flex items-center justify-center font-bold text-sm shrink-0"
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{order.customer}</p>
          <span className="text-xs text-slate-400 tabular-nums shrink-0">{date}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">{order.total.toFixed(2)} DT</span>
          <span className="text-xs text-slate-400" aria-hidden="true">·</span>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
            {cfg.label}
          </span>
        </div>
      </div>

      <ChevronRightIcon className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
    </button>
  );
}

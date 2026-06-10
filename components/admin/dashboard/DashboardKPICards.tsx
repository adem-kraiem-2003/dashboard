'use client';

import { ShoppingBagIcon, CreditCardIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '@/lib/format';

interface DashboardKPICardsProps {
  totalOrders: number;
  revenue: number;
  pendingCount: number;
  loading: boolean;
  isError?: boolean;
}

export default function DashboardKPICards({
  totalOrders,
  revenue,
  pendingCount,
  loading,
  isError = false,
}: DashboardKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6" role="status" aria-label="Chargement des indicateurs">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
            <div className="h-7 w-16 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  const pendingBarWidth = !isError && totalOrders > 0
    ? Math.min((pendingCount / totalOrders) * 100, 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      {isError && (
        <div className="sm:col-span-3 flex items-center gap-2 text-amber-600 text-xs bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-2" role="alert">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
          Impossible de charger les données. Les indicateurs affichent la dernière valeur disponible.
        </div>
      )}

      {/* Total Commandes */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-default">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg" aria-hidden="true">
            <ShoppingBagIcon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Commandes</p>
        <p className="text-2xl font-extrabold mt-1 tabular-nums">
          {isError ? '—' : totalOrders.toLocaleString('fr-FR')}
        </p>
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" aria-hidden="true">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: isError ? '0%' : '70%' }} />
        </div>
      </div>

      {/* Chiffre d'Affaires */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-default">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-[#e2366a]/10 text-[#e2366a] rounded-lg" aria-hidden="true">
            <CreditCardIcon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Chiffre d&apos;Affaires</p>
        <p className="text-2xl font-extrabold mt-1 tabular-nums">
          {isError ? '—' : formatPrice(revenue)}
        </p>
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" aria-hidden="true">
          <div className="h-full bg-[#e2366a] rounded-full transition-all duration-700" style={{ width: isError ? '0%' : '55%' }} />
        </div>
      </div>

      {/* Commandes en attente */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md cursor-default">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg" aria-hidden="true">
            <ClockIcon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Commandes en attente</p>
        <p className="text-2xl font-extrabold mt-1 tabular-nums">
          {isError ? '—' : pendingCount}
        </p>
        <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${pendingBarWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

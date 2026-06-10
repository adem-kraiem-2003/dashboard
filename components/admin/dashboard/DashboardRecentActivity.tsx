'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';
import type { Commande } from '@/types/api.types';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface StatusStyle {
  bg: string;
  Icon: IconType;
  color: string;
  label: string;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  LIVREE:         { bg: 'bg-green-100 dark:bg-green-900/30', Icon: CheckCircleIcon,      color: 'text-green-600',   label: 'Livrée' },
  EXPEDIEE:       { bg: 'bg-blue-100 dark:bg-blue-900/30',   Icon: TruckIcon,             color: 'text-blue-600',    label: 'Expédiée' },
  ANNULEE:        { bg: 'bg-red-100 dark:bg-red-900/30',     Icon: XCircleIcon,           color: 'text-red-600',     label: 'Annulée' },
  EN_ATTENTE:     { bg: 'bg-amber-100 dark:bg-amber-900/30', Icon: ClockIcon,             color: 'text-amber-600',   label: 'En attente' },
  CONFIRMEE:      { bg: 'bg-amber-100 dark:bg-amber-900/30', Icon: ClockIcon,             color: 'text-amber-600',   label: 'Confirmée' },
  EN_PREPARATION: { bg: 'bg-amber-100 dark:bg-amber-900/30', Icon: ClockIcon,             color: 'text-amber-600',   label: 'En préparation' },
  DEFAULT:        { bg: 'bg-slate-100 dark:bg-slate-800',    Icon: ExclamationCircleIcon, color: 'text-slate-500',   label: '' },
};

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return "À l'instant";
  if (mins < 60)  return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

interface DashboardRecentActivityProps {
  loading: boolean;
  commandes: Commande[];
}

export default function DashboardRecentActivity({ loading, commandes }: DashboardRecentActivityProps) {
  const router = useRouter();

  const activities = useMemo(
    () =>
      commandes.slice(0, 4).map(c => {
        const style = STATUS_STYLES[c.statut] ?? STATUS_STYLES.DEFAULT;
        return {
          id: c.id,
          ...style,
          title: `Commande #${c.id} — ${style.label || c.statut}`,
          sub: `${c.prenomClient} ${c.nomClient} · ${timeAgo(c.date ?? c.createdAt)}`,
        };
      }),
    [commandes],
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold">Activité Récente</h2>
        <button
          className="text-xs text-[#e2366a] font-bold hover:underline"
          onClick={() => router.push('/commande')}
        >
          Voir tout
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-8">
          Aucune commande récente
        </div>
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto">
          {activities.map((a, i) => {
            const ActivityIcon = a.Icon;
            return (
              <div key={a.id} className="flex gap-4">
                <div className="relative shrink-0">
                  <div className={`size-9 rounded-full ${a.bg} flex items-center justify-center ${a.color}`}>
                    <ActivityIcon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  {i < activities.length - 1 && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-100 dark:bg-slate-800" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold truncate">{a.title}</p>
                  <p className="text-[11px] text-slate-500">{a.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

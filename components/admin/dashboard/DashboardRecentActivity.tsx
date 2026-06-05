'use client';

import { CheckCircleIcon, ArchiveBoxIcon, UserPlusIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

const ACTIVITIES = [
  { bg: 'bg-green-100 dark:bg-green-900/30', Icon: CheckCircleIcon, color: 'text-green-600', title: 'Commande #8423 validée',  sub: 'Par Jean Dupont • Il y a 5 min',  hasLine: true },
  { bg: 'bg-blue-100 dark:bg-blue-900/30',   Icon: ArchiveBoxIcon,  color: 'text-blue-600',  title: 'Stock mis à jour',          sub: 'Veste Nouri Silk • Il y a 14 min', hasLine: true },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', Icon: UserPlusIcon,    color: 'text-amber-600', title: 'Nouveau client enregistré', sub: 'Marie Laurence • Il y a 1h',       hasLine: true },
  { bg: 'bg-[#e2366a]/10',                   Icon: MegaphoneIcon,   color: 'text-[#e2366a]', title: 'Campagne SMS lancée',       sub: 'Promo Été 2024 • Il y a 2h',       hasLine: false },
];

interface DashboardRecentActivityProps {
  loading: boolean;
  onViewAll: () => void;
}

export default function DashboardRecentActivity({ loading, onViewAll }: DashboardRecentActivityProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-base font-bold">Activité Récente</h4>
        <button
          className="text-xs text-[#e2366a] font-bold hover:underline"
          onClick={onViewAll}
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
      ) : (
        <div className="flex-1 space-y-5 overflow-y-auto">
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="flex gap-4">
              <div className="relative shrink-0">
                <div className={`size-9 rounded-full ${a.bg} flex items-center justify-center ${a.color}`}>
                  <a.Icon className="w-5 h-5" />
                </div>
                {a.hasLine && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-100 dark:bg-slate-800" />
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold">{a.title}</p>
                <p className="text-[11px] text-slate-500">{a.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

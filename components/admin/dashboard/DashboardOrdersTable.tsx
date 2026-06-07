'use client';

import Link from 'next/link';
import type { DashboardOrder } from './DashboardOrderModal';
import { STATUS_MAP } from './DashboardOrderModal';
import { ArrowDownTrayIcon, MagnifyingGlassIcon, EllipsisHorizontalIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface DashboardOrdersTableProps {
  filteredOrders: DashboardOrder[];
  loading: boolean;
  search: string;
  onSelectOrder: (order: DashboardOrder) => void;
  onExport: () => void;
}

export default function DashboardOrdersTable({
  filteredOrders,
  loading,
  search,
  onSelectOrder,
  onExport,
}: DashboardOrdersTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-base font-bold">Dernières Commandes</h4>
          {search && (
            <span className="text-xs bg-[#e2366a]/10 text-[#e2366a] font-bold px-2 py-0.5 rounded-full">
              {filteredOrders.length} résultat{filteredOrders.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1"
            onClick={onExport}
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[560px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-4 md:px-6 py-4">ID Commande</th>
                  <th className="px-4 md:px-6 py-4">Client</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Date</th>
                  <th className="px-4 md:px-6 py-4">Montant</th>
                  <th className="px-4 md:px-6 py-4">Statut</th>
                  <th className="px-4 md:px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold">Aucune commande trouvée</p>
                      <p className="text-sm mt-1">Essayez un autre terme de recherche</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-4 md:px-6 py-4 text-sm font-bold font-mono">{order.id}</td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-[#e2366a]/10 text-[#e2366a] font-bold text-xs flex items-center justify-center shrink-0">
                            {order.avatar}
                          </div>
                          <span className="text-sm whitespace-nowrap">{order.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">{order.date}</td>
                      <td className="px-4 md:px-6 py-4 text-sm font-bold whitespace-nowrap">{order.amount}</td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${STATUS_MAP[order.status].cls}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <button
                          className="text-slate-400 hover:text-[#e2366a] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          onClick={() => onSelectOrder(order)}
                          title="Voir les détails"
                          aria-label={`Détails de la commande ${order.id}`}
                        >
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">{filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}</span>
            <Link
              href="/commande"
              className="text-xs font-bold text-slate-500 hover:text-[#e2366a] transition-colors flex items-center gap-1"
            >
              Voir toutes les commandes
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

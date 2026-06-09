'use client';

import { useEffect } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export type OrderStatus = 'Livré' | 'En préparation' | 'Expédié' | 'Annulé';

export interface DashboardOrder {
  id: string;
  customer: string;
  avatar: string;
  date: string;
  amount: string;
  status: OrderStatus;
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const STATUS_MAP: Record<OrderStatus, { cls: string; Icon: IconComponent }> = {
  'Livré':          { cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  Icon: CheckCircleIcon },
  'En préparation': { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', Icon: ClockIcon },
  'Expédié':        { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',     Icon: TruckIcon },
  'Annulé':         { cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',         Icon: XCircleIcon },
};

const STATUS_OPTIONS: OrderStatus[] = ['Livré', 'En préparation', 'Expédié', 'Annulé'];

interface DashboardOrderModalProps {
  order: DashboardOrder;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

export default function DashboardOrderModal({ order, onClose, onStatusChange }: DashboardOrderModalProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div ref={trapRef} className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="order-modal-title" className="font-bold text-slate-900 dark:text-white">{order.id}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{order.date}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la commande"
            className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2366a]/50"
          >
            <XMarkIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#e2366a]/10 text-[#e2366a] font-bold flex items-center justify-center text-sm">
              {order.avatar}
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{order.customer}</p>
              <p className="text-xs text-slate-500">client@example.com</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <span className="text-xs text-slate-500">Montant</span>
            <span className="font-black text-slate-900 dark:text-white">{order.amount}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Changer le statut</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(s => {
                const StatusIcon = STATUS_MAP[s].Icon;
                return (
                  <button
                    key={s}
                    onClick={() => { onStatusChange(order.id, s); onClose(); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      order.status === s
                        ? 'border-[#e2366a] bg-[#e2366a]/10 text-[#e2366a]'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#e2366a]/50'
                    }`}
                  >
                    <StatusIcon className="w-4 h-4 inline-block mr-1 align-middle" />
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

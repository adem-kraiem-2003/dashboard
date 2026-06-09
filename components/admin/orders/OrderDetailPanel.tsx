'use client';

import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PhoneIcon, MapPinIcon, TagIcon, ClockIcon, TruckIcon, CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { LigneCommande } from '@/types/api.types';

interface Order {
  id: string;
  commandeId?: number;
  date: string;
  customer: string;
  email: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  address?: string;
  phone?: string;
  lignes?: LigneCommande[];
}

interface OrderDetailPanelProps {
  order: Order | null;
  onStatusChange?: (status: string) => void;
  onClose?: () => void;
}

const STATUS_CONFIG = {
  pending:   { label: 'En attente',   color: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',   Icon: ClockIcon },
  shipped:   { label: 'Expédiée',     color: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',    Icon: TruckIcon },
  delivered: { label: 'Livrée',       color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', Icon: CheckCircleIcon },
  cancelled: { label: 'Annulée',      color: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',     Icon: XCircleIcon },
} as const;

const STATUS_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
  pending:   ['shipped', 'cancelled'],
  shipped:   ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatPrice(amount: number) {
  return `${amount.toFixed(2)} DT`;
}

export default function OrderDetailPanel({ order, onStatusChange, onClose }: OrderDetailPanelProps) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) {
    return (
      <div className="w-full xl:w-[420px] shrink-0 flex items-center justify-center min-h-[300px]
                      bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-center text-slate-400 dark:text-slate-600 py-12 px-6">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm font-medium">Selectionnez une commande</p>
          <p className="text-xs mt-1">pour voir les details</p>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status];
  const nextStatuses = STATUS_TRANSITIONS[order.status];
  const lignes = order.lignes ?? [];

  async function handleStatusChange(newStatus: Order['status']) {
    setUpdatingStatus(true);
    try {
      onStatusChange?.(newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <aside className="w-full xl:w-[420px] shrink-0 flex flex-col gap-4">

      {/* ── Header card ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Commande #{order.commandeId ?? order.id}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {formatDate(order.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
              <cfg.Icon className="w-3 h-3" />
              {cfg.label}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Fermer le détail (Échap)"
                title="Fermer (Échap)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Client info */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e2366a]/10 text-[#e2366a] flex items-center justify-center font-bold text-sm shrink-0">
              {order.customer.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">{order.customer}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{order.email}</p>
            </div>
          </div>

          {order.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <PhoneIcon className="w-4 h-4 text-slate-400" />
              {order.phone}
            </div>
          )}

          {order.address && (
            <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5" />
              <span className="leading-snug">{order.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Lignes / Articles ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
            Articles commandes
          </h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
            {lignes.length} article{lignes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {lignes.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">
            Aucun article dans cette commande
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {lignes.map((ligne) => {
              const v = ligne.variante;
              const productName = v?.produit?.nom ?? `Variante #${ligne.varianteId}`;
              const subtotal = ligne.quantite * ligne.prixUnitaire;
              return (
                <li key={ligne.id} className="px-5 py-4 flex gap-3">
                  {/* Color swatch or placeholder */}
                  <div
                    className="w-10 h-10 rounded-md shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400"
                    style={v?.colorHex ? { backgroundColor: v.colorHex, border: 'none' } : undefined}
                    aria-hidden
                  >
                    {!v?.colorHex && (
                      <TagIcon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {productName}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {v?.size && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Taille: <strong className="text-slate-700 dark:text-slate-300">{v.size}</strong>
                        </span>
                      )}
                      {v?.color && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          Couleur:
                          {v.colorHex && (
                            <span
                              className="w-3 h-3 rounded-full inline-block border border-slate-300"
                              style={{ backgroundColor: v.colorHex }}
                            />
                          )}
                          <strong className="text-slate-700 dark:text-slate-300">{v.color}</strong>
                        </span>
                      )}
                      {v?.sku && (
                        <span className="text-xs text-slate-400 font-mono">SKU: {v.sku}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatPrice(ligne.prixUnitaire)} x {ligne.quantite}
                      </span>
                      <span className="text-sm font-bold text-[#e2366a]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Total */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Total commande
          </span>
          <span className="text-lg font-black text-[#e2366a]">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* ── Status actions ────────────────────────────────────────────────────── */}
      {nextStatuses.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm px-5 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Changer le statut
          </p>
          <div className="flex flex-col gap-2">
            {nextStatuses.map((s) => {
              const c = STATUS_CONFIG[s];
              const StatusButtonIcon = c.Icon;
              return (
                <button
                  key={s}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(s)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold
                    transition-all border ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98]'}
                    ${s === 'cancelled'
                      ? 'border-red-200  dark:border-red-800  bg-red-50  dark:bg-red-900/20  text-red-700  dark:text-red-400'
                      : 'border-[#e2366a]/20 bg-[#e2366a]/5 text-[#e2366a] hover:bg-[#e2366a]/10'
                    }`}
                >
                  <StatusButtonIcon className="w-4 h-4" />
                  Marquer comme &quot;{c.label}&quot;
                  {updatingStatus && (
                    <span className="ml-auto w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

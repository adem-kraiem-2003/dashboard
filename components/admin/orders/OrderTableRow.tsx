'use client';

import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  date: string;
  customer: string;
  email: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

interface OrderTableRowProps {
  order: Order;
  isSelected?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Order['status']) => void;
}

const STATUS_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  pending: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
    label: 'En attente',
  },
  shipped: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
    label: 'Expédiée',
  },
  delivered: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Livrée',
  },
  cancelled: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
    label: 'Annulée',
  },
};

const STATUS_OPTIONS: { value: Order['status']; label: string }[] = [
  { value: 'pending',   label: 'En attente' },
  { value: 'shipped',   label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

export default function OrderTableRow({ order, isSelected, onView, onEdit, onDelete, onStatusChange }: OrderTableRowProps) {
  const statusStyle = STATUS_STYLES[order.status];

  return (
    <tr
      data-testid={`order-row-${order.id}`}
      onClick={() => onView?.(order.id)}
      className={`transition-colors cursor-pointer group ${
        isSelected
          ? 'bg-pink-50 dark:bg-pink-900/10 border-l-4 border-[#e2366a]'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      <td className="px-6 py-4 text-sm font-bold">#{order.id}</td>
      <td className="px-6 py-4 text-sm">{new Date(order.date).toLocaleDateString('fr-FR')}</td>
      <td className="px-6 py-4 text-sm">
        <div>
          <p className="font-medium">{order.customer}</p>
          <p className="text-xs text-slate-500">{order.email}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-bold">{order.total.toFixed(2)} €</td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        {onStatusChange ? (
          <select
            data-testid={`order-status-select-${order.id}`}
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
            className={`text-xs font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-[#e2366a] focus:outline-none ${statusStyle.badge}`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.badge}`}>
            <span className={`w-1 h-1 rounded-full ${statusStyle.dot}`}></span>
            {statusStyle.label}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button data-testid={`order-edit-${order.id}`} onClick={() => onEdit(order.id)} className="p-2 text-slate-400 hover:text-[#e2366a] transition-colors">
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button data-testid={`order-delete-${order.id}`} onClick={() => onDelete(order.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

'use client';

import React from 'react';
import { ArrowPathIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import OrderTableRow from './OrderTableRow';

interface Order {
  id: string;
  date: string;
  customer: string;
  email: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  error?: string | null;
  selectedOrderId?: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Order['status']) => void;
}

export default function OrderTable({ orders, loading, error, selectedOrderId, onView, onEdit, onDelete, onStatusChange }: OrderTableProps) {
  if (loading) {
    return (
      <div data-testid="orders-loading" className="flex items-center justify-center py-16">
        <div className="text-slate-500 flex flex-col items-center gap-2">
          <ArrowPathIcon className="w-10 h-10 animate-spin" />
          <p>Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="orders-error" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div data-testid="orders-empty" className="flex items-center justify-center py-16">
        <div className="text-slate-500 flex flex-col items-center gap-2">
          <ShoppingBagIcon className="w-10 h-10" />
          <p>Aucune commande trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table data-testid="orders-table" className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">
          <tr>
            <th className="px-6 py-4">Commande</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {orders.map((order) => (
            <OrderTableRow
              key={order.id}
              order={order}
              isSelected={order.id === selectedOrderId}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import OrderStatusTabs from './OrderStatusTabs';
import OrderTable from './OrderTable';
import OrderDetailPanel from './OrderDetailPanel';
import type { LigneCommande } from '@/types/api.types';

export interface Order {
  id: string;
  commandeId: number;
  date: string;
  customer: string;
  email: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  avatar?: string;
  address?: string;
  phone?: string;
  lignes?: LigneCommande[];
}

interface CommandeListPanelProps {
  orders: Order[];
  loading?: boolean;
  error?: string | null;
  onStatusChange?: (orderId: string, newStatus: Order['status']) => void;
}

export default function CommandeListPanel({
  orders,
  loading = false,
  error = null,
  onStatusChange,
}: CommandeListPanelProps) {
  const [activeStatus, setActiveStatus] = useState<'all' | Order['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setSelectedOrder((prev) => prev ?? orders[0] ?? null);
  }, [orders]);

  const filteredOrders =
    activeStatus === 'all' ? orders : orders.filter(o => o.status === activeStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const tabs = [
    { key: 'all' as const, label: 'Toutes', count: statusCounts.all },
    { key: 'pending' as const, label: 'En attente', count: statusCounts.pending },
    { key: 'shipped' as const, label: 'Expédiées', count: statusCounts.shipped },
    { key: 'delivered' as const, label: 'Livrées', count: statusCounts.delivered },
    { key: 'cancelled' as const, label: 'Annulées', count: statusCounts.cancelled },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Orders List */}
      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter Tabs */}
        <OrderStatusTabs
          tabs={tabs}
          activeTab={activeStatus}
          onChange={setActiveStatus}
        />

        {/* Orders Table */}
        <OrderTable
          orders={filteredOrders}
          loading={loading}
          error={error}
          selectedOrderId={selectedOrder?.id}
          onView={id => setSelectedOrder(filteredOrders.find(o => o.id === id) ?? null)}
          onStatusChange={(id, newStatus) => {
            onStatusChange?.(id, newStatus);
            setSelectedOrder(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
          }}
        />
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onStatusChange={(status) => {
            onStatusChange?.(selectedOrder.id, status as Order['status']);
            setSelectedOrder({ ...selectedOrder, status: status as Order['status'] });
          }}
        />
      )}
    </div>
  );
}

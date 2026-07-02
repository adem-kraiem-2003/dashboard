'use client';

import { useState } from 'react';
import OrderStatusTabs from './OrderStatusTabs';
import OrderTable from './OrderTable';
import OrderDetailPanel from './OrderDetailPanel';
import OrderCardMobile from './OrderCardMobile';
import BottomSheet from '@/components/admin/shared/BottomSheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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

function MobileOrderSkeleton() {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-full skeleton-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 rounded skeleton-shimmer" />
            <div className="h-3 w-1/3 rounded skeleton-shimmer" />
          </div>
          <div className="w-4 h-4 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export default function CommandeListPanel({
  orders,
  loading = false,
  error = null,
  onStatusChange,
}: CommandeListPanelProps) {
  const [activeStatus, setActiveStatus] = useState<'all' | Order['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const isDesktop = useMediaQuery('(min-width: 1280px)');

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
    { key: 'all' as const,       label: 'Toutes',     count: statusCounts.all },
    { key: 'pending' as const,   label: 'En attente', count: statusCounts.pending },
    { key: 'shipped' as const,   label: 'Expédiées',  count: statusCounts.shipped },
    { key: 'delivered' as const, label: 'Livrées',    count: statusCounts.delivered },
    { key: 'cancelled' as const, label: 'Annulées',   count: statusCounts.cancelled },
  ];

  const handleView = (id: string) => {
    setSelectedOrder(filteredOrders.find(o => o.id === id) ?? null);
  };

  const handleStatusChangeInPanel = (status: string) => {
    if (!selectedOrder) return;
    onStatusChange?.(selectedOrder.id, status as Order['status']);
    setSelectedOrder({ ...selectedOrder, status: status as Order['status'] });
  };

  return (
    <>
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Orders list panel */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <OrderStatusTabs tabs={tabs} activeTab={activeStatus} onChange={setActiveStatus} />

          {/* Mobile card list */}
          <div className="block md:hidden">
            {loading ? (
              <MobileOrderSkeleton />
            ) : filteredOrders.length === 0 ? (
              <p className="py-16 text-center text-slate-500 text-sm">Aucune commande</p>
            ) : (
              filteredOrders.map(order => (
                <OrderCardMobile
                  key={order.id}
                  order={order}
                  isSelected={selectedOrder?.id === order.id}
                  onView={handleView}
                />
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <OrderTable
              orders={filteredOrders}
              loading={loading}
              error={error}
              selectedOrderId={selectedOrder?.id}
              onView={handleView}
              onStatusChange={(id, newStatus) => {
                onStatusChange?.(id, newStatus);
                setSelectedOrder(prev => prev?.id === id ? { ...prev, status: newStatus } : prev);
              }}
            />
          </div>
        </div>

        {/* Desktop side panel */}
        {isDesktop && selectedOrder && (
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChangeInPanel}
          />
        )}
      </div>

      {/* Mobile / tablet bottom sheet */}
      {!isDesktop && (
        <BottomSheet
          open={selectedOrder !== null}
          onClose={() => setSelectedOrder(null)}
          title={selectedOrder ? `Commande #${selectedOrder.commandeId ?? selectedOrder.id}` : undefined}
        >
          {selectedOrder && (
            <div className="p-4">
              <OrderDetailPanel
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusChange={handleStatusChangeInPanel}
              />
            </div>
          )}
        </BottomSheet>
      )}
    </>
  );
}

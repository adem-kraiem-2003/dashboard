'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardKPICards from '@/components/admin/dashboard/DashboardKPICards';
import DashboardRevenueChart from '@/components/admin/dashboard/DashboardRevenueChart';
import DashboardRecentActivity from '@/components/admin/dashboard/DashboardRecentActivity';
import DashboardOrdersTable from '@/components/admin/dashboard/DashboardOrdersTable';
import DashboardOrderModal from '@/components/admin/dashboard/DashboardOrderModal';
import DashboardToast from '@/components/admin/dashboard/DashboardToast';
import type { DashboardOrder, OrderStatus } from '@/components/admin/dashboard/DashboardOrderModal';

const INITIAL_COUNT = 1248;

const INITIAL_ORDERS: DashboardOrder[] = [
  { id: '#ORD-2024-001', customer: 'Marc Lavoine',    avatar: 'ML', date: '22 Mai 2024, 14:30', amount: '129.99 DT', status: 'Livré'          },
  { id: '#ORD-2024-002', customer: 'Julie Morel',     avatar: 'JM', date: '22 Mai 2024, 12:15', amount: '85.50 DT',  status: 'En préparation' },
  { id: '#ORD-2024-003', customer: 'Thomas Pesquet',  avatar: 'TP', date: '21 Mai 2024, 18:45', amount: '342.00 DT', status: 'Expédié'         },
  { id: '#ORD-2024-004', customer: 'Camille Bernard', avatar: 'CB', date: '21 Mai 2024, 10:00', amount: '57.00 DT',  status: 'En préparation' },
  { id: '#ORD-2024-005', customer: 'Lucie Fontaine',  avatar: 'LF', date: '20 Mai 2024, 09:30', amount: '215.00 DT', status: 'Livré'          },
];

export default function DashboardClient() {
  const [orders, setOrders] = useState<DashboardOrder[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('Cette Semaine');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const handleStatusChange = useCallback((id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showToast(`Statut mis à jour : ${status}`, 'success');
  }, [showToast]);

  const filteredOrders = orders.filter(o =>
    search === '' ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <DashboardHeader
        search={search}
        onSearchChange={setSearch}
        onNotificationClick={() => showToast('Aucune nouvelle notification', 'info')}
      />

      <div className="p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Tableau de Bord</h2>
          <p className="text-slate-500 dark:text-slate-400">Voici un aperçu de l&apos;activité de votre boutique aujourd&apos;hui.</p>
        </div>

        <DashboardKPICards orders={orders} loading={loading} initialCount={INITIAL_COUNT} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <DashboardRevenueChart
              loading={loading}
              chartPeriod={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
          <DashboardRecentActivity
            loading={loading}
            onViewAll={() => showToast("Redirection vers le journal d'activité...", 'info')}
          />
        </div>

        <DashboardOrdersTable
          filteredOrders={filteredOrders}
          loading={loading}
          search={search}
          onSelectOrder={setSelectedOrder}
          onExport={() => showToast('Export CSV en cours...', 'info')}
        />
      </div>

      {selectedOrder && (
        <DashboardOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {toast && (
        <DashboardToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardKPICards from '@/components/admin/dashboard/DashboardKPICards';
import DashboardRevenueChart from '@/components/admin/dashboard/DashboardRevenueChart';
import DashboardRecentActivity from '@/components/admin/dashboard/DashboardRecentActivity';
import DashboardOrdersTable from '@/components/admin/dashboard/DashboardOrdersTable';
import DashboardOrderModal from '@/components/admin/dashboard/DashboardOrderModal';
import DashboardToast from '@/components/admin/dashboard/DashboardToast';
import type { DashboardOrder, OrderStatus } from '@/components/admin/dashboard/DashboardOrderModal';
import { getCommandes, updateCommandeStatut } from '@/services/api/commande.service';
import type { Order } from '@/services/api/commande.service';
import { formatPrice, formatDate } from '@/lib/format';
import type { Commande } from '@/types/api.types';

// ── Mappers ──────────────────────────────────────────────────────────────────

const PENDING_STATUTS = new Set(['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION']);

function mapToDashboardStatus(statut: string): OrderStatus {
  if (statut === 'EXPEDIEE') return 'Expédié';
  if (statut === 'LIVREE')   return 'Livré';
  if (statut === 'ANNULEE')  return 'Annulé';
  return 'En préparation';
}

function mapCommandeToDashboardOrder(c: Commande): DashboardOrder {
  return {
    id: String(c.id),
    customer: `${c.prenomClient} ${c.nomClient}`,
    email: c.emailClient ?? '',
    avatar: `${c.prenomClient.charAt(0)}${c.nomClient.charAt(0)}`.toUpperCase(),
    date: formatDate(c.date ?? c.createdAt),
    amount: formatPrice(c.total),
    status: mapToDashboardStatus(c.statut),
  };
}

// Maps the modal's French status labels → backend Order['status']
const MODAL_TO_ORDER_STATUS: Record<OrderStatus, Order['status']> = {
  'Livré':          'delivered',
  'En préparation': 'pending',
  'Expédié':        'shipped',
  'Annulé':         'cancelled',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardClient() {
  const [search, setSearch]               = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [toast, setToast]                 = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [chartPeriod, setChartPeriod]     = useState('Cette Semaine');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => getCommandes({ page: 1, limit: 50 }),
    staleTime: 60_000,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const statusMutation = useMutation({
    mutationFn: ({ id, orderStatus }: { id: number; orderStatus: Order['status'] }) =>
      updateCommandeStatut(id, orderStatus),
    onSuccess: (_data, { orderStatus }) => {
      const label =
        Object.entries(MODAL_TO_ORDER_STATUS).find(([, v]) => v === orderStatus)?.[0]
        ?? orderStatus;
      showToast(`Statut mis à jour : ${label}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['dashboard-orders'] });
    },
    onError: (err) => {
      showToast(
        err instanceof Error ? err.message : 'Échec de la mise à jour du statut.',
        'error',
      );
      // Refetch to revert any optimistic state
      queryClient.invalidateQueries({ queryKey: ['dashboard-orders'] });
    },
  });

  const commandes: Commande[] = data?.data ?? [];
  const orders: DashboardOrder[] = commandes.map(mapCommandeToDashboardOrder);
  const totalOrders = data?.total ?? 0;
  const revenue = commandes.reduce((sum, c) => sum + c.total, 0);
  const pendingCount = commandes.filter(c => PENDING_STATUTS.has(c.statut)).length;

  const filteredOrders = orders.filter(o =>
    search === '' ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase()),
  );

  const handleStatusChange = useCallback((id: string, status: OrderStatus) => {
    setSelectedOrder(prev => (prev?.id === id ? { ...prev, status } : prev));
    statusMutation.mutate({ id: parseInt(id, 10), orderStatus: MODAL_TO_ORDER_STATUS[status] });
  }, [statusMutation]);

  const handleExport = useCallback(() => {
    if (filteredOrders.length === 0) {
      showToast('Aucune commande à exporter.', 'info');
      return;
    }
    const header = 'ID,Client,Email,Date,Montant,Statut';
    const rows = filteredOrders.map(o =>
      [o.id, `"${o.customer}"`, `"${o.email}"`, o.date, o.amount, o.status].join(','),
    );
    const csv = '﻿' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export CSV téléchargé.', 'success');
  }, [filteredOrders, showToast]);

  useEffect(() => {
    if (isError) showToast('Impossible de charger les commandes.', 'error');
  }, [isError, showToast]);

  return (
    <>
      <DashboardHeader
        search={search}
        onSearchChange={setSearch}
        onNotificationClick={() => showToast('Aucune nouvelle notification', 'info')}
      />

      <div className="p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Tableau de Bord</h1>
          <p className="text-slate-500 dark:text-slate-400">Voici un aperçu de l&apos;activité de votre boutique aujourd&apos;hui.</p>
        </div>

        <DashboardKPICards
          totalOrders={totalOrders}
          revenue={revenue}
          pendingCount={pendingCount}
          loading={isLoading}
          isError={isError}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <DashboardRevenueChart
              loading={isLoading}
              chartPeriod={chartPeriod}
              onPeriodChange={setChartPeriod}
              commandes={commandes}
            />
          </div>
          <DashboardRecentActivity
            loading={isLoading}
            commandes={commandes}
          />
        </div>

        <DashboardOrdersTable
          filteredOrders={filteredOrders}
          loading={isLoading}
          search={search}
          onSelectOrder={setSelectedOrder}
          onExport={handleExport}
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

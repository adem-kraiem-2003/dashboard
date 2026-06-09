'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardKPICards from '@/components/admin/dashboard/DashboardKPICards';
import DashboardRevenueChart from '@/components/admin/dashboard/DashboardRevenueChart';
import DashboardRecentActivity from '@/components/admin/dashboard/DashboardRecentActivity';
import DashboardOrdersTable from '@/components/admin/dashboard/DashboardOrdersTable';
import DashboardOrderModal from '@/components/admin/dashboard/DashboardOrderModal';
import DashboardToast from '@/components/admin/dashboard/DashboardToast';
import type { DashboardOrder, OrderStatus } from '@/components/admin/dashboard/DashboardOrderModal';
import { getCommandes } from '@/services/api/commande.service';
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
    avatar: `${c.prenomClient.charAt(0)}${c.nomClient.charAt(0)}`.toUpperCase(),
    date: formatDate(c.date ?? c.createdAt),
    amount: formatPrice(c.total),
    status: mapToDashboardStatus(c.statut),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardClient() {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [chartPeriod, setChartPeriod] = useState('Cette Semaine');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => getCommandes({ page: 1, limit: 50 }),
    staleTime: 60_000,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const orders: DashboardOrder[] = (data?.data ?? []).map(mapCommandeToDashboardOrder);
  const totalOrders = data?.total ?? 0;
  const revenue = (data?.data ?? []).reduce((sum: number, c: Commande) => sum + c.total, 0);
  const pendingCount = (data?.data ?? []).filter((c: Commande) => PENDING_STATUTS.has(c.statut)).length;

  const handleStatusChange = useCallback((id: string, status: OrderStatus) => {
    setSelectedOrder(prev => (prev?.id === id ? { ...prev, status } : prev));
    showToast(`Statut mis à jour : ${status}`, 'success');
    // Invalidate so the table refreshes on modal close
    queryClient.invalidateQueries({ queryKey: ['dashboard-orders'] });
  }, [showToast, queryClient]);

  useEffect(() => {
    if (isError) showToast('Impossible de charger les commandes.', 'error');
  }, [isError, showToast]);

  const filteredOrders = orders.filter(o =>
    search === '' ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase()),
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Tableau de Bord</h1>
          <p className="text-slate-500 dark:text-slate-400">Voici un aperçu de l&apos;activité de votre boutique aujourd&apos;hui.</p>
        </div>

        <DashboardKPICards
          totalOrders={totalOrders}
          revenue={revenue}
          pendingCount={pendingCount}
          loading={isLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <DashboardRevenueChart
              loading={isLoading}
              chartPeriod={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
          <DashboardRecentActivity
            loading={isLoading}
            onViewAll={() => showToast("Redirection vers le journal d'activité...", 'info')}
          />
        </div>

        <DashboardOrdersTable
          filteredOrders={filteredOrders}
          loading={isLoading}
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

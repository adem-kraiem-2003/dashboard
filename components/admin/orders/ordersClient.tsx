'use client';

import { useCallback, useState, useEffect } from 'react';
import { DocumentTextIcon, ClockIcon, TruckIcon, CheckCircleIcon, ArrowDownTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import AdminFooter from '@/components/admin/shared/AdminFooter';
import PageHeader from '@/components/admin/shared/PageHeader';
import CommandeStatsCards from '@/components/admin/orders/CommandeStatsCards';
import CommandeListPanel from '@/components/admin/orders/CommandeListPanel';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/services/api/commande.service';

export default function CommandeClient() {
  const { orders, loading, error, updateError, updateStatus } = useOrders();
  const [toastError, setToastError] = useState<string | null>(null);

  // Show a temporary toast banner whenever the mutation error changes
  useEffect(() => {
    if (updateError) {
      setToastError(updateError);
      const timer = setTimeout(() => setToastError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [updateError]);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: Order['status']) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      await updateStatus(order.commandeId, newStatus);
    } catch (err) {
      // Error is already captured in updateError via the mutation's onError
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setToastError(msg);
    }
  }, [orders, updateStatus]);

  const stats = [
    {
      label: 'Total commandes',
      value: orders.length.toString(),
      Icon: DocumentTextIcon,
      color: 'text-[#e2366a]',
      bgColor: 'bg-[#e2366a]/10',
    },
    {
      label: 'En attente',
      value: orders.filter(o => o.status === 'pending').length.toString(),
      Icon: ClockIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Expédiées',
      value: orders.filter(o => o.status === 'shipped').length.toString(),
      Icon: TruckIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Livrées',
      value: orders.filter(o => o.status === 'delivered').length.toString(),
      Icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  ];

  return (
    <>
      

      {/* Error toast for failed status updates */}
      {toastError && (
        <div className="fixed top-4 right-4 z-50 flex items-start gap-3 max-w-sm w-full bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex-1 text-sm">
            <p className="font-semibold mb-0.5">Échec de la mise à jour</p>
            <p className="opacity-80">{Array.isArray(toastError) ? (toastError as string[]).join(', ') : toastError}</p>
          </div>
          <button
            onClick={() => setToastError(null)}
            className="text-red-500 hover:text-red-700 text-lg leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-[1440px] mx-auto w-full p-4 lg:p-10">
          <PageHeader
            title="Commandes"
            description="Gérez et suivez toutes vos commandes clients."
            actions={
              <button className="px-5 py-2.5 rounded-xl bg-[#e2366a] text-white font-bold text-sm shadow-lg shadow-[#e2366a]/20 hover:bg-[#e2366a]/90 transition-colors flex items-center gap-2">
                <ArrowDownTrayIcon className="w-5 h-5" />
                Exporter CSV
              </button>
            }
          />

          <div className="mb-8">
            <CommandeStatsCards stats={stats} />
          </div>

          <CommandeListPanel
            orders={orders}
            loading={loading}
            error={error}
            onStatusChange={handleStatusChange}
          />

          <AdminFooter />
        </main>
      </div>
    </>
  );
}

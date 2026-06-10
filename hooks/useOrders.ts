'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommandes, updateCommandeStatut, mapCommandeToOrder } from '@/services/api/commande.service';
import type { Order } from '@/services/api/commande.service';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  /** Error thrown by the last updateStatus call (null if none) */
  updateError: string | null;
  /** Re-fetch the order list from the API */
  refetch: () => Promise<void>;
  /** Update order status and refresh the list */
  updateStatus: (orderId: number, newStatus: Order['status']) => Promise<void>;
}

export function useOrders(): UseOrdersReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await getCommandes({ limit: 100 });
      return res.data.map(mapCommandeToOrder);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) =>
      updateCommandeStatut(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
    onError: (err: unknown) => {
      // Surface the error in the browser console for quick debugging
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[useOrders] Échec mise à jour statut:', msg);
    },
  });

  const errorMessage = error instanceof Error ? error.message : error ? 'Une erreur inattendue est survenue.' : null;

  const updateErrorRaw = statusMutation.error;
  const updateError = updateErrorRaw instanceof Error
    ? updateErrorRaw.message
    : updateErrorRaw
      ? 'Échec de la mise à jour du statut.'
      : null;

  return {
    orders: data ?? [],
    loading: isLoading,
    error: errorMessage,
    updateError,
    refetch: async () => { await refetch(); },
    updateStatus: async (id, status) => {
      await statusMutation.mutateAsync({ id, status });
    },
  };
}
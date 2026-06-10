'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  createProduct,
  deleteProduct,
} from '@/services/api/product.service';
import type { Product, CreateProductPayload, PaginationMeta } from '@/types/api.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

interface UseProductsReturn {
  products: Product[];
  meta: PaginationMeta | undefined;
  loading: boolean;
  error: string | null;
  removeError: string | null;
  refetch: () => Promise<void>;
  addProduct: (payload: CreateProductPayload) => Promise<Product>;
  removeProduct: (id: number) => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { page = 1, limit = 20, search } = options;
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-products', page, limit, search],
    queryFn: () => getProducts({ page, limit, search, showAll: true }),
  });

  const addMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['admin-products', page, limit, search] });
      const previous = queryClient.getQueryData<{ data: Product[] }>(['admin-products', page, limit, search]);
      queryClient.setQueryData<{ data: Product[]; meta: PaginationMeta } | undefined>(
        ['admin-products', page, limit, search],
        old => old ? { ...old, data: old.data.filter(p => p.id !== id) } : undefined,
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-products', page, limit, search], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const errorMessage = error instanceof Error ? error.message : error ? 'Une erreur inattendue est survenue.' : null;
  const removeErrorRaw = removeMutation.error;
  const removeError = removeErrorRaw instanceof Error
    ? removeErrorRaw.message
    : removeErrorRaw
      ? 'Échec de la suppression. Le produit a été restauré.'
      : null;

  return {
    products: data?.data ?? [],
    meta: data?.meta,
    loading: isLoading,
    error: errorMessage,
    removeError,
    refetch: async () => { await refetch(); },
    addProduct: payload => addMutation.mutateAsync(payload),
    removeProduct: id => removeMutation.mutateAsync(id),
  };
}

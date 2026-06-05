'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  createProduct,
  deleteProduct,
} from '@/services/api/product.service';
import type { Product, CreateProductPayload } from '@/types/api.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  /** Re-fetch the product list from the API */
  refetch: () => Promise<void>;
  /** Create a product and refresh the list */
  addProduct: (payload: CreateProductPayload) => Promise<Product>;
  /** Delete a product by id and refresh the list */
  removeProduct: (id: number) => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Fetches and manages the product list.
 * Provides helpers to create and delete products with automatic list refresh.
 *
 * @example
 * const { products, loading, error, addProduct, removeProduct } = useProducts();
 */
export function useProducts(): UseProductsReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-products'],
    // showAll: true → admin sees ALL products including inactive/draft
    queryFn: () => getProducts({ limit: 100, showAll: true }),
  });

  const addMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id: number) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['admin-products'] });
      const previous = queryClient.getQueryData<Product[]>(['admin-products']);
      queryClient.setQueryData<Product[]>(['admin-products'], old =>
        old ? old.filter(p => p.id !== id) : [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-products'], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const errorMessage = error instanceof Error ? error.message : error ? 'Une erreur inattendue est survenue.' : null;

  return {
    products: data ?? [],
    loading: isLoading,
    error: errorMessage,
    refetch: async () => { await refetch(); },
    addProduct: (payload) => addMutation.mutateAsync(payload),
    removeProduct: (id) => removeMutation.mutateAsync(id),
  };
}

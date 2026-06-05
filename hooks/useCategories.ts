'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, deleteCategory } from '@/services/api/category.service';
import type { Category, CreateCategoryPayload } from '@/types/api.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  /** Re-fetch the category list from the API */
  refetch: () => Promise<void>;
  /** Create a category and refresh the list */
  addCategory: (payload: CreateCategoryPayload) => Promise<Category>;
  /** Delete a category by id (also removes children from local state) */
  removeCategory: (id: number) => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Fetches and manages the category list.
 * Provides a helper to create categories with automatic list refresh.
 *
 * @example
 * const { categories, loading, error, addCategory } = useCategories();
 */
export function useCategories(): UseCategoriesReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: getCategories,
  });

  const addMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const removeMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id: number) => {
      // Optimistic update: remove category + children
      await queryClient.cancelQueries({ queryKey: ['admin-categories'] });
      const previous = queryClient.getQueryData<Category[]>(['admin-categories']);
      queryClient.setQueryData<Category[]>(['admin-categories'], old =>
        old ? old.filter(c => c.id !== id && c.parentId !== id) : [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-categories'], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const errorMessage = error instanceof Error ? error.message : error ? 'Une erreur inattendue est survenue.' : null;

  return {
    categories: data ?? [],
    loading: isLoading,
    error: errorMessage,
    refetch: async () => { await refetch(); },
    addCategory: (payload) => addMutation.mutateAsync(payload),
    removeCategory: (id) => removeMutation.mutateAsync(id),
  };
}

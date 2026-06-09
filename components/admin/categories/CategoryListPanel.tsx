'use client';

import { ArrowPathIcon, ExclamationCircleIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import CategoryCard from './CategoryCard';
import type { Category } from '@/types/api.types';
import { uploadCategoryImage } from '@/services/api/category.service';

interface CategoryListPanelProps {
  categories: Category[];
  loading?: boolean;
  error?: string | null;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
}

export default function CategoryListPanel({
  categories,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onRefresh,
}: CategoryListPanelProps) {
  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Chargement des catégories"
        className="py-10 flex items-center justify-center gap-2 text-slate-400"
      >
        <ArrowPathIcon className="w-5 h-5 animate-spin" aria-hidden="true" />
        <p>Chargement des catégories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <ExclamationCircleIcon className="w-5 h-5" />
        {error}
      </div>
    );
  }

  const rootCategories = categories.filter(c => !c.parentId);

  if (rootCategories.length === 0) {
    return (
      <div className="py-10 flex items-center justify-center gap-2 text-slate-400">
        <FolderOpenIcon className="w-8 h-8" />
        <p>Aucune catégorie trouvée</p>
      </div>
    );
  }

  const handleUploadImage = async (id: number, file: File) => {
    await uploadCategoryImage(file, id);
    onRefresh?.();
  };

  return (
    <div className="space-y-8">
      {rootCategories.map(root => {
        const children = categories.filter(c => c.parentId === root.id);
        return (
          <div key={root.id}>
            <CategoryCard
              category={root}
              children={children}
              onEdit={() => onEdit?.(root.id)}
              onDelete={() => onDelete?.(root.id)}
              onUploadImage={handleUploadImage}
            />
          </div>
        );
      })}
    </div>
  );
}

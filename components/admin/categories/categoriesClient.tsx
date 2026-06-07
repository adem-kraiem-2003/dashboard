'use client';

import { useState, useCallback } from 'react';
import { FolderIcon, StarIcon, ArrowTurnDownRightIcon, ArchiveBoxIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { useCategories } from '@/hooks/useCategories';

import AdminFooter from '@/components/admin/shared/AdminFooter';
import PageHeader from '@/components/admin/shared/PageHeader';
import CategoryStatsCards from '@/components/admin/categories/CategoryStatsCards';
import CategoryListPanel from '@/components/admin/categories/CategoryListPanel';
import CategoryFormPanel from '@/components/admin/categories/CategoryFormPanel';
import type { CreateCategoryData } from '@/components/admin/categories/CategoryFormPanel';

export default function CategoriesClient() {
  const { categories, loading, error, refetch, addCategory, removeCategory } = useCategories();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddCategory = useCallback(
    async (data: CreateCategoryData) => {
      setSubmitting(true);
      setFormError(null);
      try {
        await addCategory(data);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Erreur lors de la création');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [addCategory]
  );

  const handleDeleteCategory = useCallback(
    async (id: number) => {
      try {
        await removeCategory(id);
      } catch (err) {
        console.error('Delete failed', err);
      }
    },
    [removeCategory]
  );

  const stats = [
    {
      label: 'Total catégories',
      value: categories.length.toString(),
      Icon: FolderIcon,
      color: 'text-[#e2366a]',
      bgColor: 'bg-[#e2366a]/10',
    },
    {
      label: 'Catégories principales',
      value: categories.filter(c => !c.parentId).length.toString(),
      Icon: StarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Sous-catégories',
      value: categories.filter(c => c.parentId).length.toString(),
      Icon: ArrowTurnDownRightIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Total produits',
      value: categories.reduce((sum, c) => sum + (c.count ?? 0), 0).toString(),
      Icon: ArchiveBoxIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  return (
    <>
      

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-[1440px] mx-auto w-full p-4 lg:p-10">
          <PageHeader
            title="Catégories"
            description="Organisez vos produits dans des catégories et sous-catégories."
          />

          <div className="mb-8">
            <CategoryStatsCards stats={stats} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-7 space-y-4">
              <CategoryListPanel
                categories={categories}
                loading={loading}
                error={error}
                onDelete={handleDeleteCategory}
                onRefresh={refetch}
              />

              <div className="bg-[#e2366a]/5 border border-[#e2366a]/20 rounded-xl p-5 flex gap-4">
                <LightBulbIcon className="w-6 h-6 text-[#e2366a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">Conseil SEO</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Utilisez des noms de catégories clairs et des slugs courts pour améliorer le
                    référencement de votre boutique. Les slugs sont utilisés dans les URLs :{' '}
                    <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">
                      myshop.com/c/<em>votre-slug</em>
                    </code>
                  </p>
                </div>
              </div>
            </div>

            <div className="xl:col-span-5">
              <CategoryFormPanel
                categories={categories}
                onSubmit={handleAddCategory}
                submitting={submitting}
                error={formError}
              />
            </div>
          </div>

          <AdminFooter />
        </main>
      </div>
    </>
  );
}

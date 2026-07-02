'use client';

import { useState, useEffect, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ArchiveBoxIcon, PlusIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

import AdminFooter from '@/components/admin/shared/AdminFooter';
import AdminPageBar from '@/components/admin/shared/AdminPageBar';
import PageStats from '@/components/admin/shared/PageStats';
import ProductFilters from '@/components/admin/products/ProductFilters';
import ProductTable from '@/components/admin/products/ProductTable';
import Pagination from '@/components/admin/shared/Pagination';
import Link from 'next/link';

const PAGE_SIZE = 20;

export default function ProduitsClient() {
  const [page, setPage] = useState(1);
  const [removeBanner, setRemoveBanner] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { products, meta, loading, error, removeError, removeProduct } = useProducts({
    page,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    if (removeError) {
      setRemoveBanner(removeError);
      const t = setTimeout(() => setRemoveBanner(null), 6000);
      return () => clearTimeout(t);
    }
  }, [removeError]);

  const stats = [
    {
      Icon: ArchiveBoxIcon,
      bgColor: 'bg-[#e2366a]/10',
      label: 'Total produits',
      value: loading ? '…' : (meta?.totalItems ?? products.length).toLocaleString(),
    },
  ];

  function handlePageChange(next: number) {
    setPage(next);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <AdminPageBar
        title="Gestion des produits"
        actions={
          <Link
            href="/produits/edit"
            className="px-4 py-2 rounded-xl bg-[#e2366a] text-white font-bold text-sm shadow-lg shadow-[#e2366a]/20 hover:bg-[#e2366a]/90 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau produit</span>
          </Link>
        }
      />
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <main className="max-w-[1440px] mx-auto w-full p-4 lg:p-10">

          <div className="mb-6">
            <PageStats stats={stats} />
          </div>

          {removeBanner && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3"
            >
              <ExclamationCircleIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">{removeBanner}</span>
              <button
                onClick={() => setRemoveBanner(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="Fermer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mb-6">
            <ProductFilters />
          </div>

          <ProductTable
            products={products}
            loading={loading}
            error={error}
            onDelete={async (id) => {
              await removeProduct(id);
              if (products.length === 1 && page > 1) setPage(p => p - 1);
            }}
          />

          {meta && (
            <Pagination meta={meta} onPageChange={handlePageChange} />
          )}

          <AdminFooter />
        </main>
      </div>
    </>
  );
}

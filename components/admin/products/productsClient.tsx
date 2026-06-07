'use client';

import { useProducts } from '@/hooks/useProducts';
import { ArchiveBoxIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';

import AdminFooter from '@/components/admin/shared/AdminFooter';
import PageHeader from '@/components/admin/shared/PageHeader';
import PageStats from '@/components/admin/shared/PageStats';
import ProductFilters from '@/components/admin/products/ProductFilters';
import ProductTable from '@/components/admin/products/ProductTable';
import Link from 'next/link';

export default function ProduitsClient() {
  const { products, loading, error, removeProduct } = useProducts();

  const stats = [
    {
      Icon: ArchiveBoxIcon,
      bgColor: 'bg-[#e2366a]/10',
      label: 'Total produits',
      value: loading ? '…' : products.length.toLocaleString(),
    },
    {
      Icon: CheckCircleIcon,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Actifs',
      value: loading ? '…' : products.filter(p => p.active).length.toLocaleString(),
    },
  ];

  return (
    <>
      

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-[1440px] mx-auto w-full p-4 lg:p-10">
          <PageHeader
            title="Gestion des produits"
            description="Gérez votre inventaire et catalogue produits"
            actions={
              <Link
                href="/produits/edit"
                className="px-5 py-2.5 rounded-xl bg-[#e2366a] text-white font-bold text-sm shadow-lg shadow-[#e2366a]/20 hover:bg-[#e2366a]/90 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Nouveau produit
              </Link>
            }
          />

          <div className="mb-6">
            <PageStats stats={stats} />
          </div>

          <div className="mb-6">
            <ProductFilters />
          </div>

          <ProductTable products={products} loading={loading} error={error} onDelete={removeProduct} />

          <AdminFooter />
        </main>
      </div>
    </>
  );
}

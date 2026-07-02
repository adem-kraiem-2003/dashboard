'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExclamationCircleIcon, InboxIcon, PhotoIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types/api.types';
import { formatPrice } from '@/lib/format';
import ProductCardMobile from './ProductCardMobile';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onDelete: (id: number) => Promise<void>;
}

const STATUS_BADGE: Record<string, { cls: string; label: string; dot: string }> = {
  active: {
    cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    label: 'En stock',
    dot: 'bg-green-500',
  },
  rupture: {
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    label: 'Rupture',
    dot: 'bg-red-500',
  },
  inactive: {
    cls: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    label: 'Inactif',
    dot: 'bg-slate-500',
  },
};

function getStockStatus(p: Product) {
  const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  if (!p.active) return 'inactive';
  if (totalStock === 0) return 'rupture';
  return 'active';
}

function getStockLabel(p: Product) {
  const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  return `${totalStock} en stock`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="w-12 h-12 rounded-lg skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/5 rounded skeleton-shimmer" />
        <div className="h-3 w-1/4 rounded skeleton-shimmer" />
      </div>
      <div className="hidden sm:block h-4 w-16 rounded skeleton-shimmer" />
      <div className="h-6 w-16 rounded-full skeleton-shimmer" />
      <div className="flex gap-2">
        <div className="w-11 h-11 rounded-lg skeleton-shimmer" />
        <div className="w-11 h-11 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

export default function ProductTable({ products, loading, error, onDelete }: ProductTableProps) {
  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Chargement des produits"
        data-testid="products-loading"
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
      >
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="products-error" className="py-6 px-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
        <ExclamationCircleIcon className="w-5 h-5" aria-hidden="true" />
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div data-testid="products-empty" className="py-16 text-center text-slate-500">
        <InboxIcon className="w-16 h-16 mx-auto mb-3 opacity-20" aria-hidden="true" />
        <p>Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card list */}
      <div
        data-testid="products-table"
        className="block md:hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        {products.map(product => (
          <ProductCardMobile key={product.id} product={product} onDelete={onDelete} />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table data-testid="products-table-desktop" className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Prix</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {products.map(product => {
              const status = getStockStatus(product);
              const badge = STATUS_BADGE[status];
              const thumbUrl = product.images?.find(i => i.type === 'PRINCIPALE')?.url ?? product.images?.[0]?.url;

              return (
                <tr
                  key={product.id}
                  data-testid={`product-row-${product.id}`}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {thumbUrl ? (
                          <Image alt={product.name} className="w-full h-full object-cover" src={thumbUrl} width={48} height={48} loading="lazy" />
                        ) : (
                          <PhotoIcon className="w-6 h-6 text-slate-300" aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.category?.name ?? '—'}</td>
                  <td className="px-6 py-4 font-bold text-sm tabular-nums">{formatPrice(product.price ?? 0)}</td>
                  <td className="px-6 py-4 text-sm">{getStockLabel(product)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>
                      <span className={`w-1 h-1 rounded-full ${badge.dot}`} aria-hidden="true" />
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        data-testid={`product-edit-${product.id}`}
                        href={`/produits/edit?id=${product.id}`}
                        aria-label={`Modifier le produit ${product.name}`}
                        className="flex items-center justify-center min-w-[44px] min-h-[44px] text-slate-400 hover:text-[#e2366a] focus:text-[#e2366a] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2366a]/40"
                      >
                        <PencilIcon className="w-4 h-4" aria-hidden="true" />
                      </Link>
                      <button
                        data-testid={`product-delete-${product.id}`}
                        onClick={() => {
                          if (window.confirm(`Supprimer "${product.name}" ? Cette action est irréversible.`)) {
                            onDelete(product.id);
                          }
                        }}
                        aria-label={`Supprimer le produit ${product.name}`}
                        className="flex items-center justify-center min-w-[44px] min-h-[44px] text-slate-400 hover:text-red-600 focus:text-red-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/40"
                      >
                        <TrashIcon className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

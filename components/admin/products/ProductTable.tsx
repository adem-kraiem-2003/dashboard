'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowPathIcon, ExclamationCircleIcon, InboxIcon, PhotoIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types/api.types';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onDelete: (id: number) => Promise<void>;
}

export default function ProductTable({ products, loading, error, onDelete }: ProductTableProps) {
  const getStockLabel = (p: Product) => {
    const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
    return `${totalStock} en stock`;
  };

  const getStockStatus = (p: Product) => {
    const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
    if (!p.active) return 'inactive';
    if (totalStock === 0) return 'rupture';
    return 'active';
  };

  if (loading) {
    return (
      <div data-testid="products-loading" className="py-10 flex items-center justify-center gap-2 text-slate-400">
        <ArrowPathIcon className="w-5 h-5 animate-spin" />
        <p>Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="products-error" className="py-6 px-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
        <ExclamationCircleIcon className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div data-testid="products-empty" className="py-16 text-center text-slate-500">
        <InboxIcon className="w-16 h-16 mx-auto mb-3 opacity-20" />
        <p>Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <table data-testid="products-table" className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Produit
            </th>
            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Catégorie
            </th>
            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Prix
            </th>
            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {products.map(product => {
            const status = getStockStatus(product);
            const statusBadge: Record<string, { cls: string; label: string; dot: string }> = {
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
            const badge = statusBadge[status];

            return (
              <tr
                key={product.id}
                data-testid={`product-row-${product.id}`}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      {(() => {
                        const thumbUrl = product.images?.find(i => i.type === 'PRINCIPALE')?.url
                          ?? product.images?.[0]?.url;
                        return thumbUrl ? (
                          <img alt={product.name} className="w-full h-full object-cover" loading="lazy" src={thumbUrl} />
                        ) : (
                          <PhotoIcon className="w-6 h-6 text-slate-300" />
                        );
                      })()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{product.category?.name ?? '—'}</td>
                <td className="px-6 py-4 font-bold text-sm">{(product.price ?? 0).toFixed(2)} DT</td>
                <td className="px-6 py-4 text-sm">{getStockLabel(product)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>
                    <span className={`w-1 h-1 rounded-full ${badge.dot}`}></span>
                    {badge.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <Link
                      data-testid={`product-edit-${product.id}`}
                      href={`/produits/edit?id=${product.id}`}
                      className="p-2 text-slate-400 hover:text-[#e2366a] transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Link>
                    <button
                      data-testid={`product-delete-${product.id}`}
                      onClick={() => onDelete(product.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

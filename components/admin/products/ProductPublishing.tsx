'use client';

import React from 'react';
import { BookmarkIcon, EyeIcon, ShoppingCartIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types/api.types';

interface ProductPublishingProps {
  isActive: boolean;
  onToggleActive: (active: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  product: Product | null;
  isEditMode: boolean;
  onDelete?: () => void;
}

export default function ProductPublishing({
  isActive,
  onToggleActive,
  onSubmit,
  onCancel,
  submitting,
  product,
  isEditMode,
  onDelete,
}: ProductPublishingProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-28">
        <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Publishing</h3>
        <div className="space-y-6">
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Product Status</p>
              <p className="text-xs text-slate-500">Currently live on store</p>
            </div>
            <button
              type="button"
              onClick={() => onToggleActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e2366a] focus:ring-offset-2 ${
                isActive ? 'bg-[#e2366a]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] ${
                submitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-[#e2366a] hover:bg-[#e2366a]/90 shadow-[#e2366a]/20'
              }`}
            >
              <BookmarkIcon className="w-5 h-5" />
              {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
          </div>

          {/* Stats */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Product Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <EyeIcon className="w-3 h-3" />
                  <span className="text-xs">Total Views</span>
                </div>
                <span className="text-xs font-bold">{product?.id ? '12,402' : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShoppingCartIcon className="w-3 h-3" />
                  <span className="text-xs">Total Sales</span>
                </div>
                <span className="text-xs font-bold">{product?.id ? '482' : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <ArrowPathIcon className="w-3 h-3" />
                  <span className="text-xs">Last Updated</span>
                </div>
                <span className="text-xs font-bold">
                  {product?.updatedAt ? new Date(product.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Delete Button (Edit mode only) */}
          {isEditMode && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full mt-4 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 text-xs font-bold transition-colors active:scale-[0.98]"
            >
              <TrashIcon className="w-4 h-4" />
              Delete Product Permanently
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

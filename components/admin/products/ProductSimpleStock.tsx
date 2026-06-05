'use client';

import React from 'react';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface ProductSimpleStockProps {
  stock: number;
  onChange: (stock: number) => void;
}

export default function ProductSimpleStock({ stock, onChange }: ProductSimpleStockProps) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-6">
        <ArchiveBoxIcon className="w-5 h-5 text-[#e2366a]" />
        <h2 className="text-xl font-bold">Stock</h2>
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Quantité disponible
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, stock - 1))}
            className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-lg"
          >
            −
          </button>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-24 text-center rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-[#e2366a] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => onChange(stock + 1)}
            className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-lg"
          >
            +
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Ce produit n&apos;a pas de taille ni de couleur (accessoire, maquillage…)
        </p>
      </div>
    </section>
  );
}

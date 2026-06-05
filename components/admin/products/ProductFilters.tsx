'use client';

import React, { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface ProductFiltersProps {
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
  onSortChange?: (sort: string) => void;
  onClearFilters?: () => void;
}

export default function ProductFilters({
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('default');

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onCategoryChange?.(value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onStatusChange?.(value);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange?.(value);
  };

  const handleClear = () => {
    setCategory('all');
    setStatus('all');
    setSort('default');
    onClearFilters?.();
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-400 uppercase">Catégorie:</span>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="bg-transparent border-none text-sm p-0 focus:ring-0 font-medium"
        >
          <option value="all">Toutes les catégories</option>
          <option value="electronics">Électronique</option>
          <option value="fashion">Mode</option>
          <option value="home">Maison</option>
          <option value="sports">Sport</option>
        </select>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-400 uppercase">Statut:</span>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-transparent border-none text-sm p-0 focus:ring-0 font-medium"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="rupture">En rupture</option>
        </select>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-400 uppercase">Prix:</span>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="bg-transparent border-none text-sm p-0 focus:ring-0 font-medium"
        >
          <option value="default">Par défaut</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </div>

      <button
        onClick={handleClear}
        className="ml-auto flex items-center gap-2 text-slate-500 hover:text-[#e2366a] transition-colors text-sm font-medium"
      >
        <FunnelIcon className="w-5 h-5" />
        Effacer les filtres
      </button>
    </div>
  );
}

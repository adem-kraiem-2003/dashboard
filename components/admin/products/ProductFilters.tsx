'use client';

import React, { useState, useEffect } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'nf_product_filters';

interface SavedFilters {
  category: string;
  status: string;
  sort: string;
}

function loadFilters(): SavedFilters {
  if (typeof window === 'undefined') return { category: 'all', status: 'all', sort: 'default' };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedFilters;
  } catch { /* ignore */ }
  return { category: 'all', status: 'all', sort: 'default' };
}

function saveFilters(filters: SavedFilters) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch { /* ignore */ }
}

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
  const initial = loadFilters();
  const [category, setCategory] = useState(initial.category);
  const [status, setStatus] = useState(initial.status);
  const [sort, setSort] = useState(initial.sort);

  // Persist on every change
  useEffect(() => {
    saveFilters({ category, status, sort });
  }, [category, status, sort]);

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
    saveFilters({ category: 'all', status: 'all', sort: 'default' });
    onClearFilters?.();
  };

  const hasActiveFilters = category !== 'all' || status !== 'all' || sort !== 'default';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-400 uppercase">Catégorie:</span>
        <select
          data-testid="filter-category"
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
          data-testid="filter-status"
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
          data-testid="filter-sort"
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
        data-testid="filter-clear"
        onClick={handleClear}
        className={`ml-auto flex items-center gap-2 transition-colors text-sm font-medium ${
          hasActiveFilters
            ? 'text-[#e2366a] hover:text-[#c82d5e]'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <FunnelIcon className="w-4 h-4" />
        Effacer les filtres
        {hasActiveFilters && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#e2366a] text-white text-[10px] font-black">
            {[category !== 'all', status !== 'all', sort !== 'default'].filter(Boolean).length}
          </span>
        )}
      </button>
    </div>
  );
}

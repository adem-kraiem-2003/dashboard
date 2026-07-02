'use client';

import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import BottomSheet from '@/components/admin/shared/BottomSheet';

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

const SELECT_CLASS = 'bg-transparent border-none text-sm p-0 focus:ring-0 font-medium';

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
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    saveFilters({ category, status, sort });
  }, [category, status, sort]);

  const handleCategoryChange = (value: string) => { setCategory(value); onCategoryChange?.(value); };
  const handleStatusChange   = (value: string) => { setStatus(value);   onStatusChange?.(value); };
  const handleSortChange     = (value: string) => { setSort(value);     onSortChange?.(value); };

  const handleClear = () => {
    setCategory('all');
    setStatus('all');
    setSort('default');
    saveFilters({ category: 'all', status: 'all', sort: 'default' });
    onClearFilters?.();
  };

  const hasActiveFilters = category !== 'all' || status !== 'all' || sort !== 'default';
  const activeCount = [category !== 'all', status !== 'all', sort !== 'default'].filter(Boolean).length;

  const filterSelects = (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-category-sheet" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catégorie</label>
        <select
          id="filter-category-sheet"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#e2366a] focus:outline-none"
        >
          <option value="all">Toutes les catégories</option>
          <option value="electronics">Électronique</option>
          <option value="fashion">Mode</option>
          <option value="home">Maison</option>
          <option value="sports">Sport</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-status-sheet" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</label>
        <select
          id="filter-status-sheet"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#e2366a] focus:outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="rupture">En rupture</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-sort-sheet" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trier par prix</label>
        <select
          id="filter-sort-sheet"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-[#e2366a] focus:outline-none"
        >
          <option value="default">Par défaut</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: single "Filtres" button */}
      <div className="flex md:hidden items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors active:bg-slate-100 dark:active:bg-slate-700"
        >
          <FunnelIcon className="w-4 h-4" aria-hidden="true" />
          Filtres
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#e2366a] text-white text-[10px] font-black">
              {activeCount}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            data-testid="filter-clear"
            onClick={handleClear}
            aria-label="Effacer les filtres"
            className="flex items-center gap-1.5 px-3 py-3 min-h-[44px] text-sm font-medium text-[#e2366a] hover:text-[#c82d5e] transition-colors"
          >
            <XMarkIcon className="w-4 h-4" aria-hidden="true" />
            Effacer
          </button>
        )}
      </div>

      {/* Desktop: inline filter row */}
      <div className="hidden md:flex bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <label htmlFor="filter-category" className="text-xs font-bold text-slate-400 uppercase">Catégorie:</label>
          <select
            id="filter-category"
            data-testid="filter-category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">Toutes les catégories</option>
            <option value="electronics">Électronique</option>
            <option value="fashion">Mode</option>
            <option value="home">Maison</option>
            <option value="sports">Sport</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <label htmlFor="filter-status" className="text-xs font-bold text-slate-400 uppercase">Statut:</label>
          <select
            id="filter-status"
            data-testid="filter-status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="rupture">En rupture</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <label htmlFor="filter-sort" className="text-xs font-bold text-slate-400 uppercase">Prix:</label>
          <select
            id="filter-sort"
            data-testid="filter-sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className={SELECT_CLASS}
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
          <FunnelIcon className="w-4 h-4" aria-hidden="true" />
          Effacer les filtres
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#e2366a] text-white text-[10px] font-black">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile filter bottom sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filtres">
        <div className="p-5 space-y-4">
          {filterSelects}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { handleClear(); setSheetOpen(false); }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Effacer
            </button>
            <button
              onClick={() => setSheetOpen(false)}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-xl bg-[#e2366a] text-white text-sm font-bold shadow-lg shadow-[#e2366a]/20 hover:bg-[#e2366a]/90 transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

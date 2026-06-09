'use client';

import React, { useState } from 'react';
import { CubeIcon, MagnifyingGlassIcon, BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function AdminHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-10 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-[#e2366a]">
            <CubeIcon className="w-8 h-8" />
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
              Admin Console
            </h2>
          </div>
          <div className="hidden md:flex relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              data-testid="header-search-input"
              aria-label="Rechercher des produits"
              className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#e2366a]/50 text-sm"
              placeholder="Rechercher des produits..."
              type="search"
              name="admin-search"
            />
          </div>
          {searchOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  data-testid="header-search-input-mobile"
                  aria-label="Rechercher des produits"
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#e2366a]/50 text-sm"
                  placeholder="Rechercher des produits..."
                  type="search"
                  name="admin-search-mobile"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            data-testid="header-search-toggle"
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#e2366a] transition-colors"
            onClick={() => setSearchOpen(v => !v)}
            aria-label={searchOpen ? 'Fermer la recherche' : 'Ouvrir la recherche'}
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
          <button
            data-testid="header-notifications"
            aria-label="Voir les notifications"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#e2366a] transition-colors"
          >
            <BellIcon className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            aria-label="Paramètres"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#e2366a] transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="h-10 w-10 rounded-full bg-[#e2366a]/10 border-2 border-[#e2366a]/20 flex items-center justify-center overflow-hidden">
            <img
              alt="Avatar administrateur"
              className="w-full h-full object-cover"
              loading="eager"
              width={40}
              height={40}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVSaheT-IlFqpfW_z4VpDl4jNOSZ_x-l_kukelt6EzpH6NM1vlbEcAZw5KkwMSwIT87xWKmo1UjlsT77oFivo53bDkvAy7s_NB1Ug2flpOZcnntSwAfJX8WbmGbwhJgYoFPZmG0ODO5nVtAUPUssdbaGHbUC2OeQSb-CK_G9tonutKraMe6wO3gF16qBM5vfVF4seOe7gSEZsgdWTaQ3xfTdmisNr8A6JZkPU_2mLH2HQqP-iegu3pfSiYl2oHdwxYw6B9KnUtwLM1"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

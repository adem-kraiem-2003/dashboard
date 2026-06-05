'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, BellIcon, PlusIcon } from '@heroicons/react/24/outline';

interface DashboardHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onNotificationClick: () => void;
}

export default function DashboardHeader({ search, onSearchChange, onNotificationClick }: DashboardHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#1a1114]/80 backdrop-blur-md sticky top-0 z-10 pl-14 md:pl-8 pr-4 md:pr-8 flex items-center justify-between gap-3">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            ref={searchRef}
            className="w-full pl-10 pr-16 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#e2366a]/20 placeholder:text-slate-400"
            placeholder="Rechercher une commande, un client..."
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
          <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 text-[10px] text-slate-400 font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <button
          className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors relative"
          onClick={onNotificationClick}
          aria-label="Notifications"
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 size-2 bg-[#e2366a] rounded-full border-2 border-white dark:border-[#1a1114]"></span>
        </button>
        <Link
          href="/produits/edit"
          className="px-3 md:px-4 py-2 bg-[#e2366a] hover:bg-[#e2366a]/90 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-[#e2366a]/20"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Nouveau Produit</span>
        </Link>
      </div>
    </header>
  );
}

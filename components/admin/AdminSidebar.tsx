'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  ArchiveBoxIcon,
  TagIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  RectangleStackIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

const navItems = [
  { href: '/dashboard', Icon: HomeIcon, label: 'Dashboard' },
  { href: '/produits', Icon: ArchiveBoxIcon, label: 'Produits' },
  { href: '/category', Icon: TagIcon, label: 'Catégories' },
  { href: '/commande', Icon: ShoppingCartIcon, label: 'Commandes' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 bg-[#e2366a] rounded-xl flex items-center justify-center text-white shrink-0">
          <RectangleStackIcon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">Nouri Fashion</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Admin Console</p>
        </div>
        {/* Close button (mobile only) */}
        <button
          className="ml-auto md:hidden size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all bg-[#e2366a]/10 text-[#e2366a] border-r-[3px] border-r-[#e2366a]'
                  : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-all'
              }
            >
              <item.Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-all"
        >
          <Cog6ToothIcon className="w-5 h-5" />
          Settings
        </Link>
        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3">
          <div className="size-8 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="Avatar administrateur"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCt2PeeKu5YBB9Oq9zEpOfkFJqi3zYH9Vt2aKRpJjPTN5Ub-A1AOyIDCBRXmHl8ObX4S8Shk6wHU6q9zl9fGom8FHwOFFvSm8_3BLI4nFflVSx77dDElxAxGmP9TlJjVjtjOnt6c05_9_B7i_9wrQbjoNZ2GJd2kmUiPWMztdHFE2ziT_8eXhnRFTP1Y2glDrNlTc6QVRFODyW9Ho5FQPJjlGySE_sdFwiuGwzdsrJQNXa-k8Oaxac4LlEUzYrm1DYTcLW5Qm0LWYe"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">Sarah Nouri</p>
            <p className="text-[10px] text-slate-500 truncate">Propriétaire</p>
          </div>
          <ArrowRightOnRectangleIcon className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 size-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 transition-colors"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Ouvrir le menu"
      >
        {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1114] flex-col sticky top-0 h-screen transition-colors duration-300 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1114] flex flex-col transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

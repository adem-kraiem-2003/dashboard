import type { ReactNode } from 'react';

interface AdminPageBarProps {
  title: string;
  actions?: ReactNode;
}

export default function AdminPageBar({ title, actions }: AdminPageBarProps) {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#1a1114]/80 backdrop-blur-md pl-14 md:pl-8 pr-4 md:pr-8 flex items-center justify-between gap-3">
      <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white truncate">
        {title}
      </h1>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

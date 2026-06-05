import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 mb-6 text-sm font-medium text-slate-500 dark:text-slate-400">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-[#e2366a]">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-white">{item.label}</span>
          )}
          {idx < items.length - 1 && (
            <ChevronRightIcon className="w-3 h-3" />
          )}
        </div>
      ))}
    </nav>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types/api.types';
import { formatPrice } from '@/lib/format';

const STATUS = {
  active:   { cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  dot: 'bg-green-500',  label: 'En stock' },
  rupture:  { cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',           dot: 'bg-red-500',    label: 'Rupture'  },
  inactive: { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',      dot: 'bg-slate-400',  label: 'Inactif'  },
} as const;

interface ProductCardMobileProps {
  product: Product;
  onDelete: (id: number) => Promise<void>;
}

export default function ProductCardMobile({ product, onDelete }: ProductCardMobileProps) {
  const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
  const statusKey: keyof typeof STATUS = !product.active ? 'inactive' : totalStock === 0 ? 'rupture' : 'active';
  const status = STATUS[statusKey];
  const thumbUrl = product.images?.find(i => i.type === 'PRINCIPALE')?.url ?? product.images?.[0]?.url;

  return (
    <div
      data-testid={`product-card-mobile-${product.id}`}
      className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
    >
      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
        {thumbUrl ? (
          <Image src={thumbUrl} alt={product.name} width={48} height={48} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <PhotoIcon className="w-6 h-6 text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">{formatPrice(product.price ?? 0)}</span>
          <span className="text-xs text-slate-400" aria-hidden="true">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{totalStock} en stock</span>
        </div>
      </div>

      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${status.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
        {status.label}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <Link
          data-testid={`product-edit-${product.id}`}
          href={`/produits/edit?id=${product.id}`}
          aria-label={`Modifier ${product.name}`}
          className="flex items-center justify-center w-11 h-11 rounded-lg text-slate-400 hover:text-[#e2366a] hover:bg-[#e2366a]/10 active:bg-[#e2366a]/15 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e2366a]/40"
        >
          <PencilIcon className="w-4 h-4" aria-hidden="true" />
        </Link>
        <button
          data-testid={`product-delete-${product.id}`}
          onClick={() => {
            if (window.confirm(`Supprimer "${product.name}" ? Cette action est irréversible.`)) {
              onDelete(product.id);
            }
          }}
          aria-label={`Supprimer ${product.name}`}
          className="flex items-center justify-center w-11 h-11 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/40"
        >
          <TrashIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

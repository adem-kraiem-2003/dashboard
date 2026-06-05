import Link from 'next/link';
import { PhotoIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types/api.types';

interface ProductTableRowProps {
  product: Product;
  onDelete: (id: number) => Promise<void>;
}

export default function ProductTableRow({ product, onDelete }: ProductTableRowProps) {
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;

  const getStockStatus = (p: Product) => {
    if (!p.active) return 'inactive';
    if (totalStock === 0) return 'rupture';
    return 'active';
  };

  const statusBadges = {
    active: { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Actif' },
    rupture: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500', label: 'Rupture' },
    inactive: { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-500', label: 'Inactif' },
  };

  const status = getStockStatus(product);
  const statusBadge = statusBadges[status as keyof typeof statusBadges];

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
            {product.images?.[0]?.url ? (
              <img alt={product.name} className="w-full h-full object-cover" loading="lazy" src={product.images[0].url} />
            ) : (
              <PhotoIcon className="w-6 h-6 text-slate-300" />
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-bold text-sm">{product.name}</p>
        <p className="text-xs text-slate-400">{product.slug}</p>
      </td>
      <td className="px-6 py-4 text-sm">{product.category?.name ?? '—'}</td>
      <td className="px-6 py-4 font-bold text-sm">{(product.price ?? 0).toFixed(2)} €</td>
      <td className="px-6 py-4 text-sm">{totalStock} en stock</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge.cls}`}>
          <span className={`w-1 h-1 rounded-full ${statusBadge.dot}`}></span>
          {statusBadge.label}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/produits/edit?id=${product.id}`} className="p-2 text-slate-400 hover:text-[#e2366a] transition-colors">
            <PencilIcon className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

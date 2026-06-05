'use client';

import { useState, useRef, useEffect } from 'react';
import type { Product } from '@/types/api.types';

interface ProductAssociatedProps {
  allProducts: Product[];
  associatedIds: number[];
  currentProductId?: number;
  onChange: (ids: number[]) => void;
}

export default function ProductAssociated({
  allProducts,
  associatedIds,
  currentProductId,
  onChange,
}: ProductAssociatedProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = query.toLowerCase().trim();
  const suggestions = q
    ? allProducts
        .filter(
          (p) =>
            p.id !== currentProductId &&
            !associatedIds.includes(p.id) &&
            (p.name.toLowerCase().includes(q) || String(p.id).includes(q)),
        )
        .slice(0, 6)
    : [];

  const selectedProducts = allProducts.filter((p) => associatedIds.includes(p.id));

  function addProduct(product: Product) {
    onChange([...associatedIds, product.id]);
    setQuery('');
    setIsOpen(false);
  }

  function removeProduct(id: number) {
    onChange(associatedIds.filter((i) => i !== id));
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getThumb(product: Product): string | undefined {
    const main = product.images?.find((img) => img.type === 'PRINCIPALE');
    return main?.url ?? product.images?.[0]?.url ?? product.image;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Produits associés
        </h3>
        {associatedIds.length > 0 && (
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-brand-dark text-white text-xs font-semibold">
            {associatedIds.length}
          </span>
        )}
      </div>

      {/* Search input */}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Rechercher par nom ou ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
            {suggestions.map((product) => {
              const thumb = getThumb(product);
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => addProduct(product)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={product.name}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                        #{product.id}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        ID {product.id} · {product.price.toFixed(2)} MAD
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Selected products */}
      {selectedProducts.length > 0 ? (
        <ul className="space-y-2">
          {selectedProducts.map((product) => {
            const thumb = getThumb(product);
            return (
              <li
                key={product.id}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50"
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                    #{product.id}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    ID {product.id} · {product.price.toFixed(2)} MAD
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Retirer ${product.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 text-center py-3">
          Aucun produit associé. Recherchez ci-dessus pour en ajouter.
        </p>
      )}
    </div>
  );
}

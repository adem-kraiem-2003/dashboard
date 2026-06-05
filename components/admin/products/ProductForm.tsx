'use client';

import React, { useState } from 'react';
import { InformationCircleIcon, SparklesIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { Category } from '@/types/api.types';

export interface ProductFormData {
  name: string;
  slug: string;
  categoryId: number;
  description: string;
  price: number;
}

interface ProductFormProps {
  data: ProductFormData;
  onChange: (data: ProductFormData) => void;
  categories?: Category[];
}

const SLUG_MAX = 60;

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, SLUG_MAX);
}

/** Strip any character that is not a-z, 0-9 or hyphen, then cap at 60 */
function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, SLUG_MAX);
}

export default function ProductForm({ data, onChange, categories = [] }: ProductFormProps) {
  // true = slug follows the name automatically; false = user took manual control
  const [slugLocked, setSlugLocked] = useState(true);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    onChange({
      ...data,
      name,
      slug: slugLocked ? slugify(name) : data.slug,
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugLocked(false);
    // Enforce allowed chars + max length in real-time
    onChange({ ...data, slug: sanitizeSlug(e.target.value) });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: name === 'price' ? parseFloat(value) || 0
             : name === 'categoryId' ? parseInt(value, 10) || 0
             : value,
    });
  };

  const resetSlug = () => {
    setSlugLocked(true);
    onChange({ ...data, slug: slugify(data.name) });
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
        <InformationCircleIcon className="w-5 h-5 text-[#e2366a]" />
        <h2 className="text-xl font-bold">Informations principales</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom du produit */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Nom du produit
          </label>
          <input
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a]"
            type="text"
            name="name"
            value={data.name}
            onChange={handleNameChange}
            required
            placeholder="Ex : Robe florale printemps 2026"
          />
        </div>

        {/* Slug — auto-généré */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Slug URL
            </label>
            {slugLocked ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <SparklesIcon className="w-3 h-3" />
                Généré automatiquement
              </span>
            ) : (
              <button
                type="button"
                onClick={resetSlug}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#e2366a] hover:underline"
              >
                <ArrowPathIcon className="w-3 h-3" />
                Regénérer depuis le nom
              </button>
            )}
          </div>
          <div className="flex rounded-lg shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs whitespace-nowrap">
              /produits/
            </span>
            <input
              className={`flex-1 rounded-none rounded-r-lg border text-sm dark:bg-slate-800 focus:ring-[#e2366a] transition-colors ${
                data.slug.length >= SLUG_MAX
                  ? 'border-amber-400 dark:border-amber-600 focus:border-amber-500'
                  : slugLocked
                    ? 'border-emerald-300 dark:border-emerald-700 focus:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10'
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#e2366a]'
              }`}
              type="text"
              name="slug"
              value={data.slug}
              onChange={handleSlugChange}
              required
              maxLength={SLUG_MAX}
              placeholder="slug-du-produit"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-400">
              Lettres minuscules, chiffres et tirets uniquement — modifiez manuellement ou cliquez sur &quot;Regénérer&quot;.
            </p>
            <span className={`text-[11px] font-semibold tabular-nums shrink-0 ${
              data.slug.length >= SLUG_MAX ? 'text-amber-500' : 'text-slate-400'
            }`}>
              {data.slug.length}/{SLUG_MAX}
            </span>
          </div>
          {data.slug.length >= SLUG_MAX && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <ExclamationTriangleIcon className="w-3 h-3" />
              Longueur maximale atteinte (60 caractères).
            </p>
          )}
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Catégorie</label>
          <select
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a] text-sm"
            name="categoryId"
            value={data.categoryId}
            onChange={handleChange}
          >
            <option value={0} disabled>-- Sélectionner une catégorie --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Prix */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Prix (MAD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">MAD</span>
            <input
              className="w-full pl-14 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a]"
              type="number"
              name="price"
              value={data.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a] text-sm"
            rows={4}
            name="description"
            value={data.description}
            onChange={handleChange}
            placeholder="Décrivez le produit : matière, coupe, occasions..."
          />
        </div>
      </div>
    </section>
  );
}

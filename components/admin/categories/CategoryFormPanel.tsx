'use client';

import { useState } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import type { Category } from '@/types/api.types';

interface CategoryFormPanelProps {
  onSubmit: (data: CreateCategoryData) => Promise<void>;
  categories?: Category[];
  submitting?: boolean;
  error?: string | null;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  parentId?: number;
  description?: string;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function CategoryFormPanel({
  onSubmit,
  categories = [],
  submitting = false,
  error: initialError = null,
}: CategoryFormPanelProps) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    parentId: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(initialError);

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setError(null);
    try {
      await onSubmit({
        name: form.name,
        slug: form.slug,
        parentId: form.parentId ? Number(form.parentId) : undefined,
        description: form.description || undefined,
      });
      setForm({ name: '', slug: '', parentId: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-28">
      <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
        <PlusCircleIcon className="w-5 h-5 text-[#e2366a]" />
        <h3 className="text-lg font-bold">Ajouter une catégorie</h3>
      </div>

      {error && (
        <div data-testid="category-form-error" className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Nom de la catégorie
          </label>
          <input
            data-testid="category-form-name"
            type="text"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Ex: Électronique"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#e2366a] focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 transition-all"
            disabled={submitting}
          />
        </div>

        {/* Slug Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Slug (URL)
          </label>
          <input
            data-testid="category-form-slug"
            type="text"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            placeholder="electronique"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#e2366a] focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 transition-all"
            disabled={submitting}
          />
        </div>

        {/* Parent Category Select */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Catégorie parent (optionnel)
          </label>
          <select
            data-testid="category-form-parent"
            value={form.parentId}
            onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#e2366a] focus:border-transparent text-slate-900 dark:text-white transition-all"
            disabled={submitting}
          >
            <option value="">-- Aucune (catégorie principale) --</option>
            {categories
              .filter(c => !c.parentId)
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Description (optionnel)
          </label>
          <textarea
            data-testid="category-form-description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description courte de la catégorie..."
            rows={3}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#e2366a] focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 transition-all resize-none"
            disabled={submitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          data-testid="category-form-submit"
          disabled={submitting || !form.name.trim()}
          className="w-full px-5 py-2.5 rounded-xl bg-[#e2366a] text-white font-bold text-sm hover:bg-[#e2366a]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Création en cours...' : 'Créer la catégorie'}
        </button>
      </form>

      <p className="mt-6 text-xs text-center text-slate-400">
        {categories.length} catégorie{categories.length > 1 ? 's' : ''} au total
      </p>
    </div>
  );
}

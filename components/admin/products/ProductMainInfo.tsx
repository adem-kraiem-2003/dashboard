'use client';

import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { Product } from '@/types/api.types';

interface ProductMainInfoProps {
  formData: {
    name: string;
    slug: string;
    category: string;
    description: string;
    price: number;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function ProductMainInfo({ formData, onChange }: ProductMainInfoProps) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
        <InformationCircleIcon className="w-5 h-5 text-[#e2366a]" />
        <h2 className="text-xl font-bold">Main Information</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Product Name</label>
          <input
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a]"
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            placeholder="Nom du produit"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Slug</label>
          <div className="flex rounded-lg shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm">
              myshop.com/p/
            </span>
            <input
              className="flex-1 rounded-none rounded-r-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a] text-sm"
              type="text"
              name="slug"
              value={formData.slug}
              onChange={onChange}
              required
              placeholder="product-slug"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Category</label>
          <select
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a] text-sm"
            name="category"
            value={formData.category}
            onChange={onChange}
          >
            <option>Electronics</option>
            <option>Audio &amp; Headphones</option>
            <option>Accessories</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a] text-sm"
            rows={4}
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Description du produit..."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Base Price (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              className="w-full pl-8 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-[#e2366a] focus:ring-[#e2366a]"
              type="number"
              name="price"
              value={formData.price}
              onChange={onChange}
              required
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

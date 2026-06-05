'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  FolderIcon,
  ArrowPathIcon,
  CameraIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowTurnDownRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { Category } from '@/types/api.types';

interface CategoryCardProps {
  category: Category;
  children?: Category[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onViewProducts?: (id: number) => void;
  onUploadImage?: (id: number, file: File) => Promise<void>;
}

export default function CategoryCard({
  category,
  children = [],
  onEdit,
  onDelete,
  onViewProducts,
  onUploadImage,
}: CategoryCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset error state whenever the image URL changes (e.g. after a new upload +
  // React Query refetch). Without this, a previously-failed image would stay
  // hidden even after a successful new upload.
  useEffect(() => {
    setImgError(false);
  }, [category.imageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    try {
      setUploading(true);
      await onUploadImage(category.id, file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Determines whether a valid, renderable image URL is available
  const hasImage = Boolean(category.imageUrl) && !imgError;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image zone (root categories only) */}
      {!category.parentId && (
        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {hasImage ? (
            <img
              src={category.imageUrl!}
              alt={category.name}
              className="w-full h-full object-cover"
              onError={() => {
                console.warn(
                  `[CategoryCard] Image failed to load for category #${category.id}: ${category.imageUrl}. ` +
                  `If using Supabase, ensure the bucket is set to PUBLIC in the dashboard.`,
                );
                setImgError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 gap-2">
              <FolderIcon className="w-12 h-12" />
              {/* Show a hint when an image URL exists but failed to load */}
              {category.imageUrl && imgError && (
                <div className="flex items-center gap-1 text-amber-500 px-3 text-center">
                  <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                  <span className="text-xs">Image inaccessible — vérifiez la visibilité du bucket Supabase</span>
                </div>
              )}
            </div>
          )}

          {/* Upload overlay */}
          {onUploadImage && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
              aria-label="Changer l'illustration"
            >
              {uploading ? (
                <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
              ) : (
                <CameraIcon className="w-8 h-8 text-white" />
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{category.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{category.slug}</p>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onViewProducts && (
            <button
              onClick={() => onViewProducts(category.id)}
              className="p-2 text-slate-400 hover:text-[#e2366a] transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(category.id)}
              className="p-2 text-slate-400 hover:text-[#e2366a] transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(category.id)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {category.description && (
        <div className="px-4 pt-3">
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {category.description}
          </p>
        </div>
      )}

      {/* Subcategories */}
      {children.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sous-catégories</p>
          <div className="flex flex-wrap gap-2">
            {children.map(child => (
              <span
                key={child.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ArrowTurnDownRightIcon className="w-3 h-3" />
                {child.name}
                {child.count !== undefined && (
                  <span className="text-slate-400 ml-0.5">({child.count})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="p-4 mt-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <p className="text-slate-500">Produits</p>
          <p className="font-bold text-slate-900 dark:text-white">{category.count || 0}</p>
        </div>
        <div>
          <p className="text-slate-500">Sous-catégories</p>
          <p className="font-bold text-slate-900 dark:text-white">{children.length}</p>
        </div>
        <div>
          <p className="text-slate-500">Créée</p>
          <p className="font-bold text-slate-900 dark:text-white">
            {new Date(category.createdAt).toLocaleDateString('fr-FR', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

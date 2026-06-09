'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PhotoIcon, RectangleGroupIcon, CheckCircleIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import type { ProductImage } from '@/types/api.types';
import { uploadProductImage } from '@/services/api/upload.service';
import type { VariantDraft } from '@/components/admin/products/ProductVariants';

interface ProductMediaProps {
  productId?: number;
  images?: ProductImage[];
  onImagesChange?: (images: ProductImage[]) => void;
  /** When product has colors, list variant drafts so we can pick which color to associate */
  colorVariants?: VariantDraft[];
  /** Files buffered locally before the product is created, with their associated color */
  pendingFiles?: { file: File; color?: string }[];
  onPendingFilesChange?: (files: { file: File; color?: string }[]) => void;
}

export default function ProductMedia({
  productId,
  images = [],
  onImagesChange,
  colorVariants = [],
  pendingFiles = [] as { file: File; color?: string }[],
  onPendingFilesChange,
}: ProductMediaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  /** Color hex selected before clicking Upload */
  const [pendingColor, setPendingColor] = useState<string>('');

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  useEffect(() => {
    const urls = pendingFiles.map(pf => URL.createObjectURL(pf.file));
    setPreviewUrls(urls);
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [pendingFiles]);

  // Build deduplicated list of colors from variant drafts
  const availableColors = colorVariants.reduce<{ hex: string; name: string }[]>((acc, v) => {
    if (v.colorHex && !acc.find((c) => c.hex === v.colorHex)) {
      acc.push({ hex: v.colorHex, name: v.color || v.colorHex });
    }
    return acc;
  }, []);

  const hasColors = availableColors.length > 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the hex as the canonical color key so it matches v.colorHex on
    // the product page. Using the name was fragile when admins leave it blank.
    const colorKey = hasColors && pendingColor ? pendingColor : undefined;

    // No productId yet → buffer locally with color
    if (!productId) {
      onPendingFilesChange?.([...pendingFiles, { file, color: colorKey }]);
      setPendingColor('');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const newImage = await uploadProductImage(file, productId, colorKey);
      onImagesChange?.([...images, newImage]);
      setPendingColor('');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (id: number) => {
    onImagesChange?.(images.filter((img) => img.id !== id));
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <PhotoIcon className="w-5 h-5 text-[#e2366a]" />
          <h2 className="text-xl font-bold">Médias du produit</h2>
        </div>
      </div>

      {/* ── Color association selector ── */}
      {hasColors && (
        <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Associer l&apos;image à une couleur
          </p>
          <div className="flex flex-wrap gap-2">
            {/* "No color" option = image générale */}
            <button
              type="button"
              onClick={() => setPendingColor('')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                pendingColor === ''
                  ? 'border-[#e2366a] text-[#e2366a] bg-[#e2366a]/5'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
              }`}
            >
              <RectangleGroupIcon className="w-4 h-4" />
              Général
            </button>
            {availableColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setPendingColor(c.hex)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  pendingColor === c.hex
                    ? 'border-[#e2366a] bg-[#e2366a]/5'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                }`}
              >
                <span
                  className="inline-block size-3.5 rounded-full border border-white shadow-sm ring-1 ring-slate-200"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
            ))}
          </div>
          {pendingColor && (
            <p className="mt-1.5 text-[11px] text-slate-400">
              La prochaine image uploadée sera associée à la couleur sélectionnée.
            </p>
          )}
        </div>
      )}

      {/* ── Pending local files (create mode) ── */}
      {!productId && pendingFiles.length > 0 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1">
          <CheckCircleIcon className="w-4 h-4" />
          {pendingFiles.length} image{pendingFiles.length > 1 ? 's' : ''} prête{pendingFiles.length > 1 ? 's' : ''} — seront uploadées à la sauvegarde.
        </p>
      )}

      {uploadError && (
        <p role="alert" aria-live="assertive" className="text-xs text-red-500 mb-4">
          {uploadError}
        </p>
      )}

      {/* ── Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {/* Local pending previews (create mode) */}
        {pendingFiles.map((pf, idx) => {
          const pColor = pf.color
            ? availableColors.find((c) => c.name === pf.color || c.hex === pf.color)
            : null;
          return (
            <div
              key={`pending-${pf.file.name}-${pf.file.lastModified}`}
              className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600"
            >
              {previewUrls[idx] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrls[idx]}
                  alt={pf.file.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-slate-600 text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
                En attente
              </div>
              {pColor && (
                <div
                  className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow"
                  style={{ backgroundColor: pColor.hex }}
                >
                  {pColor.name}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onPendingFilesChange?.(pendingFiles.filter((_, i) => i !== idx))}
                  className="p-1.5 bg-white rounded-lg text-slate-900 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {images.map((img, idx) => {
          const associatedColor = hasColors
            ? availableColors.find((c) => c.name === img.color || c.hex === img.color)
            : null;

          return (
            <div
              key={img.id}
              className={`relative group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 ${
                idx === 0 || img.type === 'PRINCIPALE'
                  ? 'border-[#e2366a]'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {img.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- fill mode unsupported here; sizes are dynamic
                <img src={img.url} alt={`Image ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <PhotoIcon className="w-8 h-8" />
                </div>
              )}

              {/* Primary badge */}
              {(idx === 0 || img.type === 'PRINCIPALE') && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#e2366a] text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
                  Principal
                </div>
              )}

              {/* Color badge */}
              {associatedColor && (
                <div
                  className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow"
                  style={{ backgroundColor: associatedColor.hex }}
                >
                  {associatedColor.name}
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="p-1.5 bg-white rounded-lg text-slate-900 hover:text-red-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Upload tile — label wrapping the file input for full keyboard accessibility */}
        <label
          className={`aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-[#e2366a] hover:text-[#e2366a] transition-all bg-slate-50 dark:bg-slate-800/50 cursor-pointer focus-within:border-[#e2366a] focus-within:text-[#e2366a] ${
            uploading ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          <CloudArrowUpIcon className={`w-8 h-8 ${uploading ? 'animate-bounce' : ''}`} aria-hidden="true" />
          <span className="text-xs font-semibold mt-2">
            {uploading ? 'Envoi...' : hasColors && pendingColor
              ? availableColors.find((c) => c.hex === pendingColor)?.name ?? 'Upload'
              : 'Ajouter une image'}
          </span>
          {hasColors && pendingColor && (
            <span
              className="mt-1 inline-block size-3 rounded-full border border-white ring-1 ring-slate-300"
              style={{ backgroundColor: pendingColor }}
              aria-hidden="true"
            />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            aria-label="Uploader une image produit"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </section>
  );
}

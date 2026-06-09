'use client';

import React, { useMemo, useCallback } from 'react';
import { RectangleStackIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

// ── Public types ──────────────────────────────────────────────────────────────

export interface VariantDraft {
  id?: number;
  /** undefined = produit sans couleur */
  color?: string;
  colorHex?: string;
  size: string;
  stock: number;
  sku?: string;
}

interface ProductVariantsProps {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
  hasColor: boolean;
  onHasColorChange: (v: boolean) => void;
  sizeOptions: string[];
}

// ── Internal helper types ─────────────────────────────────────────────────────

interface ColorGroup {
  /** Canonical key — the colorHex (or colorName if no hex) */
  colorHex: string;
  colorName: string;
  /** Indices into the flat `variants` array that belong to this color */
  indices: number[];
}

function deriveColorGroups(variants: VariantDraft[]): ColorGroup[] {
  const map = new Map<string, ColorGroup>();
  variants.forEach((v, i) => {
    const key = v.colorHex || v.color || '__none__';
    if (!map.has(key)) {
      map.set(key, { colorHex: v.colorHex || '#000000', colorName: v.color || '', indices: [] });
    }
    map.get(key)!.indices.push(i);
  });
  return Array.from(map.values());
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductVariants({
  variants,
  onChange,
  hasColor,
  onHasColorChange,
  sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
}: ProductVariantsProps) {

  // Derive grouped view (for rendering only — state stays flat)
  const colorGroups = useMemo(() => deriveColorGroups(variants), [variants]);

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  // ── Mutations on flat array ───────────────────────────────────────────────

  /** Update a single field of a variant by its flat index */
  const updateVariant = useCallback(
    (idx: number, field: keyof VariantDraft, value: string | number) => {
      onChange(
        variants.map((v, i) =>
          i === idx ? { ...v, [field]: field === 'stock' ? Number(value) : value } : v,
        ),
      );
    },
    [variants, onChange],
  );

  /** Remove a variant by its flat index */
  const removeVariant = useCallback(
    (idx: number) => onChange(variants.filter((_, i) => i !== idx)),
    [variants, onChange],
  );

  /** Rename the color for every variant in a group */
  const updateGroupColorName = useCallback(
    (colorHex: string, newName: string) =>
      onChange(variants.map(v => v.colorHex === colorHex ? { ...v, color: newName } : v)),
    [variants, onChange],
  );

  /** Change the hex for every variant in a group */
  const updateGroupColorHex = useCallback(
    (oldHex: string, newHex: string) =>
      onChange(variants.map(v => v.colorHex === oldHex ? { ...v, colorHex: newHex } : v)),
    [variants, onChange],
  );

  /** Append a new size row to a color group */
  const addSizeToGroup = useCallback(
    (colorHex: string, colorName: string) => {
      const existing = new Set(variants.filter(v => v.colorHex === colorHex).map(v => v.size));
      const next = sizeOptions.find(s => !existing.has(s)) ?? sizeOptions[0] ?? 'M';
      onChange([...variants, { color: colorName, colorHex, size: next, stock: 0, sku: '' }]);
    },
    [variants, sizeOptions, onChange],
  );

  /** Remove every variant that belongs to a color group */
  const removeColorGroup = useCallback(
    (colorHex: string) => onChange(variants.filter(v => v.colorHex !== colorHex)),
    [variants, onChange],
  );

  /** Add a brand-new color group with one empty size row */
  const addColorGroup = useCallback(() => {
    const used = new Set(variants.map(v => v.colorHex));
    const palette = ['#000000', '#ffffff', '#ff0000', '#0000ff', '#008000', '#ffa500', '#800080'];
    const freeHex = palette.find(c => !used.has(c)) ?? '#000000';
    onChange([...variants, { color: '', colorHex: freeHex, size: sizeOptions[0] ?? 'M', stock: 0, sku: '' }]);
  }, [variants, sizeOptions, onChange]);

  /** Toggle color dimension — strips/adds color fields across all rows */
  const toggleHasColor = (checked: boolean) => {
    onHasColorChange(checked);
    if (checked) {
      onChange(variants.map(v => ({ ...v, color: v.color ?? '', colorHex: v.colorHex ?? '#000000' })));
    } else {
      onChange(variants.map(v => ({ id: v.id, size: v.size, stock: v.stock, sku: v.sku })));
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <RectangleStackIcon className="w-5 h-5 text-[#e2366a]" />
          <h2 className="text-xl font-bold">Variantes</h2>
          {variants.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-full">
              {totalStock} unités
            </span>
          )}
        </div>

        {/* Color toggle */}
        <div className="flex items-center gap-2 select-none">
          <span id="color-toggle-label" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Produit avec couleurs
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={hasColor}
            aria-labelledby="color-toggle-label"
            onClick={() => toggleHasColor(!hasColor)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e2366a]/50 focus:ring-offset-2 ${
              hasColor ? 'bg-[#e2366a]' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span className="sr-only">{hasColor ? 'Actif' : 'Inactif'}</span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                hasColor ? 'translate-x-6' : 'translate-x-1'
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          WITH COLORS — grouped cards
      ════════════════════════════════════════════════════════════════════════ */}
      {hasColor ? (
        <div className="space-y-4">
          {colorGroups.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              Aucune couleur — cliquez sur &quot;Ajouter une couleur&quot; pour commencer.
            </div>
          )}

          {colorGroups.map((group, groupIdx) => {
            const groupStock = group.indices.reduce((s, idx) => s + (variants[idx]?.stock || 0), 0);

            return (
              <div
                key={`color-${groupIdx}-${group.colorHex}`}
                className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
              >
                {/* Color card header */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center gap-3">
                  {/* Hex swatch + picker */}
                  <div
                    className="flex items-center gap-2 shrink-0"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <input
                      type="color"
                      defaultValue={group.colorHex}
                      onBlur={(e) => {
                        if (e.target.value !== group.colorHex) {
                          updateGroupColorHex(group.colorHex, e.target.value)
                        }
                      }}
                      aria-label={`Couleur hexadécimale du groupe ${group.colorName || group.colorHex}`}
                      className="h-8 w-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer bg-transparent p-0.5"
                    />
                    <span className="font-mono text-xs text-slate-400 hidden sm:block">
                      {group.colorHex}
                    </span>
                  </div>

                  {/* Color name */}
                  <input
                    type="text"
                    value={group.colorName}
                    onChange={(e) => updateGroupColorName(group.colorHex, e.target.value)}
                    placeholder="Nom (ex: Noir)"
                    aria-label={`Nom de la couleur ${group.colorHex}`}
                    className="flex-1 min-w-[140px] rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm font-semibold px-3 py-1.5 focus:border-[#e2366a] focus:outline-none focus:ring-1 focus:ring-[#e2366a]/20"
                  />

                  {/* Group summary */}
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto shrink-0">
                    {group.indices.length} taille{group.indices.length > 1 ? 's' : ''}
                    {' · '}
                    <strong className="text-slate-600 dark:text-slate-300">{groupStock} unités</strong>
                  </span>

                  {/* Delete color */}
                  <button
                    type="button"
                    onClick={() => removeColorGroup(group.colorHex)}
                    aria-label={`Supprimer la couleur ${group.colorName || group.colorHex} et toutes ses tailles`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>

                {/* Sizes table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-800">
                      <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <th scope="col" className="px-4 py-2 text-left">Taille</th>
                        <th scope="col" className="px-4 py-2 text-center w-24">Stock</th>
                        <th scope="col" className="px-4 py-2 text-left min-w-[140px]">SKU</th>
                        <th scope="col" className="px-4 py-2 w-10">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                      {group.indices.map((variantIdx, localIdx) => {
                        const v = variants[variantIdx];
                        return (
                          <tr
                            key={v.id ?? `new-${group.colorHex}-${localIdx}`}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20"
                          >
                            {/* Taille */}
                            <td className="px-4 py-2.5">
                              <select
                                value={v.size}
                                onChange={(e) => updateVariant(variantIdx, 'size', e.target.value)}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm px-2 py-1 min-w-[80px]"
                              >
                                {sizeOptions.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                                {!sizeOptions.includes(v.size) && (
                                  <option value={v.size}>{v.size}</option>
                                )}
                              </select>
                            </td>
                            {/* Stock */}
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                min="0"
                                value={v.stock}
                                onChange={(e) => updateVariant(variantIdx, 'stock', e.target.value)}
                                aria-label={`Stock — couleur ${group.colorName || group.colorHex}, taille ${v.size}`}
                                className="w-20 mx-auto block rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-center text-sm px-2 py-1"
                              />
                            </td>
                            {/* SKU */}
                            <td className="px-4 py-2.5">
                              <input
                                type="text"
                                placeholder="SKU"
                                value={v.sku ?? ''}
                                onChange={(e) => updateVariant(variantIdx, 'sku', e.target.value)}
                                aria-label={`SKU — couleur ${group.colorName || group.colorHex}, taille ${v.size}`}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono text-xs px-2 py-1"
                              />
                            </td>
                            {/* Delete row */}
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => removeVariant(variantIdx)}
                                aria-label={`Supprimer la taille ${v.size} (couleur ${group.colorName || group.colorHex})`}
                                className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                              >
                                <TrashIcon className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add size footer */}
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                  <button
                    type="button"
                    onClick={() => addSizeToGroup(group.colorHex, group.colorName)}
                    className="text-xs font-semibold text-[#e2366a] hover:text-[#c82d5e] flex items-center gap-1 transition-colors"
                  >
                    <PlusCircleIcon className="w-4 h-4" />
                    Ajouter une taille
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add color button */}
          <button
            type="button"
            onClick={addColorGroup}
            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm hover:border-[#e2366a]/50 hover:text-[#e2366a] transition-all flex items-center justify-center gap-2"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Ajouter une couleur
          </button>
        </div>
      ) : (

        /* ══════════════════════════════════════════════════════════════════════
            WITHOUT COLORS — simple flat table
        ════════════════════════════════════════════════════════════════════════ */
        <div>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left border-b border-slate-200 dark:border-slate-700">Taille</th>
                  <th className="px-4 py-3 text-center border-b border-slate-200 dark:border-slate-700 w-24">Stock</th>
                  <th className="px-4 py-3 text-left border-b border-slate-200 dark:border-slate-700 min-w-[140px]">SKU</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">
                      Aucune taille — cliquez sur &quot;Charger les tailles&quot; ou &quot;Ajouter&quot;.
                    </td>
                  </tr>
                ) : (
                  variants.map((v, i) => (
                    <tr
                      key={v.id ?? `new-${i}`}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20"
                    >
                      <td className="px-4 py-3">
                        <select
                          value={v.size}
                          onChange={(e) => updateVariant(i, 'size', e.target.value)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm px-2 py-1.5"
                        >
                          {sizeOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          {!sizeOptions.includes(v.size) && (
                            <option value={v.size}>{v.size}</option>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                          className="w-20 mx-auto block rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-center px-2 py-1.5"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="SKU-001"
                          value={v.sku ?? ''}
                          onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono text-xs px-2 py-1.5"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Supprimer cette taille"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {variants.length > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              Stock total :{' '}
              <span className="font-bold text-slate-600 dark:text-slate-300">{totalStock} unités</span>
              {' · '}{variants.length} taille{variants.length > 1 ? 's' : ''}
            </p>
          )}

          <button
            type="button"
            onClick={() => onChange([...variants, { size: sizeOptions[0] ?? 'M', stock: 0, sku: '' }])}
            className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm hover:border-[#e2366a]/50 hover:text-[#e2366a] transition-all flex items-center justify-center gap-2"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Ajouter une taille
          </button>
        </div>
      )}
    </section>
  );
}

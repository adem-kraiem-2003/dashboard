'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowPathIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import type { Product, ProductImage, SizeType } from '@/types/api.types';
import { SIZE_PRESETS } from '@/types/api.types';
import { getProduct, createProduct, updateProduct, createProductVariant, updateProductVariant, deleteProductVariant, deleteProductImage, getProducts } from '@/services/api/product.service';
import { getCategories } from '@/services/api/category.service';
import type { Category } from '@/types/api.types';
import AdminHeader from '@/components/admin/shared/AdminHeader';
import AdminBreadcrumb from '@/components/admin/shared/AdminBreadcrumb';
import AdminFooter from '@/components/admin/shared/AdminFooter';
import PageHeader from '@/components/admin/shared/PageHeader';
import ProductForm from '@/components/admin/products/ProductForm';
import type { ProductFormData } from '@/components/admin/products/ProductForm';
import ProductMedia from '@/components/admin/products/ProductMedia';
import ProductVariants from '@/components/admin/products/ProductVariants';
import type { VariantDraft } from '@/components/admin/products/ProductVariants';
import ProductSimpleStock from '@/components/admin/products/ProductSimpleStock';
import ProductPublishing from '@/components/admin/products/ProductPublishing';
import ProductAssociated from '@/components/admin/products/ProductAssociated';
import { uploadProductImage } from '@/services/api/upload.service';

export default function EditProductPage() {
  return (
    <Suspense fallback={<div>Chargement de la page...</div>}>
      <EditProductClient />
    </Suspense>
  );
}

function EditProductClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;

  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [hasColor, setHasColor] = useState(true);
  const [isSimple, setIsSimple] = useState(false);
  const [simpleStock, setSimpleStock] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; color?: string }[]>([]);
  const [associatedIds, setAssociatedIds] = useState<number[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    categoryId: 0,
    description: '',
    price: 299.00,
  });

  const [sizeType, setSizeType] = useState<SizeType>('STANDARD');
  const [customSizesInput, setCustomSizesInput] = useState('');

  const sizeOptions = sizeType === 'PERSONNALISE'
    ? customSizesInput.split('\n').map(s => s.trim()).filter(Boolean)
    : SIZE_PRESETS[sizeType];

  // Load categories
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {/* silently ignore */});
  }, []);

  // Load all products for associated products selector
  useEffect(() => {
    getProducts({ limit: 100 }).then(setAllProducts).catch(() => {/* silently ignore */});
  }, []);

  // Load product if in edit mode
  useEffect(() => {
    if (isEditMode && productId) {
      loadProduct(parseInt(productId, 10));
    }
  }, [isEditMode, productId]);

  // Handle image removal: optimistic — update UI immediately, rollback on API error
  const handleImagesChange = async (newImages: ProductImage[]) => {
    // Optimistic: reflect new state immediately so the UI feels instant
    setImages(newImages);

    if (isEditMode && images.length > newImages.length) {
      const removed = images.filter((img) => !newImages.some((ni) => ni.id === img.id));
      for (const img of removed) {
        try {
          await deleteProductImage(img.id);
        } catch (err) {
          // Rollback: re-insert the image that failed to delete
          setImages((prev) => {
            if (prev.some((p) => p.id === img.id)) return prev; // guard against duplicates
            return [...prev, img];
          });
          setError(
            err instanceof Error ? err.message : `Erreur lors de la suppression de l'image #${img.id}`,
          );
          return;
        }
      }
    }
  };

  const loadProduct = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProduct(id);
      setProduct(data);
      setFormData({
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId ?? 0,
        description: data.description || '',
        price: data.price,
      });
      setIsActive(data.active);
      setSizeType(data.sizeType || 'STANDARD');
      setImages(data.images ?? []);
      const mapped = (data.variants ?? []).map((v) => ({
        id: v.id,
        color: v.color,
        colorHex: v.colorHex,
        size: v.size,
        stock: v.stock,
        sku: v.sku,
      }));
      setVariants(mapped);
      setHasColor(mapped.some((v) => !!v.color));
      // Detect simple product (single UNIQUE variant)
      if (mapped.length === 1 && mapped[0].size === 'UNIQUE') {
        setIsSimple(true);
        setSimpleStock(mapped[0].stock);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSizes = () => {
    if (hasColor) {
      // Per-color: build a map of {colorKey → {color, colorHex, existingSizes}}
      // then add every sizeOption that is missing for EACH color group independently.
      const colorMap = new Map<string, { color: string; colorHex: string; sizes: Set<string> }>();
      variants.forEach((v) => {
        const key = v.colorHex || v.color || '__none__';
        if (!colorMap.has(key)) {
          colorMap.set(key, { color: v.color || '', colorHex: v.colorHex || '#000000', sizes: new Set() });
        }
        colorMap.get(key)!.sizes.add(v.size);
      });

      const newRows: VariantDraft[] = [];
      colorMap.forEach(({ color, colorHex, sizes }) => {
        sizeOptions.forEach((size) => {
          if (!sizes.has(size)) {
            newRows.push({ color, colorHex, size, stock: 0, sku: '' });
          }
        });
      });

      if (newRows.length > 0) {
        setVariants((prev) => [...prev, ...newRows]);
      }
    } else {
      // No colors: simple global dedup across all variants
      const existingSizes = new Set(variants.map((v) => v.size));
      const newRows: VariantDraft[] = sizeOptions
        .filter((s) => !existingSizes.has(s))
        .map((s) => ({ size: s, stock: 0, sku: '' }));
      if (newRows.length > 0) {
        setVariants((prev) => [...prev, ...newRows]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const variantErrors: string[] = [];

    try {
      let savedId: number;

      if (isEditMode && productId) {
        savedId = parseInt(productId, 10);
        await updateProduct(savedId, {
          name: formData.name,
          slug: formData.slug,
          price: formData.price,
          description: formData.description,
          active: isActive,
          categoryId: formData.categoryId || undefined,
          typeTaille: sizeType,
        });

        // Delete variants that were removed from the UI (exist on server but no longer in state)
        const originalVariantIds = (product?.variants ?? []).map((v) => v.id);
        const currentVariantIds = new Set(variants.filter((v) => v.id).map((v) => v.id!));
        const deletedVariantIds = originalVariantIds.filter((id) => !currentVariantIds.has(id));
        for (const vid of deletedVariantIds) {
          try {
            await deleteProductVariant(savedId, vid);
          } catch (err) {
            variantErrors.push(
              `Suppression variante #${vid} : ${err instanceof Error ? err.message : 'Erreur'}`,
            );
          }
        }
      } else {
        const created = await createProduct({
          name: formData.name,
          slug: formData.slug,
          price: formData.price,
          categoryId: formData.categoryId || 1,
          description: formData.description,
          active: isActive,
          typeTaille: sizeType,
        });
        savedId = created.id;

        // Upload buffered images collected before the product existed
        if (pendingFiles.length > 0) {
          await Promise.all(
            pendingFiles.map((pf) => uploadProductImage(pf.file, savedId, pf.color)),
          );
        }
      }

      // Save variants sequentially — capture individual errors instead of failing globally
      const variantsToSave: VariantDraft[] = isSimple
        ? [{ id: variants[0]?.id, size: 'UNIQUE', stock: simpleStock }]
        : variants;

      const existingVariants = variantsToSave.filter((v) => v.id);
      const newVariants = variantsToSave.filter((v) => !v.id);

      for (const v of existingVariants) {
        try {
          await updateProductVariant(savedId, v.id!, {
            color:    v.color,
            colorHex: v.colorHex,
            size:     v.size,
            stock:    v.stock,
            sku:      v.sku,
          });
        } catch (err) {
          variantErrors.push(
            `Mise à jour ${v.size}${v.color ? `/${v.color}` : ''} : ${err instanceof Error ? err.message : 'Erreur'}`,
          );
        }
      }

      for (const v of newVariants) {
        try {
          await createProductVariant(savedId, {
            color:    v.color,
            colorHex: v.colorHex,
            size:     v.size,
            stock:    v.stock,
            sku:      v.sku,
          });
        } catch (err) {
          variantErrors.push(
            `Création ${v.size}${v.color ? `/${v.color}` : ''} : ${err instanceof Error ? err.message : 'Erreur'}`,
          );
        }
      }

      if (variantErrors.length > 0) {
        setError(
          `Produit sauvegardé, mais ${variantErrors.length} variante(s) ont échoué :\n• ${variantErrors.join('\n• ')}`,
        );
        setSubmitting(false);
        return; // Stay on page so admin can review and retry
      }

      router.push('/produits');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader />

      {/* ── Page Body ── */}
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-[1440px] mx-auto w-full p-4 lg:p-10">
          <AdminBreadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Products', href: '/produits' },
              { label: isEditMode ? 'Edit Product' : 'New Product' },
            ]}
          />

          <PageHeader
            title={isEditMode ? 'Modification du produit' : 'Ajouter un nouveau produit'}
            description={
              isEditMode
                ? 'Modifiez les détails et variantes du produit.'
                : 'Remplissez les informations de base du produit.'
            }
            actions={
              <button className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                {isEditMode ? 'Voir en ligne' : 'Prévisualiser'}
              </button>
            }
          />

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-slate-500 flex flex-col items-center gap-2">
                <ArrowPathIcon className="w-10 h-10 animate-spin" />
                <p>Chargement...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Left Column ── */}
                <div className="lg:col-span-8 space-y-8">
                  <ProductForm
                    data={formData}
                    onChange={setFormData}
                    categories={categories}
                  />
                  <ProductMedia
                    productId={isEditMode ? parseInt(productId!, 10) : product?.id}
                    images={images}
                    onImagesChange={handleImagesChange}
                    colorVariants={hasColor ? variants : []}
                    pendingFiles={pendingFiles}
                    onPendingFilesChange={setPendingFiles}
                  />
                  <ProductAssociated
                    allProducts={allProducts}
                    associatedIds={associatedIds}
                    currentProductId={product?.id}
                    onChange={setAssociatedIds}
                  />

                  {/* ── Size Type Selector ── */}
                  {!isSimple && (
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-4">
                        <ListBulletIcon className="w-5 h-5 text-[#e2366a]" />
                        <h2 className="text-xl font-bold">Type de tailles</h2>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(['STANDARD', 'NUMERIQUE', 'PERSONNALISE'] as SizeType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSizeType(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                              sizeType === t
                                ? 'bg-[#e2366a] text-white border-[#e2366a]'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#e2366a]/50'
                            }`}
                          >
                            {t === 'STANDARD' ? 'Standard (XS-XXL)' : t === 'NUMERIQUE' ? 'Numérique (32-46)' : 'Personnalisé'}
                          </button>
                        ))}
                      </div>
                      {sizeType === 'PERSONNALISE' && (
                        <textarea
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm px-3 py-2 mb-3"
                          rows={3}
                          placeholder="Saisissez une taille par ligne&#10;ex:&#10;XXS&#10;3XL&#10;T1&#10;T2"
                          value={customSizesInput}
                          onChange={(e) => setCustomSizesInput(e.target.value)}
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          {sizeOptions.length} taille{sizeOptions.length > 1 ? 's' : ''} disponible{sizeOptions.length > 1 ? 's' : ''}
                        </p>
                        <button
                          type="button"
                          onClick={handleLoadSizes}
                          className="px-4 py-2 rounded-lg bg-[#e2366a] text-white text-sm font-bold hover:bg-[#c82d5e] transition-colors"
                        >
                          Charger les tailles
                        </button>
                      </div>
                    </section>
                  )}

                  {isSimple ? (
                    <ProductSimpleStock stock={simpleStock} onChange={setSimpleStock} />
                  ) : (
                    <ProductVariants
                      variants={variants}
                      onChange={setVariants}
                      hasColor={hasColor}
                      onHasColorChange={setHasColor}
                      sizeOptions={sizeOptions}
                    />
                  )}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold text-slate-600 dark:text-slate-300">
                      <span>Produit simple (sans taille/couleur)</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isSimple}
                        onClick={() => setIsSimple(!isSimple)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isSimple ? 'bg-[#e2366a]' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            isSimple ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                    <span className="text-xs text-slate-400">Accessoire, maquillage, etc.</span>
                  </div>
                </div>

                {/* ── Right Column: Publishing ── */}
                <ProductPublishing
                  isActive={isActive}
                  onToggleActive={setIsActive}
                  onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                  onCancel={() => router.back()}
                  submitting={submitting}
                  product={product}
                  isEditMode={isEditMode}
                />
              </div>
            </form>
          )}

          <AdminFooter />
        </main>
      </div>
    </>
  );
}


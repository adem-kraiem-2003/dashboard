import { request } from './apiClient';
import type {
  Product,
  ProductVariant,
  ProductImage,
  Category,
  CreateProductPayload,
  UpdateProductPayload,
  PaginatedResponse,
} from '@/types/api.types';

// ── Mappers (backend FR → frontend EN) ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.nom ?? raw.name ?? '',
    slug: raw.slug,
    description: raw.description,
    parentId: raw.parentId ?? null,
    count: raw._count?.produits ?? raw.count,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVariant(raw: any): ProductVariant {
  return {
    id: raw.id,
    color: raw.couleur ?? raw.color ?? '',
    colorHex: raw.couleurHex ?? raw.colorHex,
    size: raw.taille ?? raw.size,
    stock: raw.stock,
    sku: raw.sku,
    productId: raw.produitId ?? raw.productId,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapImage(raw: any): ProductImage {
  return {
    id: raw.id,
    url: raw.url,
    type: raw.type,
    color: raw.couleur ?? raw.color,
    productId: raw.produitId ?? raw.productId,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.nom ?? raw.name ?? '',
    slug: raw.slug,
    description: raw.description,
    price: raw.prix ?? raw.price,
    active: raw.actif ?? raw.active ?? true,
    sizeType: raw.typeTaille ?? raw.sizeType,
    categoryId: raw.categorieId ?? raw.categoryId,
    category: raw.categorie ? mapCategory(raw.categorie) : raw.category ? mapCategory(raw.category) : undefined,
    variants: (raw.variantes ?? raw.variants ?? []).map(mapVariant),
    images: (raw.images ?? []).map(mapImage),
    image: raw.image,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    deletedAt: raw.deletedAt,
  };
}

// ── Payload transformer (frontend EN → backend FR) ────────────────────────────

function toBackendProduct(payload: CreateProductPayload | UpdateProductPayload) {
  const out: Record<string, unknown> = {};
  if ('name'        in payload && payload.name        !== undefined) out.nom         = payload.name;
  if ('price'       in payload && payload.price       !== undefined) out.prix        = payload.price;
  if ('categoryId'  in payload && payload.categoryId  !== undefined) out.categorieId = payload.categoryId;
  if ('description' in payload && payload.description !== undefined) out.description = payload.description;
  if ('active'      in payload && payload.active      !== undefined) out.actif       = payload.active;
  if ('slug'        in payload && payload.slug        !== undefined) out.slug        = payload.slug;
  if ('typeTaille'  in payload && payload.typeTaille  !== undefined) out.typeTaille  = payload.typeTaille;
  return out;
}

// ── GET /produits ─────────────────────────────────────────────────────────────

interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  categorieId?: number;
  /** Admin flag: pass true to include inactive/draft products */
  showAll?: boolean;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search) params.set('search', options.search);
  if (options.categorieId) params.set('categorieId', String(options.categorieId));
  if (options.showAll) params.set('showAll', 'true');
  
  const query = params.toString();
  const path = query ? `/produits?${query}` : '/produits';

  const res = await request<any[] | PaginatedResponse<any>>('GET', path, undefined, {
    auth: false,
    revalidate: 60,
    tags: ['products'],
  });
  const raw = Array.isArray(res) ? res : res.data;
  return raw.map(mapProduct);
}

// ── GET /produits (related products by category) ──────────────────────────────

export async function getRelatedProducts(categoryId: number, excludeId: number, limit = 4): Promise<Product[]> {
  const params = new URLSearchParams({
    categorieId: String(categoryId),
    limit: String(limit + 1), // fetch one extra in case we need to filter out current
  });

  const res = await request<any[] | PaginatedResponse<any>>('GET', `/produits?${params}`, undefined, {
    auth: false,
    revalidate: 120,
    tags: ['products'],
  });
  const raw = Array.isArray(res) ? res : res.data;
  return raw
    .map(mapProduct)
    .filter(p => p.id !== excludeId)
    .slice(0, limit);
}

// ── GET /produits/:id ─────────────────────────────────────────────────────────

export async function getProduct(id: number): Promise<Product> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('GET', `/produits/${id}`, undefined, {
    auth: false,
    revalidate: 60,
    tags: [`product-${id}`],
  });
  return mapProduct(raw);
}

// ── POST /produits ────────────────────────────────────────────────────────────

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('POST', '/produits', toBackendProduct(payload), { auth: false });
  return mapProduct(raw);
}

// ── PATCH /produits/:id ───────────────────────────────────────────────────────

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<Product> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('PATCH', `/produits/${id}`, toBackendProduct(payload), { auth: false });
  return mapProduct(raw);
}

// ── DELETE /produits/:id ──────────────────────────────────────────────────────

export async function deleteProduct(id: number): Promise<void> {
  return request<void>('DELETE', `/produits/${id}`, undefined, { auth: false });
}

// ── GET /produits/:id/variantes ───────────────────────────────────────────────

export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any[]>('GET', `/produits/${productId}/variantes`, undefined, { auth: false });
  return raw.map(mapVariant);
}

// ── POST /produits/:id/variantes ──────────────────────────────────────────────

export interface CreateVariantPayload {
  color?: string;
  colorHex?: string;
  size: string;
  stock: number;
  sku?: string;
}

export async function createProductVariant(
  productId: number,
  payload: CreateVariantPayload,
): Promise<ProductVariant> {
  // Mirror backend fallback: use hex when no color name is provided, so both sides
  // compute the same couleur for the unique-constraint key (produitId, couleur, taille).
  const couleur = payload.color?.trim() || payload.colorHex || '—';
  const skuColor = couleur.replace('#', '').slice(0, 6);
  const body: Record<string, unknown> = {
    taille: payload.size,
    stock:  payload.stock,
    couleur,
    sku: payload.sku?.trim() || `${productId}-${skuColor}-${payload.size}-${Date.now()}`,
  };
  if (payload.colorHex) body.couleurHex = payload.colorHex;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('POST', `/produits/${productId}/variantes`, body, { auth: false });
  return mapVariant(raw);
}

export async function deleteProductVariant(
  productId: number,
  variantId: number,
): Promise<void> {
  return request<void>('DELETE', `/produits/${productId}/variantes/${variantId}`, undefined, { auth: false });
}

export async function updateProductVariant(
  productId: number,
  variantId: number,
  payload: Partial<CreateVariantPayload>,
): Promise<ProductVariant> {
  const body: Record<string, unknown> = {};
  if (payload.color !== undefined)    body.couleur    = payload.color?.trim() || '—';
  if (payload.colorHex !== undefined) body.couleurHex = payload.colorHex;
  if (payload.size !== undefined)     body.taille     = payload.size;
  if (payload.stock !== undefined)    body.stock      = payload.stock;
  if (payload.sku !== undefined)      body.sku        = payload.sku?.trim() || undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('PATCH', `/produits/${productId}/variantes/${variantId}`, body, { auth: false });
  return mapVariant(raw);
}

// ── GET /produits/:id/images ──────────────────────────────────────────────────

export async function getProductImages(productId: number): Promise<ProductImage[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any[]>('GET', `/produits/${productId}/images`, undefined, { auth: false });
  return raw.map(mapImage);
}

// ── DELETE /upload/product-image/:id ─────────────────────────────────────────

export async function deleteProductImage(imageId: number): Promise<void> {
  return request<void>('DELETE', `/upload/product-image/${imageId}`, undefined, { auth: false });
}

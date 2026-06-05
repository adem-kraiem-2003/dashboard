import { request } from './apiClient';
import { fetchWithRefresh } from '@/lib/fetch-with-refresh';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  PaginatedResponse,
} from '@/types/api.types';

// ── Mapper (backend FR → frontend EN) ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCategory(raw: any): Category {
  return {
    id: raw.id,
    name: raw.nom ?? raw.name ?? '',
    slug: raw.slug,
    description: raw.description,
    parentId: raw.parentId ?? null,
    count: raw._count?.produits ?? raw.count,
    imageUrl: raw.images?.[0]?.url ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ── Payload transformer (frontend EN → backend FR) ────────────────────────────

function toBackendCategory(payload: CreateCategoryPayload | UpdateCategoryPayload) {
  const out: Record<string, unknown> = {};
  if ('name'        in payload && payload.name        !== undefined) out.nom      = payload.name;
  if ('slug'        in payload && payload.slug        !== undefined) out.slug     = payload.slug;
  if ('description' in payload && payload.description !== undefined) out.description = payload.description;
  if ('parentId'    in payload && payload.parentId    !== undefined) out.parentId = payload.parentId;
  return out;
}

// ── GET /categories ───────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await request<any[] | PaginatedResponse<any>>('GET', '/categories', undefined, {
    auth: false,
    revalidate: 300,
    tags: ['categories'],
  });
  const raw = Array.isArray(res) ? res : res.data;
  return raw.map(mapCategory);
}

// ── GET /categories/:id ───────────────────────────────────────────────────────

export async function getCategory(id: number): Promise<Category> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('GET', `/categories/${id}`, undefined, { auth: false });
  return mapCategory(raw);
}

// ── POST /categories ──────────────────────────────────────────────────────────

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('POST', '/categories', toBackendCategory(payload), { auth: false });
  return mapCategory(raw);
}

// ── PATCH /categories/:id ─────────────────────────────────────────────────────

export async function updateCategory(id: number, payload: UpdateCategoryPayload): Promise<Category> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('PATCH', `/categories/${id}`, toBackendCategory(payload), { auth: false });
  return mapCategory(raw);
}

// ── DELETE /categories/:id ────────────────────────────────────────────────────

export async function deleteCategory(id: number): Promise<void> {
  return request<void>('DELETE', `/categories/${id}`, undefined, { auth: false });
}

// ── POST /upload/category-image ───────────────────────────────────────────────

export async function uploadCategoryImage(file: File, categorieId: number): Promise<void> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';
  const form = new FormData();
  form.append('file', file);
  form.append('categorieId', String(categorieId));

  const res = await fetchWithRefresh(`${BASE_URL}/upload/category-image`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`Upload failed (${res.status}): ${message}`);
  }
}

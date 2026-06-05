import type { ProductImage } from '@/types/api.types';
import { fetchWithRefresh } from '@/lib/fetch-with-refresh';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

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

/**
 * Upload an image for a product via multipart/form-data.
 * POST /upload/product-image
 * Fields: file, produitId, couleur? (optional)
 *
 * Do NOT set Content-Type — browser must set it (with multipart boundary).
 */
export async function uploadProductImage(
  file: File,
  produitId: number,
  couleur?: string,
): Promise<ProductImage> {
  const form = new FormData();
  form.append('file', file);
  form.append('produitId', String(produitId));
  if (couleur) form.append('couleur', couleur);

  const res = await fetchWithRefresh(`${BASE_URL}/upload/product-image`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`Upload failed (${res.status}): ${message}`);
  }

  const raw = await res.json();
  return mapImage(raw);
}

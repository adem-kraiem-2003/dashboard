// ── Enums ─────────────────────────────────────────────────────────────────────

export type ProductSize = string;

export type SizeType = 'STANDARD' | 'NUMERIQUE' | 'PERSONNALISE';

export const SIZE_PRESETS: Record<SizeType, string[]> = {
  STANDARD: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  NUMERIQUE: ['32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  PERSONNALISE: [],
};

export type OrderStatus =
  | 'EN_ATTENTE'
  | 'CONFIRMEE'
  | 'EN_PREPARATION'
  | 'EXPEDIEE'
  | 'LIVREE'
  | 'ANNULEE';

// ── Category ──────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId: number | null;
  count?: number;
  imageUrl?: string;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parentId?: number;
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: number;
  /** undefined = produit sans couleur */
  color?: string;
  /** hex (#FF0000) optionnel, complémente color */
  colorHex?: string;
  size: ProductSize;
  stock: number;
  sku?: string;
  productId: number;
}

export interface ProductImage {
  id: number;
  url: string;
  type: 'PRINCIPALE' | 'GALERIE';
  color?: string;
  productId: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  active: boolean;
  sizeType?: SizeType;
  categoryId: number;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  price: number;
  categoryId: number;
  image?: string;
  description?: string;
  active?: boolean;
  typeTaille?: SizeType;
}

export interface UpdateProductPayload {
  name?: string;
  slug?: string;
  price?: number;
  categoryId?: number;
  description?: string;
  active?: boolean;
  typeTaille?: SizeType;
}

// ── Category Update ───────────────────────────────────────────────────────────

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: number | null;
}

// ── Commande ──────────────────────────────────────────────────────────────────

export interface LigneCommandeVariante {
  id: number;
  color: string;
  colorHex?: string;
  size: ProductSize;
  stock: number;
  sku?: string;
  produit?: {
    nom: string;
    description?: string;
  };
}

export interface LigneCommande {
  id: number;
  quantite: number;
  prixUnitaire: number;
  varianteId: number;
  commandeId: number;
  variante?: LigneCommandeVariante;
}

export interface Commande {
  id: number;
  nomClient: string;
  prenomClient: string;
  emailClient: string;
  telephoneClient: string;
  adresseLivraison: string;
  statut: OrderStatus;
  total: number;
  modePaiement: 'COD';
  date: string;
  lignesCommande: LigneCommande[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommandePayload {
  nomClient: string;
  prenomClient: string;
  emailClient: string;
  telephoneClient: string;
  adresseLivraison: string;
  lignes: { varianteId: number; quantite: number }[];
}

export interface UpdateCommandeStatutPayload {
  statut: OrderStatus;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Error ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

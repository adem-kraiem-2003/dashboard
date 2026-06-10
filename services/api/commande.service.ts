import { request } from './apiClient';
import type {
  Commande,
  LigneCommande,
  CreateCommandePayload,
  UpdateCommandeStatutPayload,
  PaginatedResponse,
  OrderStatus,
} from '@/types/api.types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GetCommandesParams {
  page?: number;
  limit?: number;
  statut?: string;
  search?: string;
}

// ── Mappers (backend → frontend) ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLigne(raw: any): LigneCommande {
  return {
    id: raw.id,
    quantite: raw.quantite,
    prixUnitaire: raw.prixUnitaire,
    varianteId: raw.varianteId,
    commandeId: raw.commandeId,
    variante: raw.variante
      ? {
          id: raw.variante.id,
          color: raw.variante.couleur ?? raw.variante.color ?? '',
          colorHex: raw.variante.couleurHex ?? raw.variante.colorHex,
          size: raw.variante.taille ?? raw.variante.size,
          stock: raw.variante.stock,
          sku: raw.variante.sku,
          produit: raw.variante.produit
            ? {
                nom: raw.variante.produit.nom ?? raw.variante.produit.name ?? '',
                description: raw.variante.produit.description,
              }
            : undefined,
        }
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCommande(raw: any): Commande {
  return {
    id: raw.id,
    nomClient: raw.nomClient,
    prenomClient: raw.prenomClient,
    emailClient: raw.emailClient,
    telephoneClient: raw.telephoneClient,
    adresseLivraison: raw.adresseLivraison,
    statut: raw.statut,
    total: raw.total,
    modePaiement: raw.modePaiement,
    date: raw.date ?? raw.createdAt,
    lignesCommande: (raw.lignesCommande ?? raw.lignes ?? []).map(mapLigne),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ── Mappers (backend → frontend) ────────────────────────────────────────────

export interface Order {
  id: string;
  commandeId: number;
  customer: string;
  email: string;
  avatar: string;
  date: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  address: string;
  phone: string;
  lignes: LigneCommande[];
}

function mapStatut(s: OrderStatus): Order['status'] {
  if (s === 'EXPEDIEE') return 'shipped';
  if (s === 'LIVREE') return 'delivered';
  if (s === 'ANNULEE') return 'cancelled';
  return 'pending'; // EN_ATTENTE | CONFIRMEE | EN_PREPARATION
}

function mapToStatut(s: Order['status']): OrderStatus {
  if (s === 'shipped')   return 'EXPEDIEE';
  if (s === 'delivered') return 'LIVREE';
  if (s === 'cancelled') return 'ANNULEE';
  return 'EN_ATTENTE';
}

export function mapCommandeToOrder(c: Commande): Order {
  return {
    id: String(c.id),
    commandeId: c.id,
    customer: `${c.prenomClient} ${c.nomClient}`,
    email: c.emailClient,
    avatar: `${c.prenomClient.charAt(0)}${c.nomClient.charAt(0)}`.toUpperCase(),
    date: c.date ?? c.createdAt,
    total: c.total,
    status: mapStatut(c.statut),
    address: c.adresseLivraison,
    phone: c.telephoneClient,
    lignes: c.lignesCommande,
  };
}

export function mapToStatutBackend(s: Order['status']): OrderStatus {
  return mapToStatut(s);
}

// ── GET /commandes ────────────────────────────────────────────────────────────
export async function getCommandes(params: GetCommandesParams = {}): Promise<PaginatedResponse<Commande>> {
  const qs = new URLSearchParams();
  if (params.page   !== undefined) qs.set('page',   String(params.page));
  if (params.limit  !== undefined) qs.set('limit',  String(params.limit));
  if (params.statut !== undefined) qs.set('statut', params.statut);
  if (params.search !== undefined) qs.set('search', params.search);

  const path = `/commandes${qs.toString() ? `?${qs.toString()}` : ''}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = await request<any>('GET', path, undefined, { auth: false });
  const raw = Array.isArray(res) ? res : res.data ?? [];
  const pagination = res.pagination ?? {};
  const total = Array.isArray(res) ? res.length : pagination.total ?? res.total ?? 0;
  const page  = Array.isArray(res) ? 1 : pagination.page ?? res.page ?? 1;
  const limit = Array.isArray(res) ? raw.length : pagination.limit ?? res.limit ?? 10;
  return { data: raw.map(mapCommande), total, page, limit };
}

// ── GET /commandes/:id ────────────────────────────────────────────────────────

export async function getCommande(id: number): Promise<Commande> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('GET', `/commandes/${id}`, undefined, { auth: false });
  return mapCommande(raw);
}

// ── POST /commandes ───────────────────────────────────────────────────────────

export async function createCommande(payload: CreateCommandePayload): Promise<Commande> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('POST', '/commandes', payload, { auth: false });
  return mapCommande(raw);
}

// ── PATCH /commandes/:id/statut ───────────────────────────────────────────────
//
// Accepts the frontend status ('pending' | 'shipped' | 'delivered' | 'cancelled')
// and converts it to the backend enum before sending.

export async function updateCommandeStatut(
  id: number,
  frontendStatus: Order['status'],
): Promise<Commande> {
  // Map frontend → backend enum here (single source of truth)
  const statut: OrderStatus = mapToStatut(frontendStatus);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await request<any>('PATCH', `/commandes/${id}/statut`, { statut }, { auth: false });
  return mapCommande(raw);
}


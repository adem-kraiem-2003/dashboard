import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilitaire pour fusionner les classes Tailwind
 * Évite les conflits et déduplique les classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

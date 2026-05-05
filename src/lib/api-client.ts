/**
 * Point d’entrée HTTP partagé. À enrichir (fetch wrapper, erreurs, auth).
 * Les hooks React Query vivent dans le dossier api/ de chaque feature.
 */

import { env } from "@/config/env";

export function getApiBaseUrl(): string {
  return env.apiUrl;
}

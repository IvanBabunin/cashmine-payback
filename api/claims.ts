import { http } from '@/helpers/api/client';
import { ENDPOINTS } from '@/helpers/api/endpoints';
import type { Claim, ClaimOptions, CreateClaimBody } from '@/types/models/claim';

export const getClaimOptions = (asset: string) =>
  http.get<ClaimOptions>(ENDPOINTS.CLAIM_OPTIONS, { query: { asset } });

export const getClaim = (id: string) => http.get<Claim>(ENDPOINTS.CLAIM(id));

export const createClaim = (body: CreateClaimBody, idempotencyKey: string) =>
  http.post<Claim>(ENDPOINTS.CLAIMS, { body, headers: { 'Idempotency-Key': idempotencyKey } });

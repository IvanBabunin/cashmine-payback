export const ENDPOINTS = {
  BALANCES: '/v1/balances',
  ACTIVITY: '/v1/activity',
  CLAIM_OPTIONS: '/v1/claim-options',
  CLAIMS: '/v1/claims',
  CLAIM: (id: string) => `/v1/claims/${encodeURIComponent(id)}`,
} as const;

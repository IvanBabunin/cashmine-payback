export const ROUTES = {
  HOME: '/',
  ACTIVITY: '/activity',
  SETTINGS: '/settings',
  TOKEN: '/token',
  CLAIM: (asset: string) => ({ pathname: '/claim', params: { asset } }) as const,
  CLAIM_STATUS: (claimId: string) =>
    ({ pathname: '/claims/[claimId]', params: { claimId } }) as const,
} as const;

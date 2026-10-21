export const ROUTES = {
  HOME: '/',
  SETTINGS: '/settings',
  DETAILS: (id: string) => ({ pathname: '/details/[id]', params: { id } }) as const,
} as const;

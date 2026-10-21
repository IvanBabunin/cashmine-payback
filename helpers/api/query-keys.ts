/**
 * All TanStack Query keys in one place. Keys are functions so params are always part of the key.
 */
export const queryKeys = {
  balances: {
    all: () => ['balances'] as const,
  },
  claims: {
    options: (asset: string) => ['claims', 'options', asset] as const,
    detail: (id: string) => ['claims', 'detail', id] as const,
  },
  activity: {
    all: () => ['activity'] as const,
  },
};

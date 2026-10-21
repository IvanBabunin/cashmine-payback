import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CreateClaimBody } from '@/types/models/claim';

/**
 * A claim this device submitted. Client state, not a copy of the server claim: it holds the
 * Idempotency-Key and body so an unknown outcome can be retried safely after a reload, plus the
 * id/createdAt the server assigned (immutable) so Home can reconcile balances against `asOf`.
 */
export type Submission = {
  key: string;
  body: CreateClaimBody;
  submittedAt: string;
  claimId: string | null;
  createdAt: string | null;
};

type ClaimsState = {
  submissions: Record<string, Submission>;
  start: (key: string, body: CreateClaimBody) => void;
  confirm: (key: string, claimId: string, createdAt: string) => void;
  remove: (key: string) => void;
  reset: () => void;
};

const KEEP_CONFIRMED_MS = 10 * 60_000;

export const useClaimsStore = create<ClaimsState>()(
  persist(
    (set) => ({
      submissions: {},
      start: (key, body) =>
        set((s) => ({
          submissions: {
            ...s.submissions,
            [key]: {
              key,
              body,
              submittedAt: new Date().toISOString(),
              claimId: null,
              createdAt: null,
            },
          },
        })),
      confirm: (key, claimId, createdAt) =>
        set((s) => {
          const existing = s.submissions[key];
          if (!existing) return s;
          const now = Date.now();
          const kept = Object.fromEntries(
            Object.entries(s.submissions).filter(
              ([, sub]) => !sub.createdAt || now - Date.parse(sub.createdAt) < KEEP_CONFIRMED_MS,
            ),
          );
          return { submissions: { ...kept, [key]: { ...existing, claimId, createdAt } } };
        }),
      remove: (key) =>
        set((s) => {
          const { [key]: _removed, ...rest } = s.submissions;
          return { submissions: rest };
        }),
      reset: () => set({ submissions: {} }),
    }),
    { name: 'claims', storage: createJSONStorage(() => localStorage) },
  ),
);

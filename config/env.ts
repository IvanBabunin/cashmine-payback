import { z } from 'zod';

// Expo inlines only direct process.env.EXPO_PUBLIC_* references, so list them explicitly.
// The API token is not here on purpose: the user enters it in the app (store/auth.ts).
const schema = z.object({
  apiUrl: z.url(),
});

export const env = schema.parse({
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://task-api.cashmine.io',
});

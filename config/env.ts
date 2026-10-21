import { z } from 'zod';

// Expo вбудовує лише прямі звернення process.env.EXPO_PUBLIC_*, тому перелічуємо їх явно.
const schema = z.object({
  apiUrl: z.url(),
  apiToken: z.string().min(1).optional(),
});

export const env = schema.parse({
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  apiToken: process.env.EXPO_PUBLIC_API_TOKEN || undefined,
});

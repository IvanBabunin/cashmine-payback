import type { ExpoConfig } from 'expo/config';

const APP_NAME = 'CashMine Payback';
const APP_SLUG = 'cashmine-payback';

const config: ExpoConfig = {
  name: APP_NAME,
  slug: APP_SLUG,
  scheme: APP_SLUG,
  version: '1.0.0',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  web: {
    // SPA: один index.html, усі шляхи віддає vercel.json → rewrites.
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
};

export default config;

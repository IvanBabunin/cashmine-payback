import enCommon from './locales/en/common.json';
import enSettings from './locales/en/settings.json';

// Новий розділ: додай json і зареєструй тут.
export const resources = {
  en: { common: enCommon, settings: enSettings },
} as const;

export const defaultNS = 'common';

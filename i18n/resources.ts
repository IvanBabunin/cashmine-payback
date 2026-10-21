import enActivity from './locales/en/activity.json';
import enAuth from './locales/en/auth.json';
import enClaims from './locales/en/claims.json';
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enSettings from './locales/en/settings.json';

// New section: add a json file and register it here.
export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    home: enHome,
    claims: enClaims,
    activity: enActivity,
    settings: enSettings,
  },
} as const;

export const defaultNS = 'common';

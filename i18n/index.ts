import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { defaultNS, resources } from './resources';

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS,
  ns: Object.keys(resources.en),
  interpolation: { escapeValue: false },
  returnNull: false,
});

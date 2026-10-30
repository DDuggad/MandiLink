import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import kn from './locales/kn.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

const savedLang = localStorage.getItem('mandilink_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    kn: { translation: kn },
    hi: { translation: hi },
    mr: { translation: mr },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export function setLanguage(lang) {
  localStorage.setItem('mandilink_lang', lang);
  return i18n.changeLanguage(lang);
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

export default i18n;

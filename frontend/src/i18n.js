import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import common from './locales/common.json';
import patient from './locales/patient.json';
import consultations from './locales/consultations.json';
import pharmacies from './locales/pharmacies.json';

import { SUPPORTED_LANGUAGES, getSafeLanguage, setDocumentLanguage } from './utils/languageUtils';

// Get saved language or default to English
const getSavedLanguage = () => {
  const saved = localStorage.getItem('language');
  return getSafeLanguage(saved);
};

i18n.use(initReactI18next).init({
  resources: {
    en: { 
      translation: en,
      common: common.en || {},
      patient: patient.en || {},
      consultations: consultations.en || {},
      pharmacies: pharmacies.en || {}
    },
    hi: { 
      translation: hi,
      common: common.hi || {},
      patient: patient.hi || {},
      consultations: consultations.hi || {},
      pharmacies: pharmacies.hi || {}
    },
    pa: { 
      translation: pa,
      common: common.pa || {},
      patient: patient.pa || {},
      consultations: consultations.pa || {},
      pharmacies: pharmacies.pa || {}
    }
  },
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage']
  }
});

// Save language preference only for supported languages
i18n.on('languageChanged', (lng) => {
  const safeLang = getSafeLanguage(lng);
  if (safeLang !== lng) {
    // Fallback to safe language if unsupported language is selected
    i18n.changeLanguage(safeLang);
  }
  localStorage.setItem('language', safeLang);
  setDocumentLanguage(safeLang);
});

// Set initial document language
setDocumentLanguage(getSavedLanguage());

export { getSavedLanguage };

export default i18n;
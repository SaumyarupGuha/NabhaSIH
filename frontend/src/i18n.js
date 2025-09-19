import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import common from './locales/common.json';
import patient from './locales/patient.json';
import consultations from './locales/consultations.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { 
      translation: en,
      common: common.en,
      patient: patient.en,
      consultations: consultations.en
    },
    hi: { 
      translation: hi,
      common: common.hi,
      patient: patient.hi,
      consultations: consultations.hi
    },
    pa: { 
      translation: pa,
      common: common.pa,
      patient: patient.pa,
      consultations: consultations.pa
    }
  },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

// Save language preference
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
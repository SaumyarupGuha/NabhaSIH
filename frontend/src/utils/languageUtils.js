// Language utilities for Nabha Health Platform
// Only supports English, Hindi, and Punjabi

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'pa'];

export const LANGUAGE_CONFIG = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    direction: 'ltr'
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    direction: 'ltr'
  }
};

export const isLanguageSupported = (langCode) => {
  return SUPPORTED_LANGUAGES.includes(langCode);
};

export const getSafeLanguage = (langCode) => {
  return isLanguageSupported(langCode) ? langCode : 'en';
};

export const getLanguageConfig = (langCode) => {
  const safeLang = getSafeLanguage(langCode);
  return LANGUAGE_CONFIG[safeLang];
};

export const setDocumentLanguage = (langCode) => {
  const safeLang = getSafeLanguage(langCode);
  const config = LANGUAGE_CONFIG[safeLang];
  
  document.documentElement.lang = safeLang;
  document.documentElement.dir = config.direction;
};

export const formatLanguageForDisplay = (langCode) => {
  const config = getLanguageConfig(langCode);
  return `${config.flag} ${config.nativeName}`;
};
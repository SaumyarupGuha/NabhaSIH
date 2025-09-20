import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, Search } from 'lucide-react';
import { translationService } from '../lib/translationService';

export const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱', native: 'Polski' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', native: 'Svenska' },
    { code: 'da', name: 'Danish', flag: '🇩🇰', native: 'Dansk' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', native: 'Norsk' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮', native: 'Suomi' }
  ];

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const translateContent = async (targetLang) => {
    if (['en', 'hi', 'pa'].includes(targetLang)) {
      // Use existing i18n for supported languages
      i18n.changeLanguage(targetLang);
      return;
    }

    setIsTranslating(true);
    try {
      await translationService.translatePage(targetLang);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const changeLanguage = async (langCode) => {
    await translateContent(langCode);
    localStorage.setItem('selectedLanguage', langCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && !['en', 'hi', 'pa'].includes(savedLang)) {
      translateContent(savedLang);
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        disabled={isTranslating}
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage.flag} {currentLanguage.native}</span>
        <ChevronDown className="h-4 w-4" />
        {isTranslating && <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentLanguage.code === language.code ? 'bg-primary/10 text-primary' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </span>
                  <span className="text-xs text-gray-500">{language.native}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
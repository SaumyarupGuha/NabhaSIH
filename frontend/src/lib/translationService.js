class TranslationService {
  constructor() {
    this.cache = new Map();
    this.isTranslating = false;
  }

  async translateText(text, targetLang, sourceLang = 'en') {
    if (!text || text.trim().length === 0) return text;
    
    const cacheKey = `${text}-${sourceLang}-${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Using MyMemory API (free alternative to Google Translate)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText;
        this.cache.set(cacheKey, translatedText);
        return translatedText;
      }
      
      return text;
    } catch (error) {
      console.warn('Translation failed:', error);
      return text;
    }
  }

  async translatePage(targetLang) {
    if (this.isTranslating) return;
    
    this.isTranslating = true;
    
    try {
      // Select text elements to translate
      const selectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'span:not([class*="icon"]):not([class*="emoji"])',
        'button:not([aria-label])', 'a:not([aria-label])',
        'label', 'input[placeholder]', 'textarea[placeholder]'
      ];
      
      const elements = document.querySelectorAll(selectors.join(', '));
      
      for (const element of elements) {
        // Skip if element has children (to avoid nested translations)
        if (element.children.length > 0) continue;
        
        const text = element.textContent || element.placeholder;
        if (!text || text.trim().length < 2) continue;
        
        // Skip numbers, emails, URLs, and special characters
        if (text.match(/^[0-9+\-\s\(\)\.@\/]+$/) || 
            text.includes('@') || 
            text.startsWith('http') ||
            text.startsWith('tel:')) continue;
        
        const translatedText = await this.translateText(text, targetLang);
        
        if (element.placeholder) {
          element.placeholder = translatedText;
        } else {
          element.textContent = translatedText;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Page translation failed:', error);
    } finally {
      this.isTranslating = false;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

export const translationService = new TranslationService();
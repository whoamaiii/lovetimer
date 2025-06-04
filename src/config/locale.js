// Locale detection with fallback
export const LOCALE = (() => {
  try {
    return (
      navigator.language ||
      navigator.languages?.[0] ||
      navigator.userLanguage ||
      navigator.browserLanguage ||
      'en-US'
    );
  } catch {
    console.warn('Could not detect locale, using en-US');
    return 'en-US';
  }
})();

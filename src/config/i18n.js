import { LOCALE } from './locale.js';
import ROMANTIC_MESSAGES from './locales/romanticMessages.js';
import UI_TRANSLATIONS from './locales/uiTranslations.js';

/**
 * Get romantic messages for current locale with fallback
 * @returns {string[]}
 */
export function getMessages() {
  const localeKey = Object.keys(ROMANTIC_MESSAGES).find((key) =>
    LOCALE.startsWith(key.split('-')[0])
  );

  return (
    ROMANTIC_MESSAGES[localeKey] ||
    ROMANTIC_MESSAGES[LOCALE] ||
    ROMANTIC_MESSAGES['en-US']
  );
}

/**
 * Get UI text for current locale and replace placeholders
 * @param {string} key
 * @param {Object<string, string|number>} replacements
 * @returns {string}
 */
export function getUIText(key, replacements = {}) {
  const localeKey = Object.keys(UI_TRANSLATIONS).find((key) =>
    LOCALE.startsWith(key.split('-')[0])
  );

  const translations =
    UI_TRANSLATIONS[localeKey] ||
    UI_TRANSLATIONS[LOCALE] ||
    UI_TRANSLATIONS['en-US'];

  let text = translations[key] || UI_TRANSLATIONS['en-US'][key] || key;

  Object.entries(replacements).forEach(([placeholder, value]) => {
    text = text.replace(`{${placeholder}}`, String(value));
  });

  return text;
}

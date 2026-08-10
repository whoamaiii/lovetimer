import { LOCALE } from './locale.js';

// Number formatting configuration
export const NUMBER_FORMAT_CONFIG = {
  locale: LOCALE,
  style: 'decimal',
  maximumFractionDigits: 0,
  useGrouping: true
};

// Date formatting configuration (date only — the time of day is noise
// for an anniversary)
export const DATE_FORMAT_CONFIG = {
  locale: LOCALE,
  options: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
};

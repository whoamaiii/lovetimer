import { LOCALE } from './locale.js';

// Number formatting configuration
export const NUMBER_FORMAT_CONFIG = {
  locale: LOCALE,
  style: 'decimal',
  maximumFractionDigits: 0,
  useGrouping: true
};

// Date formatting configuration
export const DATE_FORMAT_CONFIG = {
  locale: LOCALE,
  options: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }
};

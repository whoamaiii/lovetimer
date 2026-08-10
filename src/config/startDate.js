/**
 * Safely creates a start date with validation and fallback
 * @param {Date|string|number} dateInput - The input date
 * @returns {Date} A valid Date object
 */
function createStartDate(dateInput) {
  let date;

  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    console.warn('Invalid date input type, using fallback (6 months ago)');
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() - 6);
    return fallback;
  }

  if (isNaN(date.getTime())) {
    console.warn('Invalid date provided, using fallback (6 months ago)');
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() - 6);
    return fallback;
  }

  const now = new Date();
  if (date > now) {
    console.warn('Start date is in the future, using current time');
    return now;
  }

  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  if (date < hundredYearsAgo) {
    console.warn(
      'Start date is too far in the past, using fallback (6 months ago)'
    );
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() - 6);
    return fallback;
  }

  return date;
}

// Storage key for the user's chosen anniversary date
export const START_DATE_STORAGE_KEY = 'love-timer-start-date';

/**
 * The original anniversary — recovered from this project's history
 * (the first config.js ever written for it): June 4, 2024 at 07:39.
 * Do not change this constant; it is the date the app was made for.
 */
export const ORIGINAL_START_DATE_ISO = '2024-06-04T07:39:00';

/**
 * Read a previously saved start date, if any.
 * @returns {string|null} ISO date string or null
 */
function readStoredStartDate() {
  try {
    const stored = localStorage.getItem(START_DATE_STORAGE_KEY);
    // Parse YYYY-MM-DD as local midnight instead of UTC so the
    // anniversary falls on the day the user actually picked
    if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) {
      return `${stored}T00:00:00`;
    }
    return stored;
  } catch {
    return null;
  }
}

// User-chosen date if saved, otherwise the original anniversary
export const START_DATE = createStartDate(
  readStoredStartDate() || ORIGINAL_START_DATE_ISO
);

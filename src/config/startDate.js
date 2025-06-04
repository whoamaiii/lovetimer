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

// Default start date (6 months ago)
export const START_DATE = createStartDate(
  (() => {
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() - 6);
    return defaultDate;
  })()
);

/**
 * Break a total number of seconds into days / hours / minutes / seconds.
 * Negative or fractional inputs are clamped and floored so the display
 * never shows nonsense values.
 *
 * @param {number} totalSeconds
 * @returns {{days: number, hours: number, minutes: number, seconds: number}}
 */
export function getTimeBreakdown(totalSeconds) {
  const clamped = Math.max(0, Math.floor(Number(totalSeconds) || 0));

  return {
    days: Math.floor(clamped / 86_400),
    hours: Math.floor((clamped % 86_400) / 3_600),
    minutes: Math.floor((clamped % 3_600) / 60),
    seconds: clamped % 60
  };
}

/**
 * Whole calendar years and remaining months between two dates.
 * A month only counts once its day-of-month has been reached.
 *
 * @param {Date} from
 * @param {Date} to
 * @returns {{years: number, months: number}}
 */
export function getYearMonthDiff(from, to) {
  let totalMonths =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

  if (to.getDate() < from.getDate()) {
    totalMonths -= 1;
  }

  totalMonths = Math.max(0, totalMonths);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12
  };
}

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

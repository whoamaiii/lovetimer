import { getTimeBreakdown } from '../src/utils/timeBreakdown.js';

describe('getTimeBreakdown', () => {
  test('breaks a total into days, hours, minutes and seconds', () => {
    // 2 days, 3 hours, 4 minutes, 5 seconds
    const total = 2 * 86_400 + 3 * 3_600 + 4 * 60 + 5;
    expect(getTimeBreakdown(total)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5
    });
  });

  test('returns all zeros for zero input', () => {
    expect(getTimeBreakdown(0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
  });

  test('clamps negative values to zero', () => {
    expect(getTimeBreakdown(-500)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
  });

  test('floors fractional seconds', () => {
    expect(getTimeBreakdown(61.9)).toEqual({
      days: 0,
      hours: 0,
      minutes: 1,
      seconds: 1
    });
  });

  test('handles non-numeric input gracefully', () => {
    expect(getTimeBreakdown(undefined)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
  });

  test('handles exact day boundaries', () => {
    expect(getTimeBreakdown(86_400)).toEqual({
      days: 1,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
  });
});

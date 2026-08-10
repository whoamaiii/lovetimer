import {
  getTimeBreakdown,
  getYearMonthDiff
} from '../src/utils/timeBreakdown.js';

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

describe('getYearMonthDiff', () => {
  test('computes whole years and remaining months', () => {
    const from = new Date('2024-06-04T07:39:00');
    const to = new Date('2026-08-10T12:00:00');
    expect(getYearMonthDiff(from, to)).toEqual({ years: 2, months: 2 });
  });

  test('does not count a month before its day is reached', () => {
    const from = new Date('2024-06-04T00:00:00');
    const to = new Date('2024-07-03T00:00:00');
    expect(getYearMonthDiff(from, to)).toEqual({ years: 0, months: 0 });
  });

  test('counts a month exactly on its day', () => {
    const from = new Date('2024-06-04T00:00:00');
    const to = new Date('2024-07-04T00:00:00');
    expect(getYearMonthDiff(from, to)).toEqual({ years: 0, months: 1 });
  });

  test('clamps reversed ranges to zero', () => {
    const from = new Date('2026-01-01T00:00:00');
    const to = new Date('2024-01-01T00:00:00');
    expect(getYearMonthDiff(from, to)).toEqual({ years: 0, months: 0 });
  });
});

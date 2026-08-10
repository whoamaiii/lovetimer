import { jest } from '@jest/globals';
import { START_DATE, ORIGINAL_START_DATE_ISO } from '../src/config/index.js';

// Prevent CSS imports from breaking tests for ESM
jest.unstable_mockModule('../src/style.css', () => ({}));

let LoveTimerApp;

beforeAll(async () => {
  const mod = await import('../src/main.js');
  LoveTimerApp = mod.LoveTimerApp;
});

describe('original anniversary date', () => {
  test('the original date constant is June 4, 2024 at 07:39', () => {
    // Recovered from the first config.js in this project's history.
    // This test guards the date against ever being lost again.
    expect(ORIGINAL_START_DATE_ISO).toBe('2024-06-04T07:39:00');
  });

  test('START_DATE defaults to the original anniversary when nothing is stored', () => {
    expect(START_DATE.getFullYear()).toBe(2024);
    expect(START_DATE.getMonth()).toBe(5); // June
    expect(START_DATE.getDate()).toBe(4);
    expect(START_DATE.getHours()).toBe(7);
    expect(START_DATE.getMinutes()).toBe(39);
  });
});

describe('getAnniversaryProgress', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('is roughly one half midway between anniversaries', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-12-04T07:39:00'));
    const app = new LoveTimerApp();
    const next = new Date('2025-06-04T07:39:00');
    const progress = app.getAnniversaryProgress(next);
    expect(progress).toBeGreaterThan(0.45);
    expect(progress).toBeLessThan(0.55);
  });

  test('is zero right after an anniversary', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-04T07:39:00'));
    const app = new LoveTimerApp();
    const next = new Date('2025-06-04T07:39:00');
    expect(app.getAnniversaryProgress(next)).toBeCloseTo(0, 2);
  });

  test('clamps to one when the anniversary has been reached', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-06-05T00:00:00'));
    const app = new LoveTimerApp();
    const next = new Date('2025-06-04T07:39:00');
    expect(app.getAnniversaryProgress(next)).toBe(1);
  });
});

import { jest } from '@jest/globals';
import { THEME_CONFIG, getUIText } from '../src/config/index.js';

// Prevent CSS imports from breaking tests for ESM
jest.unstable_mockModule('../src/style.css', () => ({}));

let LoveTimerApp;
beforeAll(async () => {
  const mod = await import('../src/main.js');
  LoveTimerApp = mod.LoveTimerApp;
});

describe('LoveTimerApp utility methods', () => {
  describe('getNextAnniversary', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('returns upcoming anniversary in the same year when date has not passed', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-05-10T12:00:00Z'));
      const app = new LoveTimerApp();
      const start = new Date('2020-06-15T00:00:00Z');
      const next = app.getNextAnniversary(start);
      expect(next.getFullYear()).toBe(2024);
      expect(next.getMonth()).toBe(5); // June
      expect(next.getDate()).toBe(15);
    });

    test('returns next year anniversary when date already passed', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-07-01T12:00:00Z'));
      const app = new LoveTimerApp();
      const start = new Date('2020-06-15T00:00:00Z');
      const next = app.getNextAnniversary(start);
      expect(next.getFullYear()).toBe(2025);
      expect(next.getMonth()).toBe(5);
      expect(next.getDate()).toBe(15);
    });
  });

  describe('getDaysLeft', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    test('calculates days difference correctly', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-05-10T00:00:00Z'));
      const app = new LoveTimerApp();
      const target = new Date('2024-06-15T00:00:00Z');
      expect(app.getDaysLeft(target)).toBe(36);
    });

    test('returns zero when target is today', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-06-15T00:00:00Z'));
      const app = new LoveTimerApp();
      const target = new Date('2024-06-15T00:00:00Z');
      expect(app.getDaysLeft(target)).toBe(0);
    });
  });

  describe('theme toggling', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-theme', '');
      localStorage.clear();
      THEME_CONFIG.respectSystemPreference = false;
    });

    test('cycles through themes and updates DOM and storage', () => {
      const app = new LoveTimerApp();
      const status = document.createElement('span');
      app.cachedElements.themeStatus = status;

      app.toggleTheme(); // auto -> light
      expect(app.currentTheme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem(THEME_CONFIG.storageKey)).toBe('light');
      expect(status.textContent).toBe(getUIText('darkMode'));

      app.toggleTheme(); // light -> dark
      expect(app.currentTheme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem(THEME_CONFIG.storageKey)).toBe('dark');
      expect(status.textContent).toBe(getUIText('lightMode'));

      app.toggleTheme(); // dark -> auto
      expect(app.currentTheme).toBe('auto');
      expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
      expect(localStorage.getItem(THEME_CONFIG.storageKey)).toBe('auto');
      expect(status.textContent).toBe(getUIText('darkMode'));
    });
  });
});

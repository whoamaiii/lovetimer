import { jest } from '@jest/globals';
import { THEME_CONFIG, getUIText } from '../src/config/index.js';

// Prevent CSS imports from breaking tests for ESM
jest.unstable_mockModule('../src/style.css', () => ({}));

let LoveTimerApp;

beforeAll(async () => {
  const mod = await import('../src/main.js');
  LoveTimerApp = mod.LoveTimerApp;
});

describe('initializeTheme', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', '');
    localStorage.clear();
    THEME_CONFIG.persistUserChoice = true;
  });

  test('applies saved theme preference to document', () => {
    localStorage.setItem(THEME_CONFIG.storageKey, 'dark');
    const app = new LoveTimerApp();
    const status = document.createElement('span');
    app.cachedElements.themeStatus = status;

    app.initializeTheme();

    expect(app.currentTheme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(status.textContent).toBe(getUIText('lightMode'));
  });
});

import { jest } from '@jest/globals';
import { THEME_CONFIG, getUIText } from '../src/config/index.js';

// Prevent CSS imports from breaking tests for ESM
jest.unstable_mockModule('../src/style.css', () => ({}));

let LoveTimerApp;
let initializeLoveTimer;

beforeAll(async () => {
  const mod = await import('../src/main.js');
  LoveTimerApp = mod.LoveTimerApp;
  initializeLoveTimer = mod.initializeLoveTimer;
});

describe('initializeLoveTimer', () => {
  test('creates a LoveTimerApp instance', () => {
    const initSpy = jest
      .spyOn(LoveTimerApp.prototype, 'init')
      .mockImplementation(() => {});

    const timer = initializeLoveTimer();

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(timer).toBeInstanceOf(LoveTimerApp);
    expect(window.loveTimer).toBe(timer);

    initSpy.mockRestore();
  });
});

describe('UI toggling functions', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', 'auto');
    document.documentElement.setAttribute('data-animations', 'enabled');
    localStorage.clear();
    THEME_CONFIG.respectSystemPreference = false;
  });

  test('toggleTheme updates data-theme attribute', () => {
    const app = new LoveTimerApp();
    const status = document.createElement('span');
    app.cachedElements.themeStatus = status;

    app.currentTheme = 'auto';
    app.toggleTheme(); // -> light

    expect(app.currentTheme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(status.textContent).toBe(getUIText('darkMode'));

    app.toggleTheme(); // -> dark
    expect(app.currentTheme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(status.textContent).toBe(getUIText('lightMode'));
  });

  test('toggleAnimations updates data-animations attribute', () => {
    const app = new LoveTimerApp();
    const status = document.createElement('span');
    app.cachedElements.animationStatus = status;

    app.animationsEnabled = true;
    document.documentElement.setAttribute('data-animations', 'enabled');

    app.toggleAnimations(); // disable
    expect(app.animationsEnabled).toBe(false);
    expect(document.documentElement.getAttribute('data-animations')).toBe(
      'disabled'
    );
    expect(status.textContent).toBe(getUIText('resumeAnimations'));

    app.toggleAnimations(); // enable
    expect(app.animationsEnabled).toBe(true);
    expect(document.documentElement.getAttribute('data-animations')).toBe(
      'enabled'
    );
    expect(status.textContent).toBe(getUIText('pauseAnimations'));
  });
});

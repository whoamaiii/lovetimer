import { jest } from '@jest/globals';
import { screen } from '@testing-library/dom';

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
  test('instantiates LoveTimerApp and calls init', () => {
    const initSpy = jest.spyOn(LoveTimerApp.prototype, 'init').mockImplementation(() => {
      // set flag so we know this method was called on instance
      return undefined;
    });

    const timer = initializeLoveTimer();

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(timer).toBeInstanceOf(LoveTimerApp);
    expect(window.loveTimer).toBe(timer);

    initSpy.mockRestore();
  });
});

describe('updateTheme', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('data-theme', '');
  });

  test('applies theme to document', () => {
    const app = new LoveTimerApp();
    const status = document.createElement('span');
    app.cachedElements.themeStatus = status;
    app.currentTheme = 'light';
    app.updateTheme();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(status.textContent).toBeTruthy();
  });
});

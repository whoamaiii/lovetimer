import { jest } from '@jest/globals';
import { screen } from '@testing-library/dom';
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

describe('initializeLoveTimer DOM interactions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="timer"></div>
      <div id="daysRemaining"></div>
      <div id="message"></div>
      <div id="date"></div>
      <div id="hearts-container"></div>
      <button id="toggle-animations"><span id="animation-status"></span></button>
      <button id="toggle-theme"><span id="theme-status"></span></button>
      <div id="loading-indicator" class="hidden"></div>
      <div id="error-container"></div>
      <div id="error-text"></div>
      <button id="retry-button"></button>
    `;

    document.documentElement.setAttribute('data-theme', 'auto');
    document.documentElement.setAttribute('data-animations', 'enabled');
    localStorage.clear();
    THEME_CONFIG.respectSystemPreference = false;
  });

  test('caches elements and toggles theme/animations', () => {
    const startSpy = jest
      .spyOn(LoveTimerApp.prototype, 'startTimer')
      .mockImplementation(() => {});

    const app = initializeLoveTimer();

    expect(app.cachedElements.timer).toBe(document.getElementById('timer'));
    expect(app.cachedElements['toggle-theme']).toBe(
      document.getElementById('toggle-theme')
    );
    expect(app.cachedElements.themeStatus).toBe(
      document.getElementById('theme-status')
    );
    expect(app.cachedElements.animationStatus).toBe(
      document.getElementById('animation-status')
    );

    app.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(app.cachedElements.themeStatus.textContent).toBe(getUIText('darkMode'));

    app.toggleAnimations();
    expect(document.documentElement.getAttribute('data-animations')).toBe('disabled');
    expect(app.cachedElements.animationStatus.textContent).toBe(
      getUIText('resumeAnimations')
    );

    startSpy.mockRestore();
  });
});

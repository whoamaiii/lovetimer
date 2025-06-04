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

describe('initializeLoveTimer DOM caching', () => {
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

  test('caches all required elements', () => {
    const startSpy = jest
      .spyOn(LoveTimerApp.prototype, 'startTimer')
      .mockImplementation(() => {});

    const app = initializeLoveTimer();

    const ids = [
      'timer',
      'daysRemaining',
      'message',
      'date',
      'hearts-container',
      'toggle-animations',
      'toggle-theme',
      'loading-indicator',
      'error-container',
      'error-text',
      'retry-button'
    ];

    ids.forEach((id) => {
      expect(app.cachedElements[id]).toBe(document.getElementById(id));
    });

    expect(app.cachedElements.animationStatus).toBe(
      document.getElementById('animation-status')
    );
    expect(app.cachedElements.themeStatus).toBe(
      document.getElementById('theme-status')
    );

    startSpy.mockRestore();
  });

  test('toggleTheme and toggleAnimations update DOM attributes', () => {
    const startSpy = jest
      .spyOn(LoveTimerApp.prototype, 'startTimer')
      .mockImplementation(() => {});

    const app = initializeLoveTimer();

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

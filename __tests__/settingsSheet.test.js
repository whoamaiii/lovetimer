import { jest } from '@jest/globals';
import { START_DATE_STORAGE_KEY, THEME_CONFIG } from '../src/config/index.js';

// Prevent CSS imports from breaking tests for ESM
jest.unstable_mockModule('../src/style.css', () => ({}));

let LoveTimerApp;
let initializeLoveTimer;

beforeAll(async () => {
  const mod = await import('../src/main.js');
  LoveTimerApp = mod.LoveTimerApp;
  initializeLoveTimer = mod.initializeLoveTimer;
});

describe('settings sheet', () => {
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
      <button id="open-settings"></button>
      <div id="settings-backdrop" hidden></div>
      <div id="settings-sheet" hidden>
        <input id="start-date-input" type="date" />
        <button id="save-date"></button>
        <button id="cancel-settings"></button>
      </div>
    `;

    localStorage.clear();
    THEME_CONFIG.respectSystemPreference = false;
  });

  test('open button reveals the sheet and prefills the date input', () => {
    const startSpy = jest
      .spyOn(LoveTimerApp.prototype, 'startTimer')
      .mockImplementation(() => {});

    const app = initializeLoveTimer();
    const sheet = document.getElementById('settings-sheet');
    const input = document.getElementById('start-date-input');

    expect(sheet.hidden).toBe(true);

    document.getElementById('open-settings').click();

    expect(sheet.hidden).toBe(false);
    expect(input.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    app.closeSettings();
    expect(sheet.hidden).toBe(true);

    startSpy.mockRestore();
  });

  test('cancel button closes the sheet without saving', () => {
    const startSpy = jest
      .spyOn(LoveTimerApp.prototype, 'startTimer')
      .mockImplementation(() => {});

    initializeLoveTimer();
    const sheet = document.getElementById('settings-sheet');

    document.getElementById('open-settings').click();
    expect(sheet.hidden).toBe(false);

    document.getElementById('cancel-settings').click();
    expect(sheet.hidden).toBe(true);
    expect(localStorage.getItem(START_DATE_STORAGE_KEY)).toBeNull();

    startSpy.mockRestore();
  });

  test('save persists the chosen date to localStorage', () => {
    const startSpy = jest
      .spyOn(LoveTimerApp.prototype, 'startTimer')
      .mockImplementation(() => {});

    const app = initializeLoveTimer();
    app.openSettings();

    const input = document.getElementById('start-date-input');
    input.value = '2020-06-15';

    app.saveStartDate();

    expect(localStorage.getItem(START_DATE_STORAGE_KEY)).toBe('2020-06-15');

    startSpy.mockRestore();
  });

  test('escape key closes an open sheet', () => {
    const startSpy = jest
      .spyOn(LoveTimerApp.prototype, 'startTimer')
      .mockImplementation(() => {});

    initializeLoveTimer();
    const sheet = document.getElementById('settings-sheet');

    document.getElementById('open-settings').click();
    expect(sheet.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(sheet.hidden).toBe(true);

    startSpy.mockRestore();
  });
});

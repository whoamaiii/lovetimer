// Theme and animation related helpers
import {
  THEME_CONFIG,
  ACCESSIBILITY_CONFIG,
  getUIText
} from './config/index.js';
import { announceToScreenReader } from './ui.js';

export function initializeTheme(app) {
  try {
    if (THEME_CONFIG.persistUserChoice) {
      const savedTheme = localStorage.getItem(THEME_CONFIG.storageKey);
      if (savedTheme) {
        app.currentTheme = savedTheme;
      }
    }
    updateTheme(app);
  } catch (error) {
    console.warn('Failed to initialize theme:', error);
  }
}

export function updateTheme(app) {
  try {
    let activeTheme = app.currentTheme;
    if (activeTheme === 'auto' && THEME_CONFIG.respectSystemPreference) {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
    if (app.cachedElements.themeStatus) {
      app.cachedElements.themeStatus.textContent =
        activeTheme === 'dark' ? getUIText('lightMode') : getUIText('darkMode');
    }
  } catch (error) {
    console.warn('Failed to update theme:', error);
  }
}

export function updateAnimationPreference(app) {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion && app.animationsEnabled) {
    app.animationsEnabled = false;
    document.documentElement.setAttribute('data-animations', 'disabled');
    updateAnimationStatus(app);
  }
}

export function toggleAnimations(app) {
  try {
    app.animationsEnabled = !app.animationsEnabled;
    document.documentElement.setAttribute(
      'data-animations',
      app.animationsEnabled ? 'enabled' : 'disabled'
    );
    updateAnimationStatus(app);
    localStorage.setItem('love-timer-animations', app.animationsEnabled);
    if (ACCESSIBILITY_CONFIG.announceChanges) {
      const status = app.animationsEnabled
        ? getUIText('resumeAnimations')
        : getUIText('pauseAnimations');
      announceToScreenReader(status);
    }
  } catch (error) {
    console.error('Toggle animations error:', error);
  }
}

export function updateAnimationStatus(app) {
  if (app.cachedElements.animationStatus) {
    app.cachedElements.animationStatus.textContent = app.animationsEnabled
      ? getUIText('pauseAnimations')
      : getUIText('resumeAnimations');
  }
}

export function toggleTheme(app) {
  try {
    const themes = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(app.currentTheme);
    app.currentTheme = themes[(currentIndex + 1) % themes.length];
    updateTheme(app);
    if (THEME_CONFIG.persistUserChoice) {
      localStorage.setItem(THEME_CONFIG.storageKey, app.currentTheme);
    }
  } catch (error) {
    console.error('Toggle theme error:', error);
  }
}

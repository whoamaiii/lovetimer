// UI-related helper functions

export function cacheElements(app) {
  const requiredElements = [
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

  requiredElements.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Required element not found: ${id}`);
    }
    app.cachedElements[id] = element;
  });

  app.cachedElements.animationStatus =
    document.getElementById('animation-status');
  app.cachedElements.themeStatus = document.getElementById('theme-status');
}

export function showLoading(app) {
  if (app.cachedElements['loading-indicator']) {
    app.cachedElements['loading-indicator'].classList.remove('hidden');
    app.cachedElements['loading-indicator'].setAttribute(
      'aria-hidden',
      'false'
    );
  }
}

export function hideLoading(app) {
  if (app.cachedElements['loading-indicator']) {
    app.cachedElements['loading-indicator'].classList.add('hidden');
    app.cachedElements['loading-indicator'].setAttribute('aria-hidden', 'true');
  }
}

export function showError(app, message) {
  try {
    if (
      app.cachedElements['error-container'] &&
      app.cachedElements['error-text']
    ) {
      app.cachedElements['error-text'].textContent = message;
      app.cachedElements['error-container'].style.display = 'block';
      app.cachedElements['error-container'].setAttribute(
        'aria-hidden',
        'false'
      );
      if (app.cachedElements['retry-button']) {
        app.cachedElements['retry-button'].focus();
      }
    }
    hideLoading(app);
  } catch (error) {
    console.error('Show error failed:', error);
  }
}

export function hideError(app) {
  if (app.cachedElements['error-container']) {
    app.cachedElements['error-container'].style.display = 'none';
    app.cachedElements['error-container'].setAttribute('aria-hidden', 'true');
  }
}

export function announceToScreenReader(text) {
  try {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = text;
    document.body.appendChild(announcement);
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  } catch (error) {
    console.error('Screen reader announcement error:', error);
  }
}

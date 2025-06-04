// Enhanced Love Timer - Version 2.0.0
// Performance optimized, accessible, and internationalized

import './style.css';
import confetti from 'canvas-confetti';
// Astronomical features have been removed
import {
  START_DATE,
  getMessages,
  getUIText,
  ANIMATION_CONFIG,
  PERFORMANCE_CONFIG,
  NUMBER_FORMAT_CONFIG,
  DATE_FORMAT_CONFIG,
  THEME_CONFIG,
  ACCESSIBILITY_CONFIG,
  validateConfig,
  getConfigSummary
} from './config/index.js';

/**
 * Main Love Timer Application Class
 * Handles all timer functionality with performance optimization and error handling
 */
// @codex:component LoveTimerApp
class LoveTimerApp {
  constructor() {
    this.intervals = new Set();
    this.timeouts = new Set();
    this.isVisible = true;
    this.animationsEnabled = PERFORMANCE_CONFIG.ANIMATION_ENABLED;
    this.currentTheme = 'auto';
    this.cachedElements = {};
    this.currentMessageIndex = 0;
    this.anniversaryCelebrated = false;
    this.lastMilestone = 0;
    this.heartCount = 0;
    this.isInitialized = false;
    this.numberFormatter = null;
    this.dateFormatter = null;
    this.messages = [];

    // Bind methods to preserve context
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.toggleAnimations = this.toggleAnimations.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
    this.retryInitialization = this.retryInitialization.bind(this);
  }

  /**
   * Initialize the application with comprehensive error handling
   */
  async init() {
    try {
      this.showLoading();

      // Validate configuration
      const configValidation = validateConfig();
      if (!configValidation.valid) {
        throw new Error(
          `Configuration validation failed: ${configValidation.issues.join(', ')}`
        );
      }

      // Initialize formatters
      this.initializeFormatters();

      // Cache DOM elements
      this.cacheElements();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize theme
      this.initializeTheme();

      // Get localized messages
      this.messages = getMessages();

      // Start the timer
      this.startTimer();

      // Mark as initialized
      this.isInitialized = true;

      // Hide loading
      this.hideLoading();

      console.log('Love Timer initialized successfully', getConfigSummary());
    } catch (error) {
      console.error('Failed to initialize Love Timer:', error);
      this.showError(error.message);
    }
  }

  /**
   * Initialize number and date formatters with fallback
   */
  initializeFormatters() {
    try {
      this.numberFormatter = new Intl.NumberFormat(
        NUMBER_FORMAT_CONFIG.locale,
        {
          style: NUMBER_FORMAT_CONFIG.style,
          maximumFractionDigits: NUMBER_FORMAT_CONFIG.maximumFractionDigits,
          useGrouping: NUMBER_FORMAT_CONFIG.useGrouping
        }
      );
    } catch (error) {
      console.warn('Failed to create number formatter, using fallback:', error);
      this.numberFormatter = {
        format: (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      };
    }

    try {
      this.dateFormatter = new Intl.DateTimeFormat(
        DATE_FORMAT_CONFIG.locale,
        DATE_FORMAT_CONFIG.options
      );
    } catch (error) {
      console.warn('Failed to create date formatter, using fallback:', error);
      this.dateFormatter = {
        format: (date) => date.toLocaleDateString()
      };
    }
  }

  /**
   * Cache DOM elements to avoid repeated queries
   */
  cacheElements() {
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
      this.cachedElements[id] = element;
    });

    // Cache additional elements
    this.cachedElements.animationStatus =
      document.getElementById('animation-status');
    this.cachedElements.themeStatus = document.getElementById('theme-status');
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Page Visibility API for performance optimization
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange
      );
    }

    // Keyboard navigation
    if (ACCESSIBILITY_CONFIG.enableKeyboardNavigation) {
      document.addEventListener('keydown', this.handleKeydown);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    // Theme system preference changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', () => this.updateTheme());

      const reducedMotionQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );
      reducedMotionQuery.addEventListener('change', () =>
        this.updateAnimationPreference()
      );
    }

    // Control buttons
    if (this.cachedElements['toggle-animations']) {
      this.cachedElements['toggle-animations'].addEventListener(
        'click',
        this.toggleAnimations
      );
    }

    if (this.cachedElements['toggle-theme']) {
      this.cachedElements['toggle-theme'].addEventListener(
        'click',
        this.toggleTheme
      );
    }

    if (this.cachedElements['retry-button']) {
      this.cachedElements['retry-button'].addEventListener(
        'click',
        this.retryInitialization
      );
    }
  }

  /**
   * Handle page visibility changes for performance optimization
   */
  handleVisibilityChange() {
    this.isVisible = !document.hidden;

    if (this.isVisible) {
      // Resume when page becomes visible
      this.updateTimer();
      this.updateDaysRemaining();

      // Announce to screen readers
      if (ACCESSIBILITY_CONFIG.announceChanges) {
        this.announceToScreenReader('Timer resumed');
      }
    } else {
      // Announce when page becomes hidden
      if (ACCESSIBILITY_CONFIG.announceChanges) {
        this.announceToScreenReader('Timer paused');
      }
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(event) {
    switch (event.key) {
      case 'Escape':
        if (this.cachedElements['error-container'].style.display !== 'none') {
          this.hideError();
        }
        break;
      case ' ':
        if (event.target === document.body) {
          event.preventDefault();
          this.toggleAnimations();
        }
        break;
    }
  }

  /**
   * Cleanup before page unload
   */
  handleBeforeUnload() {
    this.cleanup();
  }

  /**
   * Initialize theme system
   */
  initializeTheme() {
    try {
      // Load saved theme preference
      if (THEME_CONFIG.persistUserChoice) {
        const savedTheme = localStorage.getItem(THEME_CONFIG.storageKey);
        if (savedTheme) {
          this.currentTheme = savedTheme;
        }
      }

      this.updateTheme();
    } catch (error) {
      console.warn('Failed to initialize theme:', error);
    }
  }

  /**
   * Update theme based on preference
   */
  updateTheme() {
    try {
      let activeTheme = this.currentTheme;

      if (activeTheme === 'auto' && THEME_CONFIG.respectSystemPreference) {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      document.documentElement.setAttribute('data-theme', activeTheme);

      // Update button text
      if (this.cachedElements.themeStatus) {
        this.cachedElements.themeStatus.textContent =
          activeTheme === 'dark'
            ? getUIText('lightMode')
            : getUIText('darkMode');
      }
    } catch (error) {
      console.warn('Failed to update theme:', error);
    }
  }

  /**
   * Update animation preference based on system settings
   */
  updateAnimationPreference() {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion && this.animationsEnabled) {
      this.animationsEnabled = false;
      document.documentElement.setAttribute('data-animations', 'disabled');
      this.updateAnimationStatus();
    }
  }

  /**
   * Start the main timer loop
   */
  startTimer() {
    // Initial updates
    this.updateTimer();
    this.updateDaysRemaining();
    this.updateDateDisplay();

    // Set up intervals with performance consideration
    const updateInterval = this.isVisible
      ? ANIMATION_CONFIG.TIMER_UPDATE_INTERVAL
      : PERFORMANCE_CONFIG.UPDATE_FREQUENCY;

    this.setManagedInterval(() => {
      if (this.isVisible) {
        this.updateTimer();
        this.updateDaysRemaining();
      }
    }, updateInterval);

    // Message rotation
    this.setManagedInterval(() => {
      if (this.isVisible) {
        this.updateMessage();
      }
    }, ANIMATION_CONFIG.MESSAGE_ROTATION_INTERVAL);

    // Heart creation
    if (this.animationsEnabled && PERFORMANCE_CONFIG.MAX_HEARTS > 0) {
      this.setManagedInterval(() => {
        if (this.isVisible && this.heartCount < PERFORMANCE_CONFIG.MAX_HEARTS) {
          this.createHeart();
        }
      }, ANIMATION_CONFIG.HEART_CREATION_INTERVAL);
    }

    // Create initial hearts
    this.createInitialHearts();
  }

  /**
   * Update the main timer display
   */
  updateTimer() {
    try {
      const now = new Date();
      const difference = Math.floor((now - START_DATE) / 1000);

      if (difference < 0) {
        this.cachedElements.timer.textContent = getUIText('timerError');
        return;
      }

      const formattedNumber = this.numberFormatter.format(difference);
      this.cachedElements.timer.textContent = `${formattedNumber} ${getUIText('seconds')}`;

      // Check for milestones
      this.checkMilestone(difference);
    } catch (error) {
      console.error('Timer update error:', error);
      this.cachedElements.timer.textContent = getUIText('timerError');
    }
  }

  /**
   * Update days remaining until anniversary
   */
  updateDaysRemaining() {
    try {
      const nextAnniv = this.getNextAnniversary(START_DATE);
      const daysLeft = this.getDaysLeft(nextAnniv);

      if (daysLeft === 0) {
        this.cachedElements.daysRemaining.textContent =
          getUIText('happyAnniversary');

        // Fire confetti only once per page load
        if (!this.anniversaryCelebrated) {
          this.triggerConfetti();
          this.anniversaryCelebrated = true;

          if (ACCESSIBILITY_CONFIG.announceChanges) {
            this.announceToScreenReader(getUIText('happyAnniversary'));
          }
        }
      } else {
        const dayText =
          daysLeft === 1 ? getUIText('dayUntil') : getUIText('daysUntil');
        this.cachedElements.daysRemaining.textContent = `${daysLeft} ${dayText}`;

        // Reset celebration flag for next anniversary
        this.anniversaryCelebrated = false;
      }
    } catch (error) {
      console.error('Days remaining update error:', error);
      this.cachedElements.daysRemaining.textContent = '';
    }
  }

  /**
   * Update the date display
   */
  updateDateDisplay() {
    try {
      const formattedDate = this.dateFormatter.format(START_DATE);
      this.cachedElements.date.textContent = getUIText('since', {
        date: formattedDate
      });
    } catch (error) {
      console.error('Date display error:', error);
      this.cachedElements.date.textContent = '';
    }
  }

  /**
   * Update rotating romantic message
   */
  updateMessage() {
    try {
      if (!this.messages || this.messages.length === 0) {
        return;
      }

      const messageElement = this.cachedElements.message;

      // Fade out
      messageElement.style.opacity = '0';

      this.setManagedTimeout(() => {
        // Update text
        this.currentMessageIndex =
          (this.currentMessageIndex + 1) % this.messages.length;
        messageElement.textContent = this.messages[this.currentMessageIndex];

        // Fade in
        messageElement.style.opacity = '1';
      }, 500);
    } catch (error) {
      console.error('Message update error:', error);
    }
  }

  /**
   * Create a floating heart with performance optimization
   */
  createHeart() {
    if (!this.animationsEnabled || !this.isVisible) return;

    try {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.innerHTML = '❤️';
      heart.setAttribute('aria-hidden', 'true');

      // Use CSS custom properties for better performance
      const randomLeft = Math.random() * 100;
      const randomDuration = 8 + Math.random() * 4;
      const randomScale = 0.5 + Math.random();

      heart.style.setProperty('--random-left', `${randomLeft}%`);
      heart.style.setProperty('--random-duration', `${randomDuration}s`);
      heart.style.setProperty('--random-scale', randomScale.toString());

      this.cachedElements['hearts-container'].appendChild(heart);
      this.heartCount++;

      // Clean up after animation with multiple fallbacks
      const cleanup = () => {
        if (heart.parentNode) {
          heart.parentNode.removeChild(heart);
          this.heartCount--;
        }
      };

      // Primary cleanup: animation end event
      heart.addEventListener('animationend', cleanup, { once: true });

      // Fallback cleanup: timeout
      this.setManagedTimeout(cleanup, (randomDuration + 1) * 1000);
    } catch (error) {
      console.error('Heart creation error:', error);
    }
  }

  /**
   * Create initial hearts with staggered timing
   */
  createInitialHearts() {
    if (!this.animationsEnabled) return;

    const initialCount = Math.min(3, PERFORMANCE_CONFIG.MAX_HEARTS);

    for (let i = 0; i < initialCount; i++) {
      this.setManagedTimeout(() => {
        this.createHeart();
      }, i * 500);
    }
  }

  /**
   * Check for milestone celebrations
   */
  checkMilestone(elapsedSeconds) {
    try {
      const currentMilestone = Math.floor(
        elapsedSeconds / ANIMATION_CONFIG.MILESTONE_INTERVAL
      );

      // Fire confetti when we hit a new million-second milestone
      if (
        currentMilestone > this.lastMilestone &&
        elapsedSeconds % ANIMATION_CONFIG.MILESTONE_INTERVAL === 0
      ) {
        this.triggerMilestoneConfetti(currentMilestone);
        this.lastMilestone = currentMilestone;
      }
    } catch (error) {
      console.error('Milestone check error:', error);
    }
  }

  /**
   * Calculate next anniversary date
   */
  getNextAnniversary(date) {
    const now = new Date();

    // Anniversary in the current year
    let anniv = new Date(date);
    anniv.setFullYear(now.getFullYear());

    // If today is after this year's anniversary, bump to next year
    const nowAtMidnight = new Date(now);
    nowAtMidnight.setHours(0, 0, 0, 0);

    if (anniv < nowAtMidnight) {
      anniv = new Date(date);
      anniv.setFullYear(now.getFullYear() + 1);
    }

    return anniv;
  }

  /**
   * Calculate days left until date
   */
  getDaysLeft(nextAnniv) {
    const msPerDay = 86_400_000; // 1000 × 60 × 60 × 24
    return Math.floor((nextAnniv - Date.now()) / msPerDay);
  }

  /**
   * Fire confetti celebration
   */
  // @codex:utility triggerConfetti
  triggerConfetti() {
    if (!this.animationsEnabled) return;

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff69b4', '#ff1493', '#dc143c', '#b22222']
      });
    } catch (error) {
      console.error('Confetti error:', error);
    }
  }

  /**
   * Fire milestone confetti with special message
   */
  triggerMilestoneConfetti(milestone) {
    if (!this.animationsEnabled) return;

    try {
      // More dramatic confetti for milestones
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ff69b4', '#ff1493', '#dc143c', '#b22222']
      });

      // Show milestone message briefly
      const messageEl = this.cachedElements.message;
      const originalMessage = messageEl.textContent;
      const milestoneText = getUIText('milestoneMessage', { count: milestone });

      messageEl.textContent = milestoneText;

      if (ACCESSIBILITY_CONFIG.announceChanges) {
        this.announceToScreenReader(milestoneText);
      }

      this.setManagedTimeout(() => {
        messageEl.textContent = originalMessage;
      }, ANIMATION_CONFIG.MILESTONE_MESSAGE_DURATION);
    } catch (error) {
      console.error('Milestone confetti error:', error);
    }
  }

  /**
   * Toggle animations on/off
   */
  toggleAnimations() {
    try {
      this.animationsEnabled = !this.animationsEnabled;

      document.documentElement.setAttribute(
        'data-animations',
        this.animationsEnabled ? 'enabled' : 'disabled'
      );

      this.updateAnimationStatus();

      // Save preference
      localStorage.setItem('love-timer-animations', this.animationsEnabled);

      if (ACCESSIBILITY_CONFIG.announceChanges) {
        const status = this.animationsEnabled
          ? getUIText('resumeAnimations')
          : getUIText('pauseAnimations');
        this.announceToScreenReader(status);
      }
    } catch (error) {
      console.error('Toggle animations error:', error);
    }
  }

  /**
   * Update animation status display
   */
  updateAnimationStatus() {
    if (this.cachedElements.animationStatus) {
      this.cachedElements.animationStatus.textContent = this.animationsEnabled
        ? getUIText('pauseAnimations')
        : getUIText('resumeAnimations');
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    try {
      const themes = ['auto', 'light', 'dark'];
      const currentIndex = themes.indexOf(this.currentTheme);
      this.currentTheme = themes[(currentIndex + 1) % themes.length];

      this.updateTheme();

      // Save preference
      if (THEME_CONFIG.persistUserChoice) {
        localStorage.setItem(THEME_CONFIG.storageKey, this.currentTheme);
      }
    } catch (error) {
      console.error('Toggle theme error:', error);
    }
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    if (this.cachedElements['loading-indicator']) {
      this.cachedElements['loading-indicator'].classList.remove('hidden');
      this.cachedElements['loading-indicator'].setAttribute(
        'aria-hidden',
        'false'
      );
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    if (this.cachedElements['loading-indicator']) {
      this.cachedElements['loading-indicator'].classList.add('hidden');
      this.cachedElements['loading-indicator'].setAttribute(
        'aria-hidden',
        'true'
      );
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    try {
      if (
        this.cachedElements['error-container'] &&
        this.cachedElements['error-text']
      ) {
        this.cachedElements['error-text'].textContent = message;
        this.cachedElements['error-container'].style.display = 'block';
        this.cachedElements['error-container'].setAttribute(
          'aria-hidden',
          'false'
        );

        // Focus on retry button for accessibility
        if (this.cachedElements['retry-button']) {
          this.cachedElements['retry-button'].focus();
        }
      }

      this.hideLoading();
    } catch (error) {
      console.error('Show error failed:', error);
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    if (this.cachedElements['error-container']) {
      this.cachedElements['error-container'].style.display = 'none';
      this.cachedElements['error-container'].setAttribute(
        'aria-hidden',
        'true'
      );
    }
  }

  /**
   * Retry initialization
   */
  retryInitialization() {
    this.hideError();
    this.cleanup();
    this.init();
  }

  /**
   * Announce text to screen readers
   */
  announceToScreenReader(text) {
    try {
      // Create a temporary element for announcements
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'visually-hidden';
      announcement.textContent = text;

      document.body.appendChild(announcement);

      // Remove after announcement
      setTimeout(() => {
        if (announcement.parentNode) {
          announcement.parentNode.removeChild(announcement);
        }
      }, 1000);
    } catch (error) {
      console.error('Screen reader announcement error:', error);
    }
  }

  /**
   * Set managed interval that can be cleaned up
   */
  setManagedInterval(callback, delay) {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Set managed timeout that can be cleaned up
   */
  setManagedTimeout(callback, delay) {
    const timeout = setTimeout(() => {
      callback();
      this.timeouts.delete(timeout);
    }, delay);
    this.timeouts.add(timeout);
    return timeout;
  }

  /**
   * Clean up all intervals and timeouts
   */
  cleanup() {
    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();

    // Clear all timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();

    // Remove event listeners
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    document.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    console.log('Love Timer cleaned up');
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    const timer = new LoveTimerApp();
    timer.init();

    // Make timer globally available for debugging
    if (typeof window !== 'undefined') {
      window.loveTimer = timer;
    }
  } catch (error) {
    console.error('Failed to initialize Love Timer:', error);

    // Fallback error display
    const errorContainer = document.getElementById('error-container');
    const errorText = document.getElementById('error-text');

    if (errorContainer && errorText) {
      errorText.textContent = getUIText('failedToLoad');
      errorContainer.style.display = 'block';
    }
  }
});

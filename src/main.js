// Enhanced Love Timer - Version 2.0.0
// Performance optimized, accessible, and internationalized

import './style.css';
import confetti from 'canvas-confetti';
import {
  START_DATE,
  START_DATE_STORAGE_KEY,
  ORIGINAL_START_DATE_ISO,
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
import { getTimeBreakdown, getYearMonthDiff } from './utils/timeBreakdown.js';
import {
  tapHaptic,
  celebrationHaptic,
  milestoneHaptic,
  hideSplashScreen,
  syncStatusBar,
  scheduleLoveNotifications
} from './native/nativeFeatures.js';

/**
 * Main Love Timer Application Class
 * Handles all timer functionality with performance optimization and error handling
 */
export class LoveTimerApp {
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

    // MatchMedia queries and handlers
    this.darkModeQuery = null;
    this.reducedMotionQuery = null;
    this.handleDarkModeChange = null;
    this.handleReducedMotionChange = null;

    // Bind methods to preserve context
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.toggleAnimations = this.toggleAnimations.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
    this.retryInitialization = this.retryInitialization.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.closeSettings = this.closeSettings.bind(this);
    this.saveStartDate = this.saveStartDate.bind(this);
    this.resetStartDate = this.resetStartDate.bind(this);
    this.handlePointerLight = this.handlePointerLight.bind(this);
    this.resetPointerLight = this.resetPointerLight.bind(this);
    this.handleHeroTap = this.handleHeroTap.bind(this);
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

      // Localize static UI labels
      this.localizeStaticLabels();

      // Get localized messages
      this.messages = getMessages();

      // Start the timer
      this.startTimer();

      // Mark as initialized
      this.isInitialized = true;

      // Hide loading
      this.hideLoading();

      // Native shell: fade out the launch screen now that the timer is
      // rendered, and (re)schedule anniversary/milestone notifications
      hideSplashScreen();
      scheduleLoveNotifications(START_DATE);

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

    // Optional elements for the Liquid Glass layout. These are absent in
    // minimal embeds (and in unit tests), so everything using them is guarded.
    const optionalElements = [
      'time-days',
      'time-hours',
      'time-minutes',
      'time-seconds',
      'label-days',
      'label-hours',
      'label-minutes',
      'label-seconds',
      'page-eyebrow',
      'open-settings',
      'settings-sheet',
      'settings-backdrop',
      'start-date-input',
      'save-date',
      'cancel-settings',
      'reset-date',
      'hero-card',
      'time-summary',
      'anniversary-progress',
      'anniversary-progress-fill'
    ];

    optionalElements.forEach((id) => {
      this.cachedElements[id] = document.getElementById(id);
    });
  }

  /**
   * Localize static labels that ship with English fallback text in the HTML
   */
  localizeStaticLabels() {
    const labels = {
      'label-days': 'unitDays',
      'label-hours': 'unitHours',
      'label-minutes': 'unitMinutes',
      'label-seconds': 'unitSeconds',
      'page-eyebrow': 'togetherFor',
      'reset-date': 'resetDate'
    };

    Object.entries(labels).forEach(([id, key]) => {
      if (this.cachedElements[id]) {
        this.cachedElements[id].textContent = getUIText(key);
      }
    });

    if (this.cachedElements['anniversary-progress']) {
      this.cachedElements['anniversary-progress'].setAttribute(
        'aria-label',
        getUIText('nextAnniversaryProgress')
      );
    }
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
      this.darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.handleDarkModeChange = () => updateTheme(this);
      this.darkModeQuery.addEventListener('change', this.handleDarkModeChange);

      this.reducedMotionQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );
      this.handleReducedMotionChange = () => updateAnimationPreference(this);
      this.reducedMotionQuery.addEventListener(
        'change',
        this.handleReducedMotionChange
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

    // Settings sheet (optional elements)
    if (this.cachedElements['open-settings']) {
      this.cachedElements['open-settings'].addEventListener(
        'click',
        this.openSettings
      );
    }

    if (this.cachedElements['cancel-settings']) {
      this.cachedElements['cancel-settings'].addEventListener(
        'click',
        this.closeSettings
      );
    }

    if (this.cachedElements['settings-backdrop']) {
      this.cachedElements['settings-backdrop'].addEventListener(
        'click',
        this.closeSettings
      );
    }

    if (this.cachedElements['save-date']) {
      this.cachedElements['save-date'].addEventListener(
        'click',
        this.saveStartDate
      );
    }

    if (this.cachedElements['reset-date']) {
      this.cachedElements['reset-date'].addEventListener(
        'click',
        this.resetStartDate
      );
    }

    // Liquid light on the hero card: the specular highlight follows the
    // pointer and the pane tilts ever so slightly, like real glass
    const heroCard = this.cachedElements['hero-card'];
    if (heroCard && window.matchMedia?.('(hover: hover)').matches) {
      heroCard.addEventListener('pointermove', this.handlePointerLight);
      heroCard.addEventListener('pointerleave', this.resetPointerLight);
    }

    if (heroCard) {
      heroCard.addEventListener('click', this.handleHeroTap);
    }
  }

  /**
   * Move the specular highlight to the pointer and tilt the pane slightly
   */
  handlePointerLight(event) {
    if (!this.animationsEnabled) return;
    if (this.reducedMotionQuery?.matches) return;

    const card = this.cachedElements['hero-card'];
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    card.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`);
    card.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`);
    card.style.setProperty('--pointer-opacity', '1');

    const tiltX = ((0.5 - y) * 2.5).toFixed(2);
    const tiltY = ((x - 0.5) * 2.5).toFixed(2);
    card.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }

  /**
   * Let the glass settle back when the pointer leaves
   */
  resetPointerLight() {
    const card = this.cachedElements['hero-card'];
    if (!card) return;
    card.style.setProperty('--pointer-opacity', '0');
    card.style.transform = '';
  }

  /**
   * A small burst of hearts where the hero card is tapped
   */
  handleHeroTap(event) {
    if (!this.animationsEnabled) return;

    tapHaptic();

    try {
      confetti({
        particleCount: 18,
        spread: 55,
        startVelocity: 22,
        gravity: 0.7,
        scalar: 0.9,
        ticks: 120,
        origin: {
          x: event.clientX / window.innerWidth,
          y: event.clientY / window.innerHeight
        },
        colors: ['#ff6b9d', '#ff8fb3', '#e0447c', '#ffc2d4']
      });
    } catch (error) {
      console.error('Heart burst error:', error);
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
        if (
          this.cachedElements['settings-sheet'] &&
          !this.cachedElements['settings-sheet'].hidden
        ) {
          this.closeSettings();
        } else if (
          this.cachedElements['error-container'].style.display !== 'none'
        ) {
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

      // Keep the iOS status bar text legible on the new background
      syncStatusBar(activeTheme);

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
    this.updateDurationSummary();

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
      this.cachedElements.timer.textContent = getUIText('totalSeconds', {
        count: formattedNumber
      });

      // Update the days / hours / minutes / seconds tiles
      this.updateBreakdown(difference);

      // Check for milestones
      this.checkMilestone(difference);
    } catch (error) {
      console.error('Timer update error:', error);
      this.cachedElements.timer.textContent = getUIText('timerError');
    }
  }

  /**
   * Update the days / hours / minutes / seconds breakdown tiles
   */
  updateBreakdown(totalSeconds) {
    if (!this.cachedElements['time-days']) return;

    const { days, hours, minutes, seconds } = getTimeBreakdown(totalSeconds);
    const pad = (value) => String(value).padStart(2, '0');

    this.cachedElements['time-days'].textContent =
      this.numberFormatter.format(days);
    this.cachedElements['time-hours'].textContent = pad(hours);
    this.cachedElements['time-minutes'].textContent = pad(minutes);
    this.cachedElements['time-seconds'].textContent = pad(seconds);
  }

  /**
   * Update days remaining until anniversary
   */
  updateDaysRemaining() {
    try {
      const nextAnniv = this.getNextAnniversary(START_DATE);
      const daysLeft = this.getDaysLeft(nextAnniv);

      this.updateAnniversaryProgress(nextAnniv);

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
   * Fraction of the current anniversary year that has already passed
   * @param {Date} nextAnniv
   * @returns {number} value between 0 and 1
   */
  getAnniversaryProgress(nextAnniv) {
    const previousAnniv = new Date(nextAnniv);
    previousAnniv.setFullYear(previousAnniv.getFullYear() - 1);

    const total = nextAnniv - previousAnniv;
    const elapsed = Date.now() - previousAnniv;

    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, elapsed / total));
  }

  /**
   * Update the progress bar toward the next anniversary
   */
  updateAnniversaryProgress(nextAnniv) {
    const track = this.cachedElements['anniversary-progress'];
    const fill = this.cachedElements['anniversary-progress-fill'];
    if (!track || !fill) return;

    const percent = Math.round(this.getAnniversaryProgress(nextAnniv) * 100);
    fill.style.width = `${percent}%`;
    track.setAttribute('aria-valuenow', String(percent));
  }

  /**
   * Update the friendly "that is X years, Y months of us" summary
   */
  updateDurationSummary() {
    const summary = this.cachedElements['time-summary'];
    if (!summary) return;

    try {
      const { years, months } = getYearMonthDiff(START_DATE, new Date());
      const parts = [];

      if (years > 0) {
        parts.push(
          `${years} ${getUIText(years === 1 ? 'unitYearOne' : 'unitYearOther')}`
        );
      }
      if (months > 0) {
        parts.push(
          `${months} ${getUIText(months === 1 ? 'unitMonthOne' : 'unitMonthOther')}`
        );
      }

      summary.textContent =
        parts.length > 0
          ? getUIText('durationSummary', { duration: parts.join(', ') })
          : '';
    } catch (error) {
      console.error('Duration summary error:', error);
      summary.textContent = '';
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
  triggerConfetti() {
    if (!this.animationsEnabled) return;

    celebrationHaptic();

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

    milestoneHaptic();

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
   * Open the settings sheet to edit the anniversary date
   */
  openSettings() {
    const sheet = this.cachedElements['settings-sheet'];
    const backdrop = this.cachedElements['settings-backdrop'];
    const input = this.cachedElements['start-date-input'];
    if (!sheet) return;

    if (input) {
      // Prefill with the current start date (local date, not UTC)
      const local = new Date(
        START_DATE.getTime() - START_DATE.getTimezoneOffset() * 60_000
      );
      input.value = local.toISOString().slice(0, 10);
      input.max = new Date().toISOString().slice(0, 10);

      const earliest = new Date();
      earliest.setFullYear(earliest.getFullYear() - 100);
      input.min = earliest.toISOString().slice(0, 10);
    }

    sheet.hidden = false;
    if (backdrop) backdrop.hidden = false;
    if (input) input.focus();
  }

  /**
   * Close the settings sheet without saving
   */
  closeSettings() {
    const sheet = this.cachedElements['settings-sheet'];
    const backdrop = this.cachedElements['settings-backdrop'];

    if (sheet) sheet.hidden = true;
    if (backdrop) backdrop.hidden = true;

    if (this.cachedElements['open-settings']) {
      this.cachedElements['open-settings'].focus();
    }
  }

  /**
   * Persist the chosen anniversary date and reload with the new value
   */
  saveStartDate() {
    const input = this.cachedElements['start-date-input'];
    if (!input || !input.value) {
      this.closeSettings();
      return;
    }

    const chosen = new Date(input.value);
    if (isNaN(chosen.getTime())) {
      this.closeSettings();
      return;
    }

    try {
      localStorage.setItem(START_DATE_STORAGE_KEY, input.value);
    } catch (error) {
      console.warn('Could not persist start date:', error);
    }

    // START_DATE is resolved at module load, so reload to apply it
    try {
      window.location.reload();
    } catch {
      this.closeSettings();
    }
  }

  /**
   * Restore the original anniversary date the app was made for
   */
  resetStartDate() {
    try {
      localStorage.removeItem(START_DATE_STORAGE_KEY);
    } catch (error) {
      console.warn('Could not reset start date:', error);
    }

    if (this.cachedElements['start-date-input']) {
      this.cachedElements['start-date-input'].value =
        ORIGINAL_START_DATE_ISO.slice(0, 10);
    }

    try {
      window.location.reload();
    } catch {
      this.closeSettings();
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

      // Never leave the native launch screen stuck over an error state
      hideSplashScreen();
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

    if (this.darkModeQuery && this.handleDarkModeChange) {
      this.darkModeQuery.removeEventListener(
        'change',
        this.handleDarkModeChange
      );
    }

    if (this.reducedMotionQuery && this.handleReducedMotionChange) {
      this.reducedMotionQuery.removeEventListener(
        'change',
        this.handleReducedMotionChange
      );
    }

    console.log('Love Timer cleaned up');
  }
}

function updateTheme(app) {
  if (app && typeof app.updateTheme === 'function') {
    app.updateTheme();
  }
}

function updateAnimationPreference(app) {
  if (app && typeof app.updateAnimationPreference === 'function') {
    app.updateAnimationPreference();
  }
}

// Initialize the application and expose the instance
export function initializeLoveTimer() {
  const timer = new LoveTimerApp();
  timer.init();

  if (typeof window !== 'undefined') {
    window.loveTimer = timer;
  }

  return timer;
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    initializeLoveTimer();
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

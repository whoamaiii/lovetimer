import confetti from 'canvas-confetti';
import {
  START_DATE,
  getMessages,
  getUIText,
  ANIMATION_CONFIG,
  PERFORMANCE_CONFIG,
  NUMBER_FORMAT_CONFIG,
  DATE_FORMAT_CONFIG,
  ACCESSIBILITY_CONFIG,
  validateConfig,
  getConfigSummary
} from './config/index.js';
import {
  cacheElements,
  showLoading,
  hideLoading,
  showError,
  hideError,
  announceToScreenReader
} from './ui.js';
import {
  initializeTheme,
  updateTheme,
  updateAnimationPreference,
  toggleAnimations,
  toggleTheme
} from './theme.js';

// @codex:component LoveTimerApp
export default class LoveTimerApp {
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

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.retryInitialization = this.retryInitialization.bind(this);
  }

  async init() {
    try {
      showLoading(this);
      const configValidation = validateConfig();
      if (!configValidation.valid) {
        throw new Error(
          `Configuration validation failed: ${configValidation.issues.join(', ')}`
        );
      }
      this.initializeFormatters();
      cacheElements(this);
      this.setupEventListeners();
      initializeTheme(this);
      this.messages = getMessages();
      this.startTimer();
      this.isInitialized = true;
      hideLoading(this);
      console.log('Love Timer initialized successfully', getConfigSummary());
    } catch (error) {
      console.error('Failed to initialize Love Timer:', error);
      showError(this, error.message);
    }
  }

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

  setupEventListeners() {
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange
      );
    }

    if (ACCESSIBILITY_CONFIG.enableKeyboardNavigation) {
      document.addEventListener('keydown', this.handleKeydown);
    }

    window.addEventListener('beforeunload', this.handleBeforeUnload);

    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addListener(() => updateTheme(this));

      const reducedMotionQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );
      reducedMotionQuery.addListener(() => updateAnimationPreference(this));
    }

    if (this.cachedElements['toggle-animations']) {
      this.cachedElements['toggle-animations'].addEventListener('click', () =>
        toggleAnimations(this)
      );
    }

    if (this.cachedElements['toggle-theme']) {
      this.cachedElements['toggle-theme'].addEventListener('click', () =>
        toggleTheme(this)
      );
    }

    if (this.cachedElements['retry-button']) {
      this.cachedElements['retry-button'].addEventListener(
        'click',
        this.retryInitialization
      );
    }
  }

  handleVisibilityChange() {
    this.isVisible = !document.hidden;
    if (this.isVisible) {
      this.updateTimer();
      this.updateDaysRemaining();
      if (ACCESSIBILITY_CONFIG.announceChanges) {
        announceToScreenReader('Timer resumed');
      }
    } else if (ACCESSIBILITY_CONFIG.announceChanges) {
      announceToScreenReader('Timer paused');
    }
  }

  handleKeydown(event) {
    switch (event.key) {
      case 'Escape':
        if (this.cachedElements['error-container'].style.display !== 'none') {
          hideError(this);
        }
        break;
      case ' ':
        if (event.target === document.body) {
          event.preventDefault();
          toggleAnimations(this);
        }
        break;
    }
  }

  handleBeforeUnload() {
    this.cleanup();
  }

  startTimer() {
    this.updateTimer();
    this.updateDaysRemaining();
    this.updateDateDisplay();

    const updateInterval = this.isVisible
      ? ANIMATION_CONFIG.TIMER_UPDATE_INTERVAL
      : PERFORMANCE_CONFIG.UPDATE_FREQUENCY;

    this.setManagedInterval(() => {
      if (this.isVisible) {
        this.updateTimer();
        this.updateDaysRemaining();
      }
    }, updateInterval);

    this.setManagedInterval(() => {
      if (this.isVisible) {
        this.updateMessage();
      }
    }, ANIMATION_CONFIG.MESSAGE_ROTATION_INTERVAL);

    if (this.animationsEnabled && PERFORMANCE_CONFIG.MAX_HEARTS > 0) {
      this.setManagedInterval(() => {
        if (this.isVisible && this.heartCount < PERFORMANCE_CONFIG.MAX_HEARTS) {
          this.createHeart();
        }
      }, ANIMATION_CONFIG.HEART_CREATION_INTERVAL);
    }

    this.createInitialHearts();
  }

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
      this.checkMilestone(difference);
    } catch (error) {
      console.error('Timer update error:', error);
      this.cachedElements.timer.textContent = getUIText('timerError');
    }
  }

  updateDaysRemaining() {
    try {
      const nextAnniv = this.getNextAnniversary(START_DATE);
      const daysLeft = this.getDaysLeft(nextAnniv);
      if (daysLeft === 0) {
        this.cachedElements.daysRemaining.textContent =
          getUIText('happyAnniversary');
        if (!this.anniversaryCelebrated) {
          this.triggerConfetti();
          this.anniversaryCelebrated = true;
          if (ACCESSIBILITY_CONFIG.announceChanges) {
            announceToScreenReader(getUIText('happyAnniversary'));
          }
        }
      } else {
        const dayText =
          daysLeft === 1 ? getUIText('dayUntil') : getUIText('daysUntil');
        this.cachedElements.daysRemaining.textContent = `${daysLeft} ${dayText}`;
        this.anniversaryCelebrated = false;
      }
    } catch (error) {
      console.error('Days remaining update error:', error);
      this.cachedElements.daysRemaining.textContent = '';
    }
  }

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

  updateMessage() {
    try {
      if (!this.messages || this.messages.length === 0) {
        return;
      }
      const messageElement = this.cachedElements.message;
      messageElement.style.opacity = '0';
      this.setManagedTimeout(() => {
        this.currentMessageIndex =
          (this.currentMessageIndex + 1) % this.messages.length;
        messageElement.textContent = this.messages[this.currentMessageIndex];
        messageElement.style.opacity = '1';
      }, 500);
    } catch (error) {
      console.error('Message update error:', error);
    }
  }

  createHeart() {
    if (!this.animationsEnabled || !this.isVisible) return;
    try {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.innerHTML = '❤️';
      heart.setAttribute('aria-hidden', 'true');
      const randomLeft = Math.random() * 100;
      const randomDuration = 8 + Math.random() * 4;
      const randomScale = 0.5 + Math.random();
      heart.style.setProperty('--random-left', `${randomLeft}%`);
      heart.style.setProperty('--random-duration', `${randomDuration}s`);
      heart.style.setProperty('--random-scale', randomScale.toString());
      this.cachedElements['hearts-container'].appendChild(heart);
      this.heartCount++;
      const cleanup = () => {
        if (heart.parentNode) {
          heart.parentNode.removeChild(heart);
          this.heartCount--;
        }
      };
      heart.addEventListener('animationend', cleanup, { once: true });
      this.setManagedTimeout(cleanup, (randomDuration + 1) * 1000);
    } catch (error) {
      console.error('Heart creation error:', error);
    }
  }

  createInitialHearts() {
    if (!this.animationsEnabled) return;
    const initialCount = Math.min(3, PERFORMANCE_CONFIG.MAX_HEARTS);
    for (let i = 0; i < initialCount; i++) {
      this.setManagedTimeout(() => {
        this.createHeart();
      }, i * 500);
    }
  }

  checkMilestone(elapsedSeconds) {
    try {
      const currentMilestone = Math.floor(
        elapsedSeconds / ANIMATION_CONFIG.MILESTONE_INTERVAL
      );
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

  getNextAnniversary(date) {
    const now = new Date();
    let anniv = new Date(date);
    anniv.setFullYear(now.getFullYear());
    const nowAtMidnight = new Date(now);
    nowAtMidnight.setHours(0, 0, 0, 0);
    if (anniv < nowAtMidnight) {
      anniv = new Date(date);
      anniv.setFullYear(now.getFullYear() + 1);
    }
    return anniv;
  }

  getDaysLeft(nextAnniv) {
    const msPerDay = 86_400_000;
    return Math.floor((nextAnniv - Date.now()) / msPerDay);
  }

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

  triggerMilestoneConfetti(milestone) {
    if (!this.animationsEnabled) return;
    try {
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#ff69b4', '#ff1493', '#dc143c', '#b22222']
      });
      const messageEl = this.cachedElements.message;
      const originalMessage = messageEl.textContent;
      const milestoneText = getUIText('milestoneMessage', { count: milestone });
      messageEl.textContent = milestoneText;
      if (ACCESSIBILITY_CONFIG.announceChanges) {
        announceToScreenReader(milestoneText);
      }
      this.setManagedTimeout(() => {
        messageEl.textContent = originalMessage;
      }, ANIMATION_CONFIG.MILESTONE_MESSAGE_DURATION);
    } catch (error) {
      console.error('Milestone confetti error:', error);
    }
  }

  setManagedInterval(callback, delay) {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  setManagedTimeout(callback, delay) {
    const timeout = setTimeout(() => {
      callback();
      this.timeouts.delete(timeout);
    }, delay);
    this.timeouts.add(timeout);
    return timeout;
  }

  retryInitialization() {
    hideError(this);
    this.cleanup();
    this.init();
  }

  cleanup() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    document.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    console.log('Love Timer cleaned up');
  }
}

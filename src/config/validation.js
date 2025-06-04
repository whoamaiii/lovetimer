import { CONFIG_VERSION } from './version.js';
import { START_DATE } from './startDate.js';
import { LOCALE } from './locale.js';
import { getMessages } from './i18n.js';
import { ANIMATION_CONFIG } from './animationConfig.js';
import { PERFORMANCE_CONFIG } from './performanceConfig.js';
import ROMANTIC_MESSAGES from './locales/romanticMessages.js';

/**
 * Validate the main configuration for correctness
 * @returns {{valid: boolean, issues: string[], config: object}}
 */
export function validateConfig() {
  const issues = [];

  if (!(START_DATE instanceof Date) || isNaN(START_DATE.getTime())) {
    issues.push('Invalid START_DATE');
  }

  const messages = getMessages();
  if (!messages || messages.length === 0) {
    issues.push(`No messages found for locale: ${LOCALE}`);
  }

  Object.entries(ANIMATION_CONFIG).forEach(([key, value]) => {
    if (typeof value !== 'number' || value <= 0) {
      issues.push(`Invalid ${key}: ${value}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    config: {
      version: CONFIG_VERSION,
      locale: LOCALE,
      startDate: START_DATE.toISOString(),
      messagesCount: messages.length,
      performanceLevel: PERFORMANCE_CONFIG.HIGH_PERFORMANCE
        ? 'high'
        : 'standard'
    }
  };
}

/**
 * Get a summary of the current configuration
 * @returns {object}
 */
export function getConfigSummary() {
  return {
    version: CONFIG_VERSION,
    locale: LOCALE,
    startDate: START_DATE.toISOString(),
    messagesAvailable: Object.keys(ROMANTIC_MESSAGES),
    currentMessages: getMessages().length,
    animationConfig: ANIMATION_CONFIG,
    performanceConfig: PERFORMANCE_CONFIG,
    validation: validateConfig()
  };
}

/**
 * Validate a numeric configuration value
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @param {number} defaultValue
 * @param {string} name
 * @returns {number}
 */
function validateNumber(value, min, max, defaultValue, name) {
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`Invalid ${name}: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }

  if (value < min) {
    console.warn(`${name} too small: ${value}, using minimum: ${min}`);
    return min;
  }

  if (value > max) {
    console.warn(`${name} too large: ${value}, using maximum: ${max}`);
    return max;
  }

  return value;
}

/** Validated animation timing settings */
export const ANIMATION_CONFIG = {
  HEART_CREATION_INTERVAL: validateNumber(
    2000,
    500,
    10000,
    2000,
    'HEART_CREATION_INTERVAL'
  ),
  MESSAGE_ROTATION_INTERVAL: validateNumber(
    5000,
    1000,
    30000,
    5000,
    'MESSAGE_ROTATION_INTERVAL'
  ),
  TIMER_UPDATE_INTERVAL: validateNumber(
    1000,
    100,
    5000,
    1000,
    'TIMER_UPDATE_INTERVAL'
  ),
  MILESTONE_INTERVAL: validateNumber(
    1_000_000,
    1000,
    10_000_000,
    1_000_000,
    'MILESTONE_INTERVAL'
  ),
  MILESTONE_MESSAGE_DURATION: validateNumber(
    3000,
    1000,
    10000,
    3000,
    'MILESTONE_MESSAGE_DURATION'
  )
};

// Export individual constants for backward compatibility
export const {
  HEART_CREATION_INTERVAL,
  MESSAGE_ROTATION_INTERVAL,
  TIMER_UPDATE_INTERVAL,
  MILESTONE_INTERVAL,
  MILESTONE_MESSAGE_DURATION
} = ANIMATION_CONFIG;

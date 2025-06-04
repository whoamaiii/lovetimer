// Astro module entry point - orchestrates astronomical features
// Initializes star sky background and enhanced moon phase display

import { initStarMap, cleanupStarMap } from './starMap.js';
import {
  calculateMoonPhase,
  getMoonTimes,
  getMoonPhaseMessage,
  getNextRomanticMoon
} from './moonPhase.js';

let initialized = false;
let starMapActive = false;

/**
 * Initialize the astronomical widget system
 * @param {Object} options - Configuration options
 * @param {Date} options.relationshipStart - Relationship start date for star map
 * @param {number} options.latitude - Observer latitude
 * @param {number} options.longitude - Observer longitude
 */
export async function initAstroWidget(options = {}) {
  if (initialized) {
    console.log('Astro widget already initialized');
    return;
  }

  try {
    console.log('Initializing astronomical features...');

    const config = {
      relationshipStart: new Date('2023-01-01'), // Default date, should be configurable
      latitude: 59.9139, // Oslo coordinates as default
      longitude: 10.7522,
      ...options
    };

    // Initialize star map background if canvas is available and not in reduced motion
    const canvas = document.getElementById('starSkyBg');
    if (canvas && !canvas.hidden) {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await initStarMap(config.relationshipStart);
        starMapActive = true;
        console.log('Star map background activated');
      } else {
        console.log('Star map skipped due to reduced motion preference');
      }
    }

    // Enhance existing astro panel with better moon phase data
    enhanceAstroPanel(config);

    // Set up periodic updates for astronomical data
    setupPeriodicUpdates(config);

    initialized = true;
    console.log('Astro widget initialization complete');
  } catch (error) {
    console.error('Failed to initialize astro widget:', error);
  }
}

/**
 * Enhance the existing astronomical panel with richer data
 * @param {Object} config - Configuration object
 */
function enhanceAstroPanel(config) {
  try {
    const moonPhaseElement = document.getElementById('moon-phase');
    const constellationElement = document.getElementById('constellation');

    if (moonPhaseElement) {
      updateMoonPhaseDisplay(moonPhaseElement, config);
    }

    if (constellationElement) {
      updateConstellationDisplay(constellationElement);
    }
  } catch (error) {
    console.error('Failed to enhance astro panel:', error);
  }
}

/**
 * Update moon phase display with enhanced information
 * @param {HTMLElement} element - Moon phase display element
 * @param {Object} config - Configuration object
 */
function updateMoonPhaseDisplay(element, config) {
  const moonPhase = calculateMoonPhase();
  const moonTimes = getMoonTimes(new Date(), config.latitude);

  // Create enhanced display
  const phaseText = `${moonPhase.phaseEmoji} ${moonPhase.phaseName}`;
  const illuminationText = `${Math.round(moonPhase.illumination)}% illuminated`;

  element.innerHTML = `
    <div style="line-height: 1.4;">
      <div style="font-weight: 600;">${phaseText}</div>
      <div style="font-size: 0.85em; opacity: 0.8;">${illuminationText}</div>
      <div style="font-size: 0.8em; opacity: 0.7; margin-top: 0.25rem;">
        Rise: ${moonTimes.moonrise} • Set: ${moonTimes.moonset}
      </div>
    </div>
  `;

  // Add tooltip with romantic message
  const romanticMessage = getMoonPhaseMessage(moonPhase);
  element.title = romanticMessage;
}

/**
 * Update constellation display with seasonal information
 * @param {HTMLElement} element - Constellation display element
 */
function updateConstellationDisplay(element) {
  // Extra null-check for bulletproof robustness
  if (!element) {
    console.warn('Constellation element not found');
    return;
  }

  const now = new Date();
  const month = now.getMonth();

  // Simplified seasonal constellation mapping
  const seasonalConstellations = {
    0: { name: 'Orion', emoji: '⭐' }, // January
    1: { name: 'Gemini', emoji: '♊' }, // February
    2: { name: 'Leo', emoji: '♌' }, // March
    3: { name: 'Virgo', emoji: '♍' }, // April
    4: { name: 'Boötes', emoji: '🌟' }, // May
    5: { name: 'Hercules', emoji: '💪' }, // June
    6: { name: 'Cygnus', emoji: '🦢' }, // July
    7: { name: 'Aquila', emoji: '🦅' }, // August
    8: { name: 'Pegasus', emoji: '🐎' }, // September
    9: { name: 'Andromeda', emoji: '👸' }, // October
    10: { name: 'Perseus', emoji: '⚔️' }, // November
    11: { name: 'Auriga', emoji: '🚗' } // December
  };

  const constellation = seasonalConstellations[month];
  element.innerHTML = `
    <div style="line-height: 1.4;">
      <div style="font-weight: 600;">${constellation.emoji} ${constellation.name}</div>
      <div style="font-size: 0.8em; opacity: 0.7;">Prominent tonight</div>
    </div>
  `;
}

/**
 * Set up periodic updates for astronomical data
 * @param {Object} config - Configuration object
 */
function setupPeriodicUpdates(config) {
  // Update astronomical data every 10 minutes
  const updateInterval = setInterval(() => {
    if (!document.hidden) {
      // Only update when page is visible
      enhanceAstroPanel(config);
    }
  }, 600000); // 10 minutes

  // Store interval reference for cleanup
  if (!window.astroUpdateInterval) {
    window.astroUpdateInterval = updateInterval;
  }
}

/**
 * Get next romantic astronomical event
 * @returns {Object} Next romantic event details
 */
export function getNextRomanticEvent() {
  const nextMoon = getNextRomanticMoon();

  return {
    type: 'moon',
    ...nextMoon,
    description: `${nextMoon.emoji} ${nextMoon.type} in ${nextMoon.daysAway} day${nextMoon.daysAway !== 1 ? 's' : ''}`,
    romanticNote: nextMoon.message
  };
}

/**
 * Cleanup astronomical widget resources
 */
export function cleanup() {
  if (starMapActive) {
    cleanupStarMap();
    starMapActive = false;
  }

  if (window.astroUpdateInterval) {
    clearInterval(window.astroUpdateInterval);
    window.astroUpdateInterval = null;
  }

  initialized = false;
  console.log('Astro widget cleanup complete');
}

// Export individual functions for advanced usage
export {
  calculateMoonPhase,
  getMoonTimes,
  getMoonPhaseMessage,
  getNextRomanticMoon
} from './moonPhase.js';

export { initStarMap, cleanupStarMap } from './starMap.js';

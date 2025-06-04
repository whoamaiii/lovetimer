// d3-celestial compatibility fix
// Background: d3-celestial v0.7.15 embeds D3 v3.x which uses `this.document`.
// In ES modules with strict mode, `this` is undefined causing errors.
// Solution: Load d3-celestial via script tag in index.html to run in non-strict mode.
// The library is now available globally as window.Celestial
// TODO: Remove when migrating to modern d3-celestial fork or alternative library

// Use the globally loaded Celestial from index.html
const Celestial = window.Celestial;
// Star map background rendering using d3-celestial
// Renders night sky from the moment of relationship start

let celestial, canvas, context;
let animationId = null;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 60000; // Update every minute

/**
 * Initialize the star map background
 * @param {Date} relationshipStart - The start date of the relationship
 * @returns {Promise<void>}
 * @throws {Error} if canvas missing or d3-celestial fails to load
 */
export async function initStarMap(relationshipStart) {
  try {
    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('Star map skipped due to reduced motion preference');
      return;
    }

    canvas = document.getElementById('starSkyBg');
    if (!canvas) {
      console.warn('Star sky canvas not found');
      return;
    }

    context = canvas.getContext('2d');

    // Verify d3-celestial is loaded from script tag
    if (!Celestial || !window.Celestial) {
      throw new Error('d3-celestial not loaded. Ensure celestial.min.js loads before this module.');
    }
    celestial = Celestial;

    setupCanvas();
    configureStarMap(relationshipStart);
    startRendering();

    console.log('Star map initialized for date:', relationshipStart);
  } catch (err) {
    console.error('Star map initialization failed:', err);
    const canvas = document.getElementById('starSkyBg');
    if (canvas) canvas.style.display = 'none';
    throw err;
  }
}

/**
 * Setup canvas dimensions and event listeners
 * @returns {void}
 */
function setupCanvas() {
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (celestial && celestial.redraw) {
      celestial.redraw();
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

/**
 * Configure celestial display for relationship date
 * @param {Date} relationshipStart - The relationship start date
 * @returns {void}
 */
function configureStarMap(relationshipStart) {
  const config = {
    width: canvas.width,
    height: canvas.height,
    projection: 'airy',
    transform: 'equatorial',
    center: [0, 0, 0],
    background: { fill: 'transparent', stroke: 'none' },
    adaptable: true,
    interactive: false,
    controls: false,
    container: 'starSkyBg',
    datapath: '/data/', // Use local data files from public/data/
    stars: {
      show: true,
      limit: 6,
      colors: true,
      style: { fill: '#ffffff', opacity: 0.8 },
      size: 7,
      exponent: -0.28,
      designation: false
    },
    dsos: {
      show: true,
      limit: 6,
      colors: true,
      style: { fill: '#cccccc', stroke: '#cccccc', width: 2, opacity: 0.6 },
      size: null,
      exponent: 1.4,
      designation: false
    },
    mw: {
      show: true,
      style: { fill: '#ffffff', opacity: 0.15 }
    },
    constellations: {
      show: false,
      names: false,
      lines: false
    },
    planets: { show: false },
    daylight: { show: false },
    horizon: { show: false, stroke: 'none', fill: 'none' }
  };

  // Set the display date to relationship start
  celestial.display({
    ...config,
    date: relationshipStart
  });
}

/**
 * Start the rendering loop with time-based updates
 * @returns {void}
 */
function startRendering() {
  function animate(currentTime) {
    // Throttle updates to once per minute unless reduced motion
    const shouldUpdate = currentTime - lastUpdateTime > UPDATE_INTERVAL;

    if (
      shouldUpdate &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      lastUpdateTime = currentTime;

      // Subtle sky progression - advance by a few minutes
      const now = new Date();
      celestial.date(now);
    }

    animationId = requestAnimationFrame(animate);
  }

  animationId = requestAnimationFrame(animate);
}

/**
 * Cleanup star map resources
 * @returns {void}
 */
export function cleanupStarMap() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (canvas && context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  console.log('Star map cleaned up');
}

// Performance settings based on device capabilities
export const PERFORMANCE_CONFIG = (() => {
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  let isLowPowerMode = false;
  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      isLowPowerMode = battery.charging === false;
    });
  }
  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;

  return {
    MAX_HEARTS: prefersReducedMotion ? 0 : hardwareConcurrency > 4 ? 10 : 5,
    ANIMATION_ENABLED: !prefersReducedMotion,
    HIGH_PERFORMANCE: hardwareConcurrency > 2,
    UPDATE_FREQUENCY: hardwareConcurrency > 4 ? 1000 : 2000,
    get REDUCED_EFFECTS() {
      return isLowPowerMode || hardwareConcurrency < 2;
    }
  };
})();

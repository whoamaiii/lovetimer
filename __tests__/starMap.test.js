// __tests__/starMap.test.js
import { initStarMap, cleanupStarMap } from '../src/astro/starMap.js';

describe('Star Map Integration', () => {
  let container;
  
  beforeAll(() => {
    // Create a fake <canvas> in JSDOM for the test
    document.body.innerHTML = '<canvas id="starSkyBg"></canvas>';
    container = document.getElementById('starSkyBg');
  });

  afterAll(() => {
    cleanupStarMap();
    if (container) {
      container.remove();
    }
  });

  test('d3-celestial loads without throwing', async () => {
    await expect(initStarMap(new Date())).resolves.not.toThrow();
  });

  test('star map initializes with valid date', async () => {
    const testDate = new Date('2023-01-01');
    await expect(initStarMap(testDate)).resolves.toBeUndefined();
  });
});
# d3-celestial "Cannot read properties of undefined" Fix

## Problem
d3-celestial v0.7.15 threw `Cannot read properties of undefined (reading 'document')` error when imported as ES module in Vite.

## Root Cause
- d3-celestial embeds D3.js v3.x in its lib/d3.js which uses `var d3_document = this.document;`
- In ES modules with strict mode, `this` is `undefined` instead of `window`
- The error occurs at line 8 of the embedded d3.js before any polyfills can run

## Solution Applied
**Script Tag Loading** - Load d3-celestial via traditional script tag to avoid strict mode:
1. Copy `celestial.min.js` and `data/` folder to `public/`
2. Load via `<script>` tag in `index.html` before ES modules
3. Access globally as `window.Celestial` in ES modules
4. Configure Vite to exclude d3-celestial from optimization

## Files Modified
- `src/astro/starMap.js` - Added polyfill and safety checks
- `vite.config.js` - Added global aliases and esbuild options
- `package.json` - Added test script
- `__tests__/starMap.test.js` - Added automated tests

## Verification Checklist
- [x] No console errors about `this.document`
- [x] Star map canvas renders properly
- [x] Astro panel populates (no "Loading..." stuck)
- [x] Cross-browser compatibility maintained
- [x] Automated tests added

## Future Migration Path
Consider upgrading to:
- Modern d3-celestial fork with ES module support
- Alternative libraries: @observablehq/plot + d3-geo
- Three.js based astronomical visualization

## Maintenance Notes
- Remove polyfill when migrating off d3-celestial v0.7.x
- Review dependencies every 6 months for modern alternatives
- Monitor for community-maintained ES module forks
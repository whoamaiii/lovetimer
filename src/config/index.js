export * from './version.js';
export * from './startDate.js';
export * from './locale.js';
export * from './i18n.js';
export * from './animationConfig.js';
export * from './performanceConfig.js';
export * from './formatConfig.js';
export * from './themeConfig.js';
export * from './accessibilityConfig.js';
export * from './validation.js';

// Initialize and log configuration health on import
import { validateConfig } from './validation.js';
const configValidation = validateConfig();
if (!configValidation.valid) {
  console.warn('Configuration validation failed:', configValidation.issues);
} else {
  console.log('Configuration loaded successfully:', configValidation.config);
}

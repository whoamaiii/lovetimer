// Covers the thin native bridges that the timer UI drives: status bar
// style mapping, splash-screen hiding, and haptic strength selection.
import { jest } from '@jest/globals';

const mockIsNativePlatform = jest.fn(() => true);
const mockSetStyle = jest.fn();
const mockHide = jest.fn();
const mockImpact = jest.fn();
const mockNotification = jest.fn();

jest.unstable_mockModule('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: mockIsNativePlatform }
}));

jest.unstable_mockModule('@capacitor/status-bar', () => ({
  StatusBar: { setStyle: mockSetStyle },
  Style: { Dark: 'DARK', Light: 'LIGHT' }
}));

jest.unstable_mockModule('@capacitor/splash-screen', () => ({
  SplashScreen: { hide: mockHide }
}));

jest.unstable_mockModule('@capacitor/haptics', () => ({
  Haptics: { impact: mockImpact, notification: mockNotification },
  ImpactStyle: { Light: 'LIGHT', Heavy: 'HEAVY' },
  NotificationType: { Success: 'SUCCESS' }
}));

jest.unstable_mockModule('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: jest.fn(),
    requestPermissions: jest.fn(),
    getPending: jest.fn(),
    cancel: jest.fn(),
    schedule: jest.fn()
  }
}));

let native;

beforeAll(async () => {
  native = await import('../src/native/nativeFeatures.js');
});

beforeEach(() => {
  jest.clearAllMocks();
  mockIsNativePlatform.mockReturnValue(true);
});

describe('syncStatusBar', () => {
  // Style.Dark means light text, which is what a dark background needs
  test('uses light text on the dark theme', async () => {
    await native.syncStatusBar('dark');
    expect(mockSetStyle).toHaveBeenCalledWith({ style: 'DARK' });
  });

  test('uses dark text on the light theme', async () => {
    await native.syncStatusBar('light');
    expect(mockSetStyle).toHaveBeenCalledWith({ style: 'LIGHT' });
  });

  test('does nothing off native platforms', async () => {
    mockIsNativePlatform.mockReturnValue(false);
    await native.syncStatusBar('dark');
    expect(mockSetStyle).not.toHaveBeenCalled();
  });

  test('swallows plugin failures', async () => {
    mockSetStyle.mockRejectedValue(new Error('no status bar'));
    await expect(native.syncStatusBar('dark')).resolves.toBeUndefined();
  });
});

describe('hideSplashScreen', () => {
  test('fades the launch screen out', async () => {
    await native.hideSplashScreen();
    expect(mockHide).toHaveBeenCalledWith({ fadeOutDuration: 400 });
  });

  test('does nothing off native platforms', async () => {
    mockIsNativePlatform.mockReturnValue(false);
    await native.hideSplashScreen();
    expect(mockHide).not.toHaveBeenCalled();
  });

  test('swallows plugin failures', async () => {
    mockHide.mockRejectedValue(new Error('already hidden'));
    await expect(native.hideSplashScreen()).resolves.toBeUndefined();
  });
});

describe('haptics', () => {
  test('taps lightly for a heart burst', async () => {
    await native.tapHaptic();
    expect(mockImpact).toHaveBeenCalledWith({ style: 'LIGHT' });
  });

  test('thumps heavily for a milestone', async () => {
    await native.milestoneHaptic();
    expect(mockImpact).toHaveBeenCalledWith({ style: 'HEAVY' });
  });

  test('buzzes success for the anniversary', async () => {
    await native.celebrationHaptic();
    expect(mockNotification).toHaveBeenCalledWith({ type: 'SUCCESS' });
  });

  test('does nothing off native platforms', async () => {
    mockIsNativePlatform.mockReturnValue(false);

    await native.tapHaptic();
    await native.milestoneHaptic();
    await native.celebrationHaptic();

    expect(mockImpact).not.toHaveBeenCalled();
    expect(mockNotification).not.toHaveBeenCalled();
  });
});

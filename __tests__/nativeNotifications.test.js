// Covers the notification orchestration (permission handling and the
// cancel-before-schedule flow) with the Capacitor plugins mocked out.
import { jest } from '@jest/globals';

const mockIsNativePlatform = jest.fn(() => true);
const mockCheckPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockGetPending = jest.fn();
const mockCancel = jest.fn();
const mockSchedule = jest.fn();

jest.unstable_mockModule('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: mockIsNativePlatform }
}));

jest.unstable_mockModule('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: mockCheckPermissions,
    requestPermissions: mockRequestPermissions,
    getPending: mockGetPending,
    cancel: mockCancel,
    schedule: mockSchedule
  }
}));

jest.unstable_mockModule('@capacitor/haptics', () => ({
  Haptics: { impact: jest.fn(), notification: jest.fn() },
  ImpactStyle: { Light: 'LIGHT', Heavy: 'HEAVY' },
  NotificationType: { Success: 'SUCCESS' }
}));

jest.unstable_mockModule('@capacitor/splash-screen', () => ({
  SplashScreen: { hide: jest.fn() }
}));

jest.unstable_mockModule('@capacitor/status-bar', () => ({
  StatusBar: { setStyle: jest.fn() },
  Style: { Dark: 'DARK', Light: 'LIGHT' }
}));

let scheduleLoveNotifications;
let requestNotifications;
let OWNED_NOTIFICATION_IDS;

beforeAll(async () => {
  const mod = await import('../src/native/nativeFeatures.js');
  scheduleLoveNotifications = mod.scheduleLoveNotifications;
  requestNotifications = mod.requestNotifications;
  OWNED_NOTIFICATION_IDS = mod.OWNED_NOTIFICATION_IDS;
});

const START = new Date('2024-06-04T07:39:00');

beforeEach(() => {
  jest.clearAllMocks();
  mockIsNativePlatform.mockReturnValue(true);
  mockGetPending.mockResolvedValue({ notifications: [] });
  mockCheckPermissions.mockResolvedValue({ display: 'granted' });
  mockRequestPermissions.mockResolvedValue({ display: 'granted' });
});

describe('scheduleLoveNotifications', () => {
  test('does nothing off native platforms', async () => {
    mockIsNativePlatform.mockReturnValue(false);

    await scheduleLoveNotifications(START);

    expect(mockCheckPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  test('never prompts, and skips scheduling when permission is not granted', async () => {
    mockCheckPermissions.mockResolvedValue({ display: 'prompt' });

    await scheduleLoveNotifications(START);

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  test('schedules the full set when permission is already granted', async () => {
    await scheduleLoveNotifications(START);

    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const { notifications } = mockSchedule.mock.calls[0][0];
    expect(notifications).toHaveLength(13); // yearly + 11 monthly + milestone
  });

  test('cancels only its own pending notifications', async () => {
    mockGetPending.mockResolvedValue({
      notifications: [{ id: 1 }, { id: 204 }, { id: 9999 }]
    });

    await scheduleLoveNotifications(START);

    expect(mockCancel).toHaveBeenCalledWith({
      notifications: [{ id: 1 }, { id: 204 }]
    });
  });

  test('does not call cancel when nothing of ours is pending', async () => {
    mockGetPending.mockResolvedValue({ notifications: [{ id: 9999 }] });

    await scheduleLoveNotifications(START);

    expect(mockCancel).not.toHaveBeenCalled();
    expect(mockSchedule).toHaveBeenCalled();
  });

  test('swallows plugin failures', async () => {
    mockSchedule.mockRejectedValue(new Error('boom'));

    await expect(scheduleLoveNotifications(START)).resolves.toBeUndefined();
  });

  test('owned ids cover the anniversary, all months, and the milestone', () => {
    expect(OWNED_NOTIFICATION_IDS).toHaveLength(14);
    expect(OWNED_NOTIFICATION_IDS).toContain(1);
    expect(OWNED_NOTIFICATION_IDS).toContain(3);
    expect(OWNED_NOTIFICATION_IDS).toContain(212);
  });
});

describe('requestNotifications', () => {
  test('prompts and schedules when permission has not been decided', async () => {
    mockCheckPermissions
      .mockResolvedValueOnce({ display: 'prompt' })
      .mockResolvedValue({ display: 'granted' });

    await expect(requestNotifications(START)).resolves.toBe(true);
    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
  });

  test('does not re-prompt once already granted', async () => {
    await expect(requestNotifications(START)).resolves.toBe(true);

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).toHaveBeenCalledTimes(1);
  });

  test('gives up on a denied permission without prompting again', async () => {
    mockCheckPermissions.mockResolvedValue({ display: 'denied' });

    await expect(requestNotifications(START)).resolves.toBe(false);
    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  test('returns false when the user declines the prompt', async () => {
    mockCheckPermissions.mockResolvedValue({ display: 'prompt' });
    mockRequestPermissions.mockResolvedValue({ display: 'denied' });

    await expect(requestNotifications(START)).resolves.toBe(false);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  test('returns false off native platforms', async () => {
    mockIsNativePlatform.mockReturnValue(false);

    await expect(requestNotifications(START)).resolves.toBe(false);
  });
});

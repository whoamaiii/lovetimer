// Native iOS integrations (Capacitor plugins).
//
// Every entry point here is guarded by Capacitor.isNativePlatform() and
// wrapped in try/catch, so in a regular browser (npm run dev) and in Jest
// these functions are safe no-ops. The schedule builders are pure and
// exported separately so they can be unit-tested without any plugin mocks.

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { getUIText } from '../config/i18n.js';
import { ANIMATION_CONFIG } from '../config/animationConfig.js';

export const NOTIFICATION_IDS = {
  ANNIVERSARY: 1,
  MONTHLY: 2,
  MILESTONE: 3
};

/** Local morning hour at which celebration notifications are delivered */
export const NOTIFICATION_HOUR = 9;

/**
 * Every id this module owns: the yearly anniversary, the eleven monthly
 * "-versaries" (MONTHLY * 100 + month), and the one-shot milestone. Used to
 * clear only our own reminders, so any future notification feature is not
 * silently wiped when we reschedule.
 */
export const OWNED_NOTIFICATION_IDS = [
  NOTIFICATION_IDS.ANNIVERSARY,
  NOTIFICATION_IDS.MILESTONE,
  ...Array.from(
    { length: 12 },
    (_, i) => NOTIFICATION_IDS.MONTHLY * 100 + i + 1
  )
];

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/* ============================================================
   Haptics
   ============================================================ */

/** Soft tap for small interactions (bursting hearts on the hero card) */
export async function tapHaptic() {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    console.warn('Haptics unavailable:', error);
  }
}

/** Success buzz for the anniversary confetti */
export async function celebrationHaptic() {
  if (!isNative()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    console.warn('Haptics unavailable:', error);
  }
}

/** Heavy thump for million-second milestone confetti */
export async function milestoneHaptic() {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    console.warn('Haptics unavailable:', error);
  }
}

/* ============================================================
   Splash screen
   ============================================================ */

/**
 * Fade the native launch screen out. Called once the timer UI has
 * rendered (launchAutoHide is disabled in capacitor.config.json), and
 * also on the error path so a failed init never leaves the splash stuck.
 */
export async function hideSplashScreen() {
  if (!isNative()) return;
  try {
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch (error) {
    console.warn('Splash screen hide failed:', error);
  }
}

/* ============================================================
   Status bar
   ============================================================ */

/**
 * Keep the iOS status bar (clock, battery) legible on the active theme.
 * Style.Dark = light text for dark backgrounds, and vice versa.
 * @param {'dark'|'light'} activeTheme
 */
export async function syncStatusBar(activeTheme) {
  if (!isNative()) return;
  try {
    await StatusBar.setStyle({
      style: activeTheme === 'dark' ? Style.Dark : Style.Light
    });
  } catch (error) {
    console.warn('Status bar sync failed:', error);
  }
}

/* ============================================================
   Local notifications
   ============================================================ */

/**
 * The next million-second mark of the relationship, in local time.
 * Pure; exported for tests.
 * @param {Date} startDate
 * @param {Date} [now]
 * @returns {{ at: Date, millions: number }}
 */
export function getNextMillionSecondMilestone(startDate, now = new Date()) {
  const intervalMs = ANIMATION_CONFIG.MILESTONE_INTERVAL * 1000;
  const elapsedMs = now.getTime() - startDate.getTime();
  const next = Math.floor(elapsedMs / intervalMs) + 1;

  return {
    at: new Date(startDate.getTime() + next * intervalMs),
    millions: next
  };
}

/**
 * Clamp a day-of-month to one that exists in the given month, so a monthly
 * reminder is never silently skipped. A calendar trigger without a year has
 * to match every year, so February is treated as 28 days.
 * Pure; exported for tests.
 *
 * @param {number} month 1-based
 * @param {number} day
 * @returns {number}
 */
export function clampDayToMonth(month, day) {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return Math.min(day, daysInMonth[month - 1]);
}

/**
 * Build the notification payloads for LocalNotifications.schedule().
 * Pure; exported for tests.
 *
 * - Anniversary: repeats yearly on the anniversary's month + day.
 * - Monthly: one yearly-repeating trigger per remaining month, on the
 *   anniversary's day-of-month (clamped to the last day of short months).
 *   Scheduling per month rather than one monthly repeater is what keeps the
 *   anniversary itself from getting both notifications.
 * - Milestone: a one-shot at the next million-second mark, rescheduled
 *   every time the app launches.
 *
 * @param {Date} startDate
 * @param {Date} [now]
 */
export function buildLoveNotifications(startDate, now = new Date()) {
  const milestone = getNextMillionSecondMilestone(startDate, now);
  const month = startDate.getMonth() + 1; // LocalNotifications months are 1-based
  const day = startDate.getDate();

  return [
    {
      id: NOTIFICATION_IDS.ANNIVERSARY,
      title: getUIText('notifAnniversaryTitle'),
      body: getUIText('notifAnniversaryBody'),
      schedule: {
        on: { month, day, hour: NOTIFICATION_HOUR, minute: 0 }
      }
    },
    ...Array.from({ length: 12 }, (_, i) => i + 1)
      .filter((m) => m !== month)
      .map((m) => ({
        id: NOTIFICATION_IDS.MONTHLY * 100 + m,
        title: getUIText('notifMonthlyTitle'),
        body: getUIText('notifMonthlyBody'),
        schedule: {
          on: {
            month: m,
            day: clampDayToMonth(m, day),
            hour: NOTIFICATION_HOUR,
            minute: 0
          }
        }
      })),
    {
      id: NOTIFICATION_IDS.MILESTONE,
      title: getUIText('notifMilestoneTitle'),
      body: getUIText('notifMilestoneBody', { count: milestone.millions }),
      schedule: { at: milestone.at }
    }
  ];
}

/**
 * (Re)schedule all celebration notifications, if permission has already been
 * granted. Runs on every app start so the one-shot milestone stays current
 * and a changed anniversary date takes effect.
 *
 * This never prompts: iOS only ever shows the permission dialog once, so we
 * spend it on a deliberate user action instead (see requestNotifications).
 *
 * @param {Date} startDate
 */
export async function scheduleLoveNotifications(startDate) {
  if (!isNative()) return;

  try {
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') return;

    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter((n) =>
      OWNED_NOTIFICATION_IDS.includes(n.id)
    );
    if (ours.length > 0) {
      await LocalNotifications.cancel({ notifications: ours });
    }

    await LocalNotifications.schedule({
      notifications: buildLoveNotifications(startDate)
    });
  } catch (error) {
    console.warn('Could not schedule notifications:', error);
  }
}

/**
 * Ask for notification permission, then schedule. Called after a real
 * interaction (the first tap on the hero card) so the iOS dialog arrives
 * with context rather than over an app the user has not seen yet — it can
 * only ever be shown once, so a blind first-launch prompt is easy to lose.
 *
 * @param {Date} startDate
 * @returns {Promise<boolean>} whether notifications are now enabled
 */
export async function requestNotifications(startDate) {
  if (!isNative()) return false;

  try {
    const current = await LocalNotifications.checkPermissions();

    // 'denied' is final on iOS; only Settings can undo it
    if (current.display === 'denied') return false;

    const permission =
      current.display === 'granted'
        ? current
        : await LocalNotifications.requestPermissions();

    if (permission.display !== 'granted') return false;

    await scheduleLoveNotifications(startDate);
    return true;
  } catch (error) {
    console.warn('Could not request notification permission:', error);
    return false;
  }
}

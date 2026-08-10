import {
  buildLoveNotifications,
  getNextMillionSecondMilestone,
  NOTIFICATION_IDS,
  NOTIFICATION_HOUR
} from '../src/native/nativeFeatures.js';

describe('getNextMillionSecondMilestone', () => {
  const start = new Date('2024-06-04T07:39:00');

  test('returns the first million-second mark right after the start', () => {
    const now = new Date(start.getTime() + 1000); // 1s in
    const { at, millions } = getNextMillionSecondMilestone(start, now);

    expect(millions).toBe(1);
    expect(at.getTime()).toBe(start.getTime() + 1_000_000 * 1000);
  });

  test('returns the next mark when part-way between milestones', () => {
    const now = new Date(start.getTime() + 1_500_000 * 1000); // 1.5M s in
    const { at, millions } = getNextMillionSecondMilestone(start, now);

    expect(millions).toBe(2);
    expect(at.getTime()).toBe(start.getTime() + 2_000_000 * 1000);
  });

  test('always returns a future date', () => {
    const now = new Date(start.getTime() + 999_999_999); // arbitrary offset
    const { at } = getNextMillionSecondMilestone(start, now);

    expect(at.getTime()).toBeGreaterThan(now.getTime());
  });
});

describe('buildLoveNotifications', () => {
  const start = new Date('2024-06-04T07:39:00'); // June 4
  const now = new Date('2025-01-15T12:00:00');
  const notifications = buildLoveNotifications(start, now);

  test('schedules a yearly anniversary notification on the right morning', () => {
    const anniversary = notifications.find(
      (n) => n.id === NOTIFICATION_IDS.ANNIVERSARY
    );

    expect(anniversary).toBeDefined();
    expect(anniversary.schedule.on).toEqual({
      month: 6,
      day: 4,
      hour: NOTIFICATION_HOUR,
      minute: 0
    });
    expect(anniversary.title).toBeTruthy();
    expect(anniversary.body).toBeTruthy();
  });

  test('schedules monthly notifications for every month except the anniversary month', () => {
    const monthly = notifications.filter(
      (n) => n.id >= NOTIFICATION_IDS.MONTHLY * 100
    );
    const months = monthly.map((n) => n.schedule.on.month);

    expect(monthly).toHaveLength(11);
    expect(months).not.toContain(6); // yearly notification owns June
    monthly.forEach((n) => {
      expect(n.schedule.on.day).toBe(4);
      expect(n.schedule.on.hour).toBe(NOTIFICATION_HOUR);
    });
  });

  test('schedules a one-shot at the next million-second milestone', () => {
    const milestone = notifications.find(
      (n) => n.id === NOTIFICATION_IDS.MILESTONE
    );
    const expected = getNextMillionSecondMilestone(start, now);

    expect(milestone.schedule.at.getTime()).toBe(expected.at.getTime());
    expect(milestone.body).toContain(String(expected.millions));
  });

  test('uses unique notification ids', () => {
    const ids = notifications.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

import {
  calculateRecurringOccurrences,
  getCurrentLocalWeekRange,
  getLocalParts,
  createDateInTimezone,
} from '../domain/services/classroom-scheduler.util';

describe('classroom-scheduler.util', () => {
  describe('getCurrentLocalWeekRange', () => {
    it('should return Monday 00:00:00 to Sunday 23:59:59.999 in classroom timezone', () => {
      // Wednesday Nov 11, 2026
      const refDate = new Date('2026-11-11T12:00:00.000Z');
      const timeZone = 'UTC';

      const { fromDate, toDate } = getCurrentLocalWeekRange(timeZone, refDate);

      const fromParts = getLocalParts(fromDate, timeZone);
      const toParts = getLocalParts(toDate, timeZone);

      // Monday is 1
      expect(fromParts.weekday).toBe(1);
      expect(fromParts.day).toBe(9); // Nov 9 2026 is Monday
      expect(fromParts.hour).toBe(0);
      expect(fromParts.minute).toBe(0);

      // Sunday is 0
      expect(toParts.weekday).toBe(0);
      expect(toParts.day).toBe(15); // Nov 15 2026 is Sunday
      expect(toParts.hour).toBe(23);
      expect(toParts.minute).toBe(59);
    });
  });

  describe('calculateRecurringOccurrences', () => {
    it('should generate Monday and Thursday occurrences at 17:00 for weekly interval', () => {
      const effectiveFrom = new Date('2026-11-09T00:00:00.000Z'); // Monday
      const endLimit = new Date('2026-11-23T23:59:59.999Z'); // 2 weeks later

      const occurrences = calculateRecurringOccurrences({
        daysOfWeek: [1, 4], // Monday, Thursday
        startTime: '17:00',
        timeZone: 'UTC',
        intervalWeeks: 1,
        effectiveFrom,
        effectiveUntil: null,
        startLimit: effectiveFrom,
        endLimit,
      });

      // Over 2 weeks: Mon Nov 9, Thu Nov 12, Mon Nov 16, Thu Nov 19, Mon Nov 23
      expect(occurrences.length).toBe(5);

      const parts0 = getLocalParts(occurrences[0], 'UTC');
      expect(parts0.weekday).toBe(1);
      expect(parts0.day).toBe(9);
      expect(parts0.hour).toBe(17);
      expect(parts0.minute).toBe(0);

      const parts1 = getLocalParts(occurrences[1], 'UTC');
      expect(parts1.weekday).toBe(4);
      expect(parts1.day).toBe(12);
      expect(parts1.hour).toBe(17);
    });

    it('should skip alternate weeks when intervalWeeks is 2 (biweekly)', () => {
      const effectiveFrom = new Date('2026-11-09T00:00:00.000Z'); // Monday
      const endLimit = new Date('2026-11-24T00:00:00.000Z');

      const occurrences = calculateRecurringOccurrences({
        daysOfWeek: [1, 4],
        startTime: '17:00',
        timeZone: 'UTC',
        intervalWeeks: 2,
        effectiveFrom,
        effectiveUntil: null,
        startLimit: effectiveFrom,
        endLimit,
      });

      // Week 0: Nov 9, Nov 12
      // Week 1: skipped
      // Week 2: Nov 23
      expect(occurrences.length).toBe(3);
      const days = occurrences.map((d) => getLocalParts(d, 'UTC').day);
      expect(days).toEqual([9, 12, 23]);
    });

    it('should respect effectiveUntil cap', () => {
      const effectiveFrom = new Date('2026-11-09T00:00:00.000Z');
      const effectiveUntil = new Date('2026-11-13T00:00:00.000Z');
      const endLimit = new Date('2026-12-09T00:00:00.000Z');

      const occurrences = calculateRecurringOccurrences({
        daysOfWeek: [1, 4],
        startTime: '17:00',
        timeZone: 'UTC',
        intervalWeeks: 1,
        effectiveFrom,
        effectiveUntil,
        startLimit: effectiveFrom,
        endLimit,
      });

      // Only Nov 9 and Nov 12 are <= effectiveUntil
      expect(occurrences.length).toBe(2);
      const days = occurrences.map((d) => getLocalParts(d, 'UTC').day);
      expect(days).toEqual([9, 12]);
    });
  });
});

export function isValidTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function sanitizeTimeZone(tz?: string | null): string {
  if (tz && isValidTimeZone(tz)) return tz;
  return 'UTC';
}

export interface LocalTimeParts {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 0=Sun, 1=Mon, ..., 6=Sat
  hour: number;
  minute: number;
  second: number;
}

export function getLocalParts(date: Date, timeZone: string): LocalTimeParts {
  const safeTz = sanitizeTimeZone(timeZone);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;
  let second = 0;

  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    if (part.type === 'month') month = parseInt(part.value, 10);
    if (part.type === 'day') day = parseInt(part.value, 10);
    if (part.type === 'hour') hour = parseInt(part.value, 10);
    if (part.type === 'minute') minute = parseInt(part.value, 10);
    if (part.type === 'second') second = parseInt(part.value, 10);
  }

  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value;
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = weekdayMap[weekdayStr ?? ''] ?? date.getUTCDay();

  return { year, month, day, weekday, hour, minute, second };
}

export function createDateInTimezone(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  second: number = 0,
  millisecond: number = 0,
  timeZone: string = 'UTC',
): Date {
  const safeTz = sanitizeTimeZone(timeZone);
  const pad = (n: number) => String(n).padStart(2, '0');
  const targetPrefix = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;

  let guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));

  for (let i = 0; i < 3; i++) {
    const parts = getLocalParts(guess, safeTz);
    const guessPrefix = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
    if (guessPrefix === targetPrefix) break;

    const targetEpoch = Date.UTC(year, month - 1, day, hour, minute, second);
    const guessLocalEpoch = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const diff = targetEpoch - guessLocalEpoch;
    guess = new Date(guess.getTime() + diff);
  }

  return guess;
}

/**
 * Returns the current local week range [Monday 00:00:00.000, Sunday 23:59:59.999] in the given timezone.
 */
export function getCurrentLocalWeekRange(
  timeZone: string,
  referenceDate: Date = new Date(),
): { fromDate: Date; toDate: Date } {
  const safeTz = sanitizeTimeZone(timeZone);
  const current = getLocalParts(referenceDate, safeTz);

  // Determine how many days to subtract to reach Monday
  // In JS: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  const daysFromMonday = current.weekday === 0 ? 6 : current.weekday - 1;

  // Approximate UTC mid-day for current local day, then subtract daysFromMonday
  const mondayNaive = new Date(Date.UTC(current.year, current.month - 1, current.day - daysFromMonday, 12, 0, 0));
  const mondayParts = getLocalParts(mondayNaive, safeTz);

  const fromDate = createDateInTimezone(
    mondayParts.year,
    mondayParts.month,
    mondayParts.day,
    0,
    0,
    0,
    0,
    safeTz,
  );

  // Sunday is 6 days after Monday
  const sundayNaive = new Date(Date.UTC(mondayParts.year, mondayParts.month - 1, mondayParts.day + 6, 12, 0, 0));
  const sundayParts = getLocalParts(sundayNaive, safeTz);

  const toDate = createDateInTimezone(
    sundayParts.year,
    sundayParts.month,
    sundayParts.day,
    23,
    59,
    59,
    999,
    safeTz,
  );

  return { fromDate, toDate };
}

/**
 * Calculates all recurring occurrence dates between startLimit and endLimit according to recurrence pattern.
 */
export function calculateRecurringOccurrences(params: {
  daysOfWeek: readonly number[];
  startTime: string; // HH:mm
  timeZone: string;
  intervalWeeks: number;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  startLimit: Date;
  endLimit: Date;
}): Date[] {
  const {
    daysOfWeek,
    startTime,
    timeZone,
    intervalWeeks,
    effectiveFrom,
    effectiveUntil,
    startLimit,
    endLimit,
  } = params;

  const safeTz = sanitizeTimeZone(timeZone);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const occurrences: Date[] = [];

  // Effective start is max(effectiveFrom, startLimit)
  const actualStart = startLimit > effectiveFrom ? startLimit : effectiveFrom;
  // Effective end is min(endLimit, effectiveUntil)
  const actualEnd = effectiveUntil && effectiveUntil < endLimit ? effectiveUntil : endLimit;

  if (actualStart > actualEnd) {
    return occurrences;
  }

  // Find reference Monday of the effectiveFrom date in classroom timezone
  const effParts = getLocalParts(effectiveFrom, safeTz);
  const effDaysFromMonday = effParts.weekday === 0 ? 6 : effParts.weekday - 1;
  const refMondayNaive = new Date(Date.UTC(effParts.year, effParts.month - 1, effParts.day - effDaysFromMonday, 12, 0, 0));
  const refMondayParts = getLocalParts(refMondayNaive, safeTz);
  const refMondayDateInTz = createDateInTimezone(
    refMondayParts.year,
    refMondayParts.month,
    refMondayParts.day,
    0,
    0,
    0,
    0,
    safeTz,
  );

  // Start scanning day by day from actualStart to actualEnd (buffered by 1 day)
  const startLocal = getLocalParts(actualStart, safeTz);
  const endLocal = getLocalParts(actualEnd, safeTz);

  let currentCursor = new Date(
    Date.UTC(startLocal.year, startLocal.month - 1, startLocal.day, 12, 0, 0),
  );
  const endCursor = new Date(
    Date.UTC(endLocal.year, endLocal.month - 1, endLocal.day + 1, 12, 0, 0),
  );

  while (currentCursor <= endCursor) {
    const dayParts = getLocalParts(currentCursor, safeTz);

    if (daysOfWeek.includes(dayParts.weekday)) {
      // Calculate week index from reference Monday
      const dayStart = createDateInTimezone(
        dayParts.year,
        dayParts.month,
        dayParts.day,
        0,
        0,
        0,
        0,
        safeTz,
      );
      const diffMs = dayStart.getTime() - refMondayDateInTz.getTime();
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const weekIndex = Math.floor(diffDays / 7);

      const interval = Math.max(1, intervalWeeks);
      if (weekIndex >= 0 && weekIndex % interval === 0) {
        const occurrenceDate = createDateInTimezone(
          dayParts.year,
          dayParts.month,
          dayParts.day,
          startHour,
          startMinute,
          0,
          0,
          safeTz,
        );

        if (
          occurrenceDate >= effectiveFrom &&
          (!effectiveUntil || occurrenceDate <= effectiveUntil) &&
          occurrenceDate >= startLimit &&
          occurrenceDate <= endLimit
        ) {
          // Avoid duplicate timestamps
          if (!occurrences.some((d) => d.getTime() === occurrenceDate.getTime())) {
            occurrences.push(occurrenceDate);
          }
        }
      }
    }

    // Advance cursor by 1 day
    currentCursor = new Date(currentCursor.getTime() + 24 * 60 * 60 * 1000);
  }

  return occurrences.sort((a, b) => a.getTime() - b.getTime());
}

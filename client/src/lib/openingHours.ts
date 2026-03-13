/**
 * Opening Hours Parser & Status Checker
 * Parses various opening hours string formats and determines if a location is currently open.
 * Handles formats like:
 *   "Mon-Sat 7am-7pm, Sun 8am-6pm"
 *   "Mon to Fri - 8am to 8pm"
 *   "MON to SUN - 9:00 am – 6:00 pm"
 *   "Tues-Sat 11am-7pm"
 *   "Mon-Thu 10am-7pm, Fri-Sat 10am-5pm, Sun 11am-5pm"
 *   "24 hours"
 */

export type OpenStatus = 'open' | 'closed' | 'closing-soon' | 'unknown';

export interface OpenStatusInfo {
  status: OpenStatus;
  label: string;
  color: string;
  bgColor: string;
  closingTime?: string;
}

const DAY_MAP: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

/** Parse a time string like "7am", "7:30pm", "19:00", "9:00 am" into minutes from midnight */
function parseTime(timeStr: string): number | null {
  const s = timeStr.trim().toLowerCase().replace(/\s+/g, '');

  // Handle "midnight"
  if (s === 'midnight') return 0;
  // Handle "noon"
  if (s === 'noon') return 720;

  // Try "7am", "7:30pm", "7:00am", "19:00"
  const match = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];

  if (ampm === 'pm' && hours < 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;

  // Handle 24-hour format without am/pm
  if (!ampm && hours > 24) return null;

  return hours * 60 + minutes;
}

/** Parse a day name like "Mon", "Tues", "Friday" into day number (0=Sun) */
function parseDay(dayStr: string): number | null {
  const key = dayStr.trim().toLowerCase();
  return DAY_MAP[key] ?? null;
}

/** Expand a day range like "Mon-Fri" or "Mon to Sat" into array of day numbers */
function expandDayRange(rangeStr: string): number[] {
  const s = rangeStr.trim();

  // Single day
  const singleDay = parseDay(s);
  if (singleDay !== null) return [singleDay];

  // Range: "Mon-Fri", "Mon to Fri", "Mon – Fri"
  const parts = s.split(/\s*[-–—]\s*|\s+to\s+/i);
  if (parts.length === 2) {
    const start = parseDay(parts[0]);
    const end = parseDay(parts[1]);
    if (start !== null && end !== null) {
      const days: number[] = [];
      let d = start;
      while (true) {
        days.push(d);
        if (d === end) break;
        d = (d + 1) % 7;
      }
      return days;
    }
  }

  return [];
}

interface DaySchedule {
  open: number; // minutes from midnight
  close: number; // minutes from midnight (can be > 1440 for next-day closing)
}

/** Parse the full opening hours string into a schedule per day of week */
function parseOpeningHours(hoursStr: string): Map<number, DaySchedule> | null {
  if (!hoursStr || hoursStr === 'unknown' || hoursStr.toLowerCase().includes('closed') || hoursStr.toLowerCase().includes('check website')) {
    return null;
  }

  const schedule = new Map<number, DaySchedule>();

  // Handle "24 hours" or "24/7"
  if (/24\s*(hours|\/7|hrs)/i.test(hoursStr)) {
    for (let d = 0; d < 7; d++) {
      schedule.set(d, { open: 0, close: 1440 });
    }
    return schedule;
  }

  // Split by comma or semicolon for multiple day-range entries
  const segments = hoursStr.split(/[,;]+/).map(s => s.trim()).filter(Boolean);

  for (const segment of segments) {
    // Try to extract day range and time range
    // Patterns:
    //   "Mon-Sat 7am-7pm"
    //   "Mon to Fri - 8am to 8pm"
    //   "Sun 8am-6pm"
    //   "MON to SUN - 9:00 am – 6:00 pm"

    // First, try to find day part and time part
    // Strategy: find the time range (contains am/pm or HH:MM pattern)
    const timeRangeMatch = segment.match(
      /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*[-–—]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
    );

    if (!timeRangeMatch) continue;

    const openTime = parseTime(timeRangeMatch[1]);
    const closeTime = parseTime(timeRangeMatch[2]);
    if (openTime === null || closeTime === null) continue;

    // Adjust close time if it's before open (e.g., 10pm-2am)
    const adjustedClose = closeTime <= openTime ? closeTime + 1440 : closeTime;

    // Extract the day part (everything before the time range)
    const dayPart = segment.substring(0, timeRangeMatch.index).trim().replace(/[-–—:]\s*$/, '').trim();

    let days: number[] = [];
    if (!dayPart) {
      // No day specified — assume all days
      days = [0, 1, 2, 3, 4, 5, 6];
    } else {
      // Could be multiple day ranges separated by /
      const daySegments = dayPart.split(/[/&]+/).map(s => s.trim());
      for (const ds of daySegments) {
        days.push(...expandDayRange(ds));
      }
    }

    if (days.length === 0) {
      // Fallback: assume all days
      days = [0, 1, 2, 3, 4, 5, 6];
    }

    for (const day of days) {
      schedule.set(day, { open: openTime, close: adjustedClose });
    }
  }

  return schedule.size > 0 ? schedule : null;
}

/** Format minutes to a readable time string */
function formatTime(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return min === 0 ? `${h12}${ampm}` : `${h12}:${min.toString().padStart(2, '0')}${ampm}`;
}

/** Get the current open/closed status for a location */
export function getOpenStatus(openingHours: string): OpenStatusInfo {
  const schedule = parseOpeningHours(openingHours);

  if (!schedule) {
    return {
      status: 'unknown',
      label: 'Hours unknown',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check today's schedule
  const todaySchedule = schedule.get(currentDay);

  if (!todaySchedule) {
    return {
      status: 'closed',
      label: 'Closed today',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    };
  }

  const { open, close } = todaySchedule;

  // Check if currently within opening hours
  if (currentMinutes >= open && currentMinutes < close) {
    // Check if closing within 60 minutes
    const minutesUntilClose = close - currentMinutes;
    if (minutesUntilClose <= 60) {
      return {
        status: 'closing-soon',
        label: `Closing at ${formatTime(close)}`,
        color: 'text-amber-700 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        closingTime: formatTime(close),
      };
    }
    return {
      status: 'open',
      label: `Open · Closes ${formatTime(close)}`,
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      closingTime: formatTime(close),
    };
  }

  // Check if it hasn't opened yet today
  if (currentMinutes < open) {
    return {
      status: 'closed',
      label: `Closed · Opens ${formatTime(open)}`,
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    };
  }

  // Also check yesterday's schedule for late-night closings (close > 1440)
  const yesterdayDay = (currentDay + 6) % 7;
  const yesterdaySchedule = schedule.get(yesterdayDay);
  if (yesterdaySchedule && yesterdaySchedule.close > 1440) {
    const adjustedClose = yesterdaySchedule.close - 1440;
    if (currentMinutes < adjustedClose) {
      const minutesUntilClose = adjustedClose - currentMinutes;
      if (minutesUntilClose <= 60) {
        return {
          status: 'closing-soon',
          label: `Closing at ${formatTime(adjustedClose)}`,
          color: 'text-amber-700 dark:text-amber-400',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          closingTime: formatTime(adjustedClose),
        };
      }
      return {
        status: 'open',
        label: `Open · Closes ${formatTime(adjustedClose)}`,
        color: 'text-emerald-700 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        closingTime: formatTime(adjustedClose),
      };
    }
  }

  // Find next opening time
  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (currentDay + offset) % 7;
    const nextSchedule = schedule.get(nextDay);
    if (nextSchedule) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      if (offset === 1) {
        return {
          status: 'closed',
          label: `Closed · Opens tomorrow ${formatTime(nextSchedule.open)}`,
          color: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
        };
      }
      return {
        status: 'closed',
        label: `Closed · Opens ${dayNames[nextDay]} ${formatTime(nextSchedule.open)}`,
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
      };
    }
  }

  return {
    status: 'closed',
    label: 'Closed',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  };
}

/** Check if a location is currently open (simple boolean for filtering) */
export function isOpenNow(openingHours: string): boolean {
  const status = getOpenStatus(openingHours);
  return status.status === 'open' || status.status === 'closing-soon';
}

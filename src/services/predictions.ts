/**
 * Velmora Cycle Calculations & Predictions Engine
 * Calculates cycle intervals strictly from recorded start dates,
 * calculates median length, and projects upcoming period estimates.
 */

import { PeriodRecord, CycleStats } from '../types/index.ts';

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD string to Date object at local midnight
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Difference in calendar days between two YYYY-MM-DD dates (d2 - d1)
 */
export function getDaysDifference(d1Str: string, d2Str: string): number {
  const d1 = parseDate(d1Str);
  const d2 = parseDate(d2Str);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Calculate median of an array of numbers
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Calculate cycle statistics from recorded periods
 */
export function calculateCycleStats(
  periods: PeriodRecord[],
  defaultCycleLength = 28,
  defaultPeriodDuration = 5,
  lutealPhaseDays = 14
): CycleStats {
  // Sort periods chronologically (oldest to newest) for interval calculation
  const sortedPeriods = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (sortedPeriods.length === 0) {
    return {
      hasEnoughData: false,
      totalRecordedCycles: 0,
      medianCycleLength: defaultCycleLength,
      minCycleLength: defaultCycleLength,
      maxCycleLength: defaultCycleLength,
      variationDays: 0,
      isPreliminary: true,
      cycleIntervals: [],
      medianPeriodDuration: defaultPeriodDuration
    };
  }

  // Calculate cycle intervals between consecutive start dates
  const intervals: { from: string; to: string; lengthDays: number }[] = [];
  const lengths: number[] = [];

  for (let i = 0; i < sortedPeriods.length - 1; i++) {
    const currentStart = sortedPeriods[i].startDate;
    const nextStart = sortedPeriods[i + 1].startDate;
    const intervalDays = getDaysDifference(currentStart, nextStart);

    // Only consider biologically plausible cycle intervals (e.g. between 14 and 100 days)
    // Any interval outside that range is noted but handled with care
    if (intervalDays >= 14 && intervalDays <= 120) {
      intervals.push({ from: currentStart, to: nextStart, lengthDays: intervalDays });
      lengths.push(intervalDays);
    }
  }

  // Calculate period durations (bleeding duration)
  const durations: number[] = [];
  for (const p of sortedPeriods) {
    if (p.endDate) {
      const dur = getDaysDifference(p.startDate, p.endDate) + 1;
      if (dur > 0 && dur <= 20) {
        durations.push(dur);
      }
    }
  }

  const medianDuration = durations.length > 0 ? calculateMedian(durations) : defaultPeriodDuration;

  const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
  const todayStr = formatDate(new Date());
  const daysSinceLastStart = getDaysDifference(lastPeriod.startDate, todayStr);
  const currentCycleDay = daysSinceLastStart >= 0 ? daysSinceLastStart + 1 : 1;

  let medianCycleLength = defaultCycleLength;
  let minCycleLength = defaultCycleLength;
  let maxCycleLength = defaultCycleLength;
  let variationDays = 0;
  let isPreliminary = true;
  const hasEnoughData = lengths.length >= 1;

  if (lengths.length >= 1) {
    medianCycleLength = calculateMedian(lengths);
    minCycleLength = Math.min(...lengths);
    maxCycleLength = Math.max(...lengths);
    variationDays = maxCycleLength - minCycleLength;
    // Considered established if at least 3 completed cycles are recorded
    isPreliminary = lengths.length < 3;
  } else {
    // If only 1 period is recorded, use default preference or single record
    medianCycleLength = defaultCycleLength;
    minCycleLength = defaultCycleLength;
    maxCycleLength = defaultCycleLength;
    variationDays = 0;
    isPreliminary = true;
  }

  // Estimate next period
  const estimatedNextPeriodStart = addDays(lastPeriod.startDate, medianCycleLength);
  const estimatedNextPeriodEnd = addDays(estimatedNextPeriodStart, medianDuration - 1);

  // Determine current phase estimate (with clear non-medical disclaimer in UI)
  let currentPhase: CycleStats['currentPhase'] = 'Follicular';
  const ovulatoryDay = Math.max(8, medianCycleLength - lutealPhaseDays);

  if (currentCycleDay <= medianDuration) {
    currentPhase = 'Menstrual';
  } else if (currentCycleDay > medianCycleLength) {
    currentPhase = 'Overdue / Awaiting Start';
  } else if (Math.abs(currentCycleDay - ovulatoryDay) <= 2) {
    currentPhase = 'Estimated Ovulation';
  } else if (currentCycleDay < ovulatoryDay - 2) {
    currentPhase = 'Follicular';
  } else {
    currentPhase = 'Luteal';
  }

  return {
    hasEnoughData,
    totalRecordedCycles: lengths.length,
    medianCycleLength,
    minCycleLength,
    maxCycleLength,
    variationDays,
    isPreliminary,
    cycleIntervals: intervals,
    medianPeriodDuration: medianDuration,
    lastPeriodStart: lastPeriod.startDate,
    estimatedNextPeriodStart,
    estimatedNextPeriodEnd,
    daysSinceLastStart,
    currentCycleDay,
    currentPhase
  };
}

/**
 * Check if a given date falls within any recorded period
 */
export function isDateInPeriod(dateStr: string, periods: PeriodRecord[]): { inPeriod: boolean; period?: PeriodRecord } {
  for (const p of periods) {
    if (p.startDate === dateStr) {
      return { inPeriod: true, period: p };
    }
    if (p.endDate) {
      if (dateStr >= p.startDate && dateStr <= p.endDate) {
        return { inPeriod: true, period: p };
      }
    }
  }
  return { inPeriod: false };
}

/**
 * Check if a date falls within estimated next period window
 */
export function isDateInEstimatedNextPeriod(dateStr: string, stats: CycleStats): boolean {
  if (!stats.estimatedNextPeriodStart || !stats.estimatedNextPeriodEnd) return false;
  return dateStr >= stats.estimatedNextPeriodStart && dateStr <= stats.estimatedNextPeriodEnd;
}

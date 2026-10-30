/**
 * Velmora Health Alert Rule Engine
 * Transparent, evidence-based pattern recognition engine grounded in clinical
 * guidelines from ACOG (American College of Obstetricians and Gynecologists)
 * and the NHS.
 *
 * NOTE: All generated alerts are strictly informational guidance to help users
 * prepare for clinical consultations. Velmora does not diagnose medical conditions.
 */

import { PeriodRecord, DailyLog, HealthAlert, CycleStats } from '../types/index.ts';
import { getDaysDifference, parseDate, formatDate } from './predictions.ts';

export interface UrgentCareGuideline {
  title: string;
  points: string[];
  clinicalReference: string;
}

export const URGENT_CARE_GUIDELINES: UrgentCareGuideline[] = [
  {
    title: 'When to Seek Immediate Medical Evaluation',
    points: [
      'Soaking through one or more sanitary pads or tampons every hour for two or more consecutive hours.',
      'Sudden, severe, unremitting pelvic or lower abdominal pain, particularly if accompanied by fever, chills, dizziness, or fainting.',
      'Passing blood clots larger than the size of a quarter (approx. 2.5 cm / 1 inch).',
      'Bleeding accompanied by positive pregnancy test or severe unilateral lower abdominal cramping (risk of ectopic pregnancy).',
      'Sudden high fever (> 38.9°C / 102°F), vomiting, diarrhea, sunburn-like rash, or dizziness while using tampons or menstrual cups (signs of Toxic Shock Syndrome).'
    ],
    clinicalReference: 'ACOG Practice Bulletin No. 128 (Diagnosis of Abnormal Uterine Bleeding); NHS Guidance on Heavy & Painful Periods.'
  }
];

export function evaluateHealthAlerts(
  periods: PeriodRecord[],
  dailyLogs: DailyLog[],
  stats: CycleStats,
  existingAlerts: HealthAlert[] = []
): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const dismissedSet = new Set(existingAlerts.filter(a => a.dismissed).map(a => a.ruleId + ':' + a.relevantDates.join(',')));

  // Rule 1: Extended Bleeding Duration (> 7 days of bleeding)
  // Check both explicit period records (with end dates) and consecutive daily logs
  for (const p of periods) {
    if (p.endDate) {
      const duration = getDaysDifference(p.startDate, p.endDate) + 1;
      if (duration > 7) {
        const alertKey = `extended_bleeding:${p.startDate},${p.endDate}`;
        alerts.push({
          id: 'alert_ext_' + p.startDate,
          ruleId: 'rule_extended_bleeding',
          title: 'Extended Bleeding Duration',
          summary: `Recorded bleeding lasted ${duration} days, exceeding the typical 2–7 day duration.`,
          recordedDataText: `Period from ${p.startDate} to ${p.endDate} (${duration} consecutive days).`,
          relevantDates: [p.startDate, p.endDate],
          rationale: 'According to ACOG and NHS clinical criteria, typical menstrual bleeding lasts between 2 and 7 days. Bleeding lasting 8 or more days is classified clinically as prolonged menstrual bleeding (menorrhagia) and warrants review by a healthcare provider.',
          clinicalSource: 'ACOG Committee Opinion No. 651 / NHS Menorrhagia Guidelines',
          recommendedNextStep: 'Schedule a routine consultation with your gynecologist or primary care physician. Keep track of pad/tampon counts to share during your visit.',
          severity: duration >= 10 ? 'urgent' : 'attention',
          dismissed: dismissedSet.has(alertKey),
          createdAt: parseDate(p.endDate).getTime()
        });
      }
    }
  }

  // Rule 2: Consecutive Heavy Bleeding (Heavy flow logged for 3+ consecutive days)
  const heavyLogs = dailyLogs
    .filter(log => log.flow === 'heavy')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (heavyLogs.length >= 3) {
    // Check for consecutive streaks of 3+
    let currentStreak: DailyLog[] = [heavyLogs[0]];
    for (let i = 1; i < heavyLogs.length; i++) {
      const prev = heavyLogs[i - 1];
      const curr = heavyLogs[i];
      if (getDaysDifference(prev.date, curr.date) === 1) {
        currentStreak.push(curr);
      } else {
        if (currentStreak.length >= 3) {
          addHeavyStreakAlert(currentStreak, alerts, dismissedSet);
        }
        currentStreak = [curr];
      }
    }
    if (currentStreak.length >= 3) {
      addHeavyStreakAlert(currentStreak, alerts, dismissedSet);
    }
  }

  // Rule 3: Severe Pain Entries (Pain score >= 8 on 2+ logs within the past 30 days)
  const severePainLogs = dailyLogs
    .filter(log => typeof log.pain === 'number' && log.pain >= 8)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (severePainLogs.length >= 2) {
    const dates = severePainLogs.map(l => l.date);
    const alertKey = `severe_pain:${dates.slice(-2).join(',')}`;
    alerts.push({
      id: 'alert_pain_' + dates[dates.length - 1],
      ruleId: 'rule_severe_pain',
      title: 'Persistent Severe Pain Logged',
      summary: `Severe pain (level 8–10 out of 10) recorded across ${severePainLogs.length} days.`,
      recordedDataText: `Pain scores >= 8 logged on: ${dates.slice(-3).join(', ')}.`,
      relevantDates: dates.slice(-3),
      rationale: 'While mild to moderate uterine cramping is common due to prostaglandin release, severe debilitating pelvic pain (dysmenorrhea) that interferes with daily tasks may indicate underlying conditions such as endometriosis, adenomyosis, or fibroids.',
      clinicalSource: 'ACOG Practice Bulletin No. 206 (Chronic Pelvic Pain) / RCOG Guidelines',
      recommendedNextStep: 'Discuss non-steroidal anti-inflammatory response and pain history with your doctor. If pain is sudden, unmanageable, or accompanied by fever/vomiting, seek immediate medical care.',
      severity: 'attention',
      dismissed: dismissedSet.has(alertKey),
      createdAt: Date.now()
    });
  }

  // Rule 4: Short Cycle Intervals (< 21 days between consecutive starts)
  for (const interval of stats.cycleIntervals) {
    if (interval.lengthDays < 21) {
      const alertKey = `short_interval:${interval.from},${interval.to}`;
      alerts.push({
        id: 'alert_short_' + interval.to,
        ruleId: 'rule_short_cycle',
        title: 'Shorter Than Typical Cycle Interval',
        summary: `Cycle interval of ${interval.lengthDays} days between period starts (typical range is 21–35 days).`,
        recordedDataText: `Starts recorded on ${interval.from} and ${interval.to} (${interval.lengthDays} days apart).`,
        relevantDates: [interval.from, interval.to],
        rationale: 'A cycle interval under 21 days (polymenorrhea) can occur occasionally due to anovulatory cycles, stress, thyroid variations, or hormonal fluctuations.',
        clinicalSource: 'FIGO Menstrual Disorders Classification System',
        recommendedNextStep: 'Observe if this recurs in your next cycle. Bring your Velmora cycle history report to your next healthcare visit.',
        severity: 'info',
        dismissed: dismissedSet.has(alertKey),
        createdAt: parseDate(interval.to).getTime()
      });
    }

    // Rule 5: Long Cycle Intervals (> 38 days between consecutive starts)
    if (interval.lengthDays > 38 && interval.lengthDays <= 90) {
      const alertKey = `long_interval:${interval.from},${interval.to}`;
      alerts.push({
        id: 'alert_long_' + interval.to,
        ruleId: 'rule_long_cycle',
        title: 'Longer Than Typical Cycle Interval',
        summary: `Cycle interval of ${interval.lengthDays} days between period starts (typical range is 21–35 days).`,
        recordedDataText: `Starts recorded on ${interval.from} and ${interval.to} (${interval.lengthDays} days apart).`,
        relevantDates: [interval.from, interval.to],
        rationale: 'Cycle intervals exceeding 35–38 days (oligomenorrhea) are frequently caused by delayed ovulation, lifestyle shifts, PCOS, or hormonal variations.',
        clinicalSource: 'ACOG Committee Opinion No. 651',
        recommendedNextStep: 'Log any concurrent symptoms (such as skin changes, temperature, or sleep patterns) to provide full context to your clinician.',
        severity: 'info',
        dismissed: dismissedSet.has(alertKey),
        createdAt: parseDate(interval.to).getTime()
      });
    }
  }

  // Rule 6: Significant Variation From Personal History (Cycle length changed by > 7 days from median)
  if (!stats.isPreliminary && stats.cycleIntervals.length >= 3) {
    const latestInterval = stats.cycleIntervals[stats.cycleIntervals.length - 1];
    const diffFromMedian = Math.abs(latestInterval.lengthDays - stats.medianCycleLength);
    if (diffFromMedian >= 8) {
      const alertKey = `cycle_variation:${latestInterval.from},${latestInterval.to}`;
      alerts.push({
        id: 'alert_var_' + latestInterval.to,
        ruleId: 'rule_cycle_variation',
        title: 'Marked Cycle Length Variation',
        summary: `Your latest cycle was ${latestInterval.lengthDays} days, differing by ${diffFromMedian} days from your personal median of ${stats.medianCycleLength} days.`,
        recordedDataText: `Latest cycle: ${latestInterval.lengthDays} days (Personal median: ${stats.medianCycleLength} days).`,
        relevantDates: [latestInterval.from, latestInterval.to],
        rationale: 'Occasional cycle variations can happen due to illness, travel, high stress, or changes in sleep or body weight. Recurrent swings of > 7 days are worth evaluating with an OB/GYN.',
        clinicalSource: 'ACOG Practice Guidelines for Menstrual Regularity',
        recommendedNextStep: 'Monitor the next 1–2 cycles to see if your rhythm returns to your typical pattern.',
        severity: 'info',
        dismissed: dismissedSet.has(alertKey),
        createdAt: parseDate(latestInterval.to).getTime()
      });
    }
  }

  // Sort by createdAt descending
  alerts.sort((a, b) => b.createdAt - a.createdAt);
  return alerts;
}

function addHeavyStreakAlert(streak: DailyLog[], alerts: HealthAlert[], dismissedSet: Set<string>) {
  const dates = streak.map(s => s.date);
  const alertKey = `heavy_flow:${dates[0]},${dates[dates.length - 1]}`;
  alerts.push({
    id: 'alert_heavy_' + dates[0],
    ruleId: 'rule_repeated_heavy_flow',
    title: 'Consecutive Days of Heavy Flow',
    summary: `Heavy menstrual flow recorded on ${streak.length} consecutive days (${dates[0]} to ${dates[dates.length - 1]}).`,
    recordedDataText: `Heavy flow logged on: ${dates.join(', ')}.`,
    relevantDates: dates,
    rationale: 'Prolonged heavy flow can deplete iron stores and cause fatigue or anemia over time. Clinical guidelines recommend evaluating heavy bleeding that persists beyond 2–3 peak days.',
    clinicalSource: 'CDC & ACOG Clinical Summary on Menorrhagia',
    recommendedNextStep: 'Consult your doctor to evaluate blood counts and iron levels. Review our urgent care guidelines if soaking pads every hour.',
    severity: 'attention',
    dismissed: dismissedSet.has(alertKey),
    createdAt: parseDate(dates[dates.length - 1]).getTime()
  });
}

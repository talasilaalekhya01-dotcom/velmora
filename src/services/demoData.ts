/**
 * Velmora Sample Demo Dataset
 * Realistic 4-month menstrual tracking history for testing and demonstration.
 * Explicitly labeled and easily cleared with 1 click.
 */

import { PeriodRecord, DailyLog, FacilityReview, ProductReview } from '../types/index.ts';

// Dates generated relative to today or recent 4 months (e.g., July - October 2026)
export const DEMO_PERIODS: PeriodRecord[] = [
  {
    id: 'demo_period_4',
    startDate: '2026-10-12',
    endDate: '2026-10-16',
    notes: 'Began Monday morning. Normal flow, moderate cramps on day 1.',
    source: 'demo',
    createdAt: Date.now() - 12 * 86400000
  },
  {
    id: 'demo_period_3',
    startDate: '2026-09-14',
    endDate: '2026-09-19',
    notes: 'Duration 5 days. Heavy flow on day 2.',
    source: 'demo',
    createdAt: Date.now() - 40 * 86400000
  },
  {
    id: 'demo_period_2',
    startDate: '2026-08-16',
    endDate: '2026-08-21',
    notes: '29 days cycle. Mild cramps.',
    source: 'demo',
    createdAt: Date.now() - 69 * 86400000
  },
  {
    id: 'demo_period_1',
    startDate: '2026-07-19',
    endDate: '2026-07-23',
    notes: '28 days cycle. Started warm tea & hot water bottle.',
    source: 'demo',
    createdAt: Date.now() - 97 * 86400000
  }
];

export const DEMO_LOGS: DailyLog[] = [
  // Recent cycle (October)
  {
    date: '2026-10-12',
    flow: 'medium',
    pain: 6,
    symptoms: ['cramps', 'fatigue', 'bloating'],
    mood: 'fatigued',
    medications: 'Ibuprofen 400mg with breakfast',
    notes: 'Cycle start. Cramps eased in afternoon.',
    updatedAt: Date.now() - 12 * 86400000
  },
  {
    date: '2026-10-13',
    flow: 'heavy',
    pain: 5,
    symptoms: ['cramps', 'back pain'],
    mood: 'sensitive',
    medications: 'Heating pad in evening',
    notes: 'Heavier flow today, needed extra pad change.',
    updatedAt: Date.now() - 11 * 86400000
  },
  {
    date: '2026-10-14',
    flow: 'medium',
    pain: 3,
    symptoms: ['bloating'],
    mood: 'calm',
    notes: 'Feeling noticeably better.',
    updatedAt: Date.now() - 10 * 86400000
  },
  {
    date: '2026-10-15',
    flow: 'light',
    pain: 1,
    symptoms: [],
    mood: 'happy',
    notes: 'Energy returning.',
    updatedAt: Date.now() - 9 * 86400000
  },
  {
    date: '2026-10-16',
    flow: 'light',
    pain: 0,
    symptoms: [],
    mood: 'energetic',
    notes: 'Spotting only; period ended.',
    updatedAt: Date.now() - 8 * 86400000
  },
  // Ovulation window log
  {
    date: '2026-10-24',
    flow: 'none',
    pain: 1,
    symptoms: ['bloating'],
    mood: 'energetic',
    notes: 'Mild unilateral pelvic twinge (mittelschmerz).',
    updatedAt: Date.now()
  },
  // September logs
  {
    date: '2026-09-14',
    flow: 'medium',
    pain: 7,
    symptoms: ['cramps', 'headache', 'nausea'],
    mood: 'irritable',
    medications: 'Ibuprofen 400mg',
    notes: 'Severe headache on morning of cycle start.',
    updatedAt: Date.now() - 40 * 86400000
  },
  {
    date: '2026-09-15',
    flow: 'heavy',
    pain: 6,
    symptoms: ['cramps', 'back pain'],
    mood: 'fatigued',
    updatedAt: Date.now() - 39 * 86400000
  },
  {
    date: '2026-09-16',
    flow: 'medium',
    pain: 3,
    symptoms: ['bloating'],
    mood: 'calm',
    updatedAt: Date.now() - 38 * 86400000
  }
];

export const DEMO_PRODUCT_REVIEWS: Record<string, ProductReview> = {
  menstrual_cups: {
    productId: 'menstrual_cups',
    rating: 5,
    comfort: 5,
    leakProtection: 5,
    notes: 'Took two cycles to get the fold right, but now I wear it for full 10-hour work shifts without worries.',
    personalVerdict: 'Regular choice',
    updatedAt: Date.now() - 20 * 86400000
  },
  pads_disposable: {
    productId: 'pads_disposable',
    rating: 4,
    comfort: 3,
    leakProtection: 4,
    notes: 'Reliable for overnight use on heavy days as a backup.',
    personalVerdict: 'Backup option',
    updatedAt: Date.now() - 45 * 86400000
  }
};

export const DEMO_FACILITY_REVIEWS: Record<string, FacilityReview> = {
  fallback_1: {
    facilityId: 'fallback_1',
    facilityName: 'Metropolitan Women’s Health & Wellness',
    rating: 5,
    notes: 'Dr. Evans was thorough, respectful, and listened carefully to my dysmenorrhea questions. Zero wait time.',
    visitedDate: '2026-08-25',
    updatedAt: Date.now() - 60 * 86400000
  }
};

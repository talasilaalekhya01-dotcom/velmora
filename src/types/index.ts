/**
 * Velmora Data Types & Domain Interfaces
 */

export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy';

export interface PeriodRecord {
  id: string; // ISO date string or uuid
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, optional if ongoing
  notes?: string;
  source?: 'user' | 'demo';
  createdAt: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD (Primary Key)
  flow?: FlowLevel;
  pain?: number; // 0 - 10
  symptoms: string[]; // ['cramps', 'headache', 'bloating', etc.]
  customSymptoms?: string[];
  mood?: string; // 'calm' | 'happy' | 'energetic' | 'sensitive' | 'anxious' | 'irritable' | 'sad' | 'fatigued'
  medications?: string; // e.g. "Ibuprofen 400mg", "Heating pad"
  notes?: string;
  updatedAt: number;
}

export interface CycleStats {
  hasEnoughData: boolean;
  totalRecordedCycles: number;
  medianCycleLength: number;
  minCycleLength: number;
  maxCycleLength: number;
  variationDays: number;
  isPreliminary: boolean;
  cycleIntervals: { from: string; to: string; lengthDays: number }[];
  medianPeriodDuration: number;
  lastPeriodStart?: string;
  estimatedNextPeriodStart?: string;
  estimatedNextPeriodEnd?: string;
  daysSinceLastStart?: number;
  currentCycleDay?: number;
  currentPhase?: 'Menstrual' | 'Follicular' | 'Estimated Ovulation' | 'Luteal' | 'Overdue / Awaiting Start';
}

export type AlertSeverity = 'info' | 'attention' | 'urgent';

export interface HealthAlert {
  id: string;
  ruleId: string;
  title: string;
  summary: string;
  recordedDataText: string;
  relevantDates: string[];
  rationale: string;
  clinicalSource: string;
  recommendedNextStep: string;
  severity: AlertSeverity;
  dismissed: boolean;
  createdAt: number;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'Clinic' | 'Hospital' | 'Doctor' | 'Gynecology' | 'Women\'s Health';
  address: string;
  lat: number;
  lon: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  distanceKm?: number;
  specialtyConfirmed?: boolean;
}

export interface FacilityReview {
  facilityId: string;
  facilityName: string;
  rating: number; // 1-5
  notes: string;
  visitedDate?: string;
  updatedAt: number;
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'Disposable' | 'Reusable';
  description: string;
  howItWorks: string;
  wearTime: string;
  pros: string[];
  cons: string[];
  careAndDisposal: string;
  ecoImpact: 'Low' | 'Moderate' | 'High';
  tssRisk: 'Very Low' | 'Moderate (follow change times)' | 'None';
}

export interface ProductReview {
  productId: string;
  rating: number; // 1 - 5
  comfort: number; // 1 - 5
  leakProtection: number; // 1 - 5
  notes: string;
  personalVerdict: 'Regular choice' | 'Backup option' | 'Not for me' | 'Want to try';
  updatedAt: number;
}

export interface EducationArticle {
  id: string;
  title: string;
  category: 'Fundamentals' | 'Symptoms & Care' | 'Products & Hygiene' | 'Privacy & Science';
  readTime: string;
  summary: string;
  lastReviewed: string;
  contentMarkdown: string;
  sources: { title: string; url: string }[];
}

export interface UserPreferences {
  onboardingCompleted: boolean;
  defaultCycleLength: number; // default: 28
  defaultPeriodDuration: number; // default: 5
  lutealPhaseLength: number; // default: 14
  notificationsEnabled: boolean;
  periodReminderDaysBefore: number; // default: 2
  dailyLogReminderTime: string; // e.g. "20:00"
  pinEnabled: boolean;
  pinSalt?: string;
  pinHash?: string;
  lastActiveTimestamp?: number;
  theme?: 'rose-blush' | 'high-contrast';
  isDemoActive?: boolean;
}

export type AppSection = 
  | 'dashboard'
  | 'calendar'
  | 'daily-log'
  | 'insights'
  | 'alerts'
  | 'doctors'
  | 'products'
  | 'reports'
  | 'education'
  | 'settings';

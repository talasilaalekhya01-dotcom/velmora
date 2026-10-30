/**
 * Velmora Clinical Health Report Generator
 * Compiles objective, structured summaries for doctor visits and personal records.
 * Supports Print (PDF), Markdown download, HTML standalone export, and raw CSV.
 */

import { PeriodRecord, DailyLog, HealthAlert, CycleStats } from '../types/index.ts';
import { getDaysDifference, formatDate, parseDate } from './predictions.ts';

export interface ReportFilter {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  includeNotes: boolean;
  includeAlerts: boolean;
  includeMedications: boolean;
}

export interface CompiledReportData {
  filter: ReportFilter;
  generatedDate: string;
  totalDaysInRange: number;
  recordedPeriods: PeriodRecord[];
  recordedLogs: DailyLog[];
  completedCycles: { from: string; to: string; lengthDays: number }[];
  medianCycleLength: number;
  minCycleLength: number;
  maxCycleLength: number;
  typicalPeriodDuration: number;
  flowBreakdown: { none: number; light: number; medium: number; heavy: number };
  painStats: { average: number; max: number; daysSevere: number; totalPainDays: number };
  symptomFrequencies: { name: string; count: number }[];
  medicationsLogged: { date: string; medication: string }[];
  activeAlerts: HealthAlert[];
}

/**
 * Escape HTML to prevent XSS in rendered or exported reports
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function compileReportData(
  periods: PeriodRecord[],
  logs: DailyLog[],
  alerts: HealthAlert[],
  stats: CycleStats,
  filter: ReportFilter
): CompiledReportData {
  const generatedDate = formatDate(new Date());

  // Filter periods intersecting range
  const filteredPeriods = periods.filter(p => {
    const end = p.endDate || p.startDate;
    return p.startDate <= filter.endDate && end >= filter.startDate;
  }).sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Filter daily logs in range
  const filteredLogs = logs.filter(l => {
    return l.date >= filter.startDate && l.date <= filter.endDate;
  }).sort((a, b) => a.date.localeCompare(b.date));

  // Filter alerts intersecting range
  const filteredAlerts = filter.includeAlerts ? alerts.filter(a => {
    return a.relevantDates.some(d => d >= filter.startDate && d <= filter.endDate);
  }) : [];

  // Flow breakdown
  const flowBreakdown = { none: 0, light: 0, medium: 0, heavy: 0 };
  let painSum = 0;
  let painCount = 0;
  let painMax = 0;
  let daysSevere = 0;

  const symptomCounts: Record<string, number> = {};
  const medicationsLogged: { date: string; medication: string }[] = [];

  for (const log of filteredLogs) {
    if (log.flow && flowBreakdown[log.flow] !== undefined) {
      flowBreakdown[log.flow]++;
    }
    if (typeof log.pain === 'number') {
      painSum += log.pain;
      painCount++;
      if (log.pain > painMax) painMax = log.pain;
      if (log.pain >= 8) daysSevere++;
    }
    // Aggregate symptoms
    const allSymptoms = [...(log.symptoms || []), ...(log.customSymptoms || [])];
    for (const s of allSymptoms) {
      const clean = s.trim().toLowerCase();
      if (clean) {
        symptomCounts[clean] = (symptomCounts[clean] || 0) + 1;
      }
    }
    if (filter.includeMedications && log.medications && log.medications.trim()) {
      medicationsLogged.push({ date: log.date, medication: log.medications.trim() });
    }
  }

  const painStats = {
    average: painCount > 0 ? Math.round((painSum / painCount) * 10) / 10 : 0,
    max: painMax,
    daysSevere,
    totalPainDays: painCount
  };

  const symptomFrequencies = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const totalDaysInRange = getDaysDifference(filter.startDate, filter.endDate) + 1;

  return {
    filter,
    generatedDate,
    totalDaysInRange,
    recordedPeriods: filteredPeriods,
    recordedLogs: filteredLogs,
    completedCycles: stats.cycleIntervals.filter(c => c.from >= filter.startDate),
    medianCycleLength: stats.medianCycleLength,
    minCycleLength: stats.minCycleLength,
    maxCycleLength: stats.maxCycleLength,
    typicalPeriodDuration: stats.medianPeriodDuration,
    flowBreakdown,
    painStats,
    symptomFrequencies,
    medicationsLogged,
    activeAlerts: filteredAlerts
  };
}

/**
 * Generate Markdown Report Document
 */
export function generateMarkdownReport(data: CompiledReportData): string {
  let md = `# Velmora Menstrual Health Clinical Summary\n\n`;
  md += `**Report Period:** ${data.filter.startDate} to ${data.filter.endDate} (${data.totalDaysInRange} days)\n`;
  md += `**Generated Date:** ${data.generatedDate}\n`;
  md += `**Notice:** All data is recorded locally on the user's browser in Velmora. Estimates are identified separately from recorded observations.\n\n`;

  md += `## 1. Cycle & Bleeding Overview\n\n`;
  md += `- **Recorded Period Starts in Range:** ${data.recordedPeriods.length}\n`;
  md += `- **Median Cycle Length:** ${data.medianCycleLength} days (Range: ${data.minCycleLength} – ${data.maxCycleLength} days)\n`;
  md += `- **Typical Period Duration:** ${data.typicalPeriodDuration} days\n`;
  md += `- **Recorded Bleeding Days:** Heavy (${data.flowBreakdown.heavy}), Medium (${data.flowBreakdown.medium}), Light (${data.flowBreakdown.light}), None/Spotting (${data.flowBreakdown.none})\n\n`;

  md += `### Recorded Periods List\n\n`;
  if (data.recordedPeriods.length === 0) {
    md += `*No period bleeding records recorded within this date range.*\n\n`;
  } else {
    md += `| Start Date | End Date | Duration (Days) | Notes |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const p of data.recordedPeriods) {
      const dur = p.endDate ? getDaysDifference(p.startDate, p.endDate) + 1 : 'Ongoing / unrecorded end';
      md += `| ${p.startDate} | ${p.endDate || '—'} | ${dur} | ${p.notes ? p.notes.replace(/\|/g, '/') : '—'} |\n`;
    }
    md += `\n`;
  }

  md += `## 2. Pain & Symptom Analysis\n\n`;
  md += `- **Average Recorded Pain:** ${data.painStats.average} / 10\n`;
  md += `- **Peak Recorded Pain:** ${data.painStats.max} / 10\n`;
  md += `- **Severe Pain Days (Score ≥ 8):** ${data.painStats.daysSevere} days\n\n`;

  md += `### Most Frequently Reported Symptoms\n\n`;
  if (data.symptomFrequencies.length === 0) {
    md += `*No symptoms logged in daily entries for this timeframe.*\n\n`;
  } else {
    for (const s of data.symptomFrequencies.slice(0, 10)) {
      md += `- **${s.name.charAt(0).toUpperCase() + s.name.slice(1)}:** ${s.count} times\n`;
    }
    md += `\n`;
  }

  if (data.filter.includeMedications && data.medicationsLogged.length > 0) {
    md += `## 3. Recorded Medications & Relief Methods\n\n`;
    for (const m of data.medicationsLogged) {
      md += `- **${m.date}:** ${m.medication}\n`;
    }
    md += `\n`;
  }

  if (data.filter.includeAlerts && data.activeAlerts.length > 0) {
    md += `## 4. Informational Health Observations Recorded\n\n`;
    for (const a of data.activeAlerts) {
      md += `### ${a.title} (${a.severity.toUpperCase()})\n`;
      md += `- **Observation:** ${a.summary}\n`;
      md += `- **Recorded Dates:** ${a.relevantDates.join(', ')}\n`;
      md += `- **Clinical Context:** ${a.rationale}\n\n`;
    }
  }

  md += `\n---\n*Report compiled by Velmora (velmora.app) · Your cycle. Your clarity.*`;
  return md;
}

/**
 * Generate Standalone HTML Report Document
 */
export function generateHtmlReport(data: CompiledReportData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Velmora Clinical Report — ${escapeHtml(data.filter.startDate)} to ${escapeHtml(data.filter.endDate)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #392332; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #A4365A; border-bottom: 2px solid #F1D5D8; padding-bottom: 10px; margin-bottom: 5px; }
    .tagline { color: #725B69; font-size: 14px; margin-bottom: 30px; }
    .meta-box { background: #FFF0F5; border: 1px solid #F1D5D8; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #F1D5D8; padding: 10px; text-align: left; }
    th { background: #FFF0F5; color: #A4365A; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0; }
    .stat-card { border: 1px solid #F1D5D8; padding: 12px; border-radius: 8px; }
    .stat-label { font-size: 12px; color: #725B69; text-transform: uppercase; }
    .stat-val { font-size: 20px; font-weight: bold; color: #A4365A; }
    .alert-card { border-left: 4px solid #FB6F92; background: #FFF0F5; padding: 12px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>Velmora Menstrual Health Summary</h1>
  <div class="tagline">Your cycle. Your clarity. · Prepared for healthcare consultation</div>

  <div class="meta-box">
    <strong>Report Timeframe:</strong> ${escapeHtml(data.filter.startDate)} to ${escapeHtml(data.filter.endDate)} (${data.totalDaysInRange} calendar days)<br>
    <strong>Generated Date:</strong> ${escapeHtml(data.generatedDate)}<br>
    <em>Note: This summary reflects client-side local observations. It is not an automated medical diagnosis.</em>
  </div>

  <h2>1. Cycle & Bleeding Metrics</h2>
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-label">Median Cycle Length</div>
      <div class="stat-val">${data.medianCycleLength} days</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Cycle Range</div>
      <div class="stat-val">${data.minCycleLength}–${data.maxCycleLength} days</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Typical Bleeding</div>
      <div class="stat-val">${data.typicalPeriodDuration} days</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Peak Recorded Pain</div>
      <div class="stat-val">${data.painStats.max} / 10</div>
    </div>
  </div>

  <h3>Recorded Periods</h3>
  <table>
    <thead>
      <tr>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Duration</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${data.recordedPeriods.length === 0 ? '<tr><td colspan="4">No period entries recorded in this range.</td></tr>' : 
        data.recordedPeriods.map(p => {
          const dur = p.endDate ? getDaysDifference(p.startDate, p.endDate) + 1 + ' days' : 'Ongoing';
          return `<tr>
            <td>${escapeHtml(p.startDate)}</td>
            <td>${escapeHtml(p.endDate || '—')}</td>
            <td>${dur}</td>
            <td>${escapeHtml(p.notes || '—')}</td>
          </tr>`;
        }).join('')
      }
    </tbody>
  </table>

  <h2>2. Pain & Symptom Frequency</h2>
  <p><strong>Average Pain Score:</strong> ${data.painStats.average}/10 · <strong>Severe Pain Days (≥ 8/10):</strong> ${data.painStats.daysSevere}</p>
  <ul>
    ${data.symptomFrequencies.slice(0, 10).map(s => `<li><strong>${escapeHtml(s.name)}:</strong> ${s.count} logs</li>`).join('')}
  </ul>

  ${data.filter.includeMedications && data.medicationsLogged.length > 0 ? `
    <h2>3. Medications & Treatments Recorded</h2>
    <ul>
      ${data.medicationsLogged.map(m => `<li><strong>${escapeHtml(m.date)}:</strong> ${escapeHtml(m.medication)}</li>`).join('')}
    </ul>
  ` : ''}

  ${data.filter.includeAlerts && data.activeAlerts.length > 0 ? `
    <h2>4. Health Observations Recorded</h2>
    ${data.activeAlerts.map(a => `
      <div class="alert-card">
        <strong>${escapeHtml(a.title)}</strong><br>
        <span>${escapeHtml(a.summary)}</span><br>
        <small style="color: #725B69;">Clinical Context: ${escapeHtml(a.rationale)}</small>
      </div>
    `).join('')}
  ` : ''}

  <p style="margin-top: 40px; font-size: 12px; color: #725B69; border-top: 1px solid #F1D5D8; padding-top: 10px;">
    Velmora Privacy-First Health Records · www.velmora.app
  </p>
</body>
</html>`;
}

/**
 * Trigger file download helper in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

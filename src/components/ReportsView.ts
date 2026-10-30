/**
 * Velmora Health Reports View
 * Prepares professional, objective summaries for medical appointments.
 * Supports Print / PDF, Markdown download, HTML standalone export, and CSV.
 */

import { PeriodRecord, DailyLog, HealthAlert, CycleStats } from '../types/index.ts';
import { getIcon, getBrandSymbolSvg } from '../utils/icons.ts';
import {
  ReportFilter,
  compileReportData,
  generateMarkdownReport,
  generateHtmlReport,
  downloadFile,
  escapeHtml
} from '../services/reports.ts';
import { formatDate, addDays, getDaysDifference } from '../services/predictions.ts';

interface ReportsProps {
  periods: PeriodRecord[];
  dailyLogs: DailyLog[];
  alerts: HealthAlert[];
  stats: CycleStats;
}

export function renderReportsView(props: ReportsProps): string {
  const { periods, dailyLogs, alerts, stats } = props;
  const todayStr = formatDate(new Date());
  const defaultStart = addDays(todayStr, -90); // 3 months default

  const initialFilter: ReportFilter = {
    startDate: defaultStart,
    endDate: todayStr,
    includeNotes: true,
    includeAlerts: true,
    includeMedications: true
  };

  const compiled = compileReportData(periods, dailyLogs, alerts, stats, initialFilter);

  return `
    <div class="space-y-6 max-w-4xl mx-auto">
      
      <!-- Top Title & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8] no-print">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Health Reports for Healthcare Visits</h1>
          <p class="text-sm text-[#725B69] mt-1">Export structured, objective summaries to share with your OB/GYN or doctor.</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button id="report-print-btn" class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-[#FFFFFF] hover:bg-[#FFF0F5] border border-[#F1D5D8] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs">
            ${getIcon('printer', 'w-3.5 h-3.5 text-[#A4365A]')}
            <span>Print / Save as PDF</span>
          </button>
          <button id="report-md-btn" class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-[#FFFFFF] hover:bg-[#FFF0F5] border border-[#F1D5D8] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs">
            ${getIcon('download', 'w-3.5 h-3.5 text-[#A4365A]')}
            <span>Download .MD</span>
          </button>
          <button id="report-html-btn" class="px-3.5 py-2 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs">
            ${getIcon('file-text', 'w-3.5 h-3.5')}
            <span>Download .HTML</span>
          </button>
        </div>
      </div>

      <!-- Filters & Customizer Bar -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-4 shadow-xs space-y-4 no-print">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <!-- Date Presets -->
          <div class="flex items-center gap-2 overflow-x-auto text-xs" id="range-presets">
            <button data-days="30" class="px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5] hover:bg-[#F8C8DC] text-[#392332] font-medium">Last 30 Days</button>
            <button data-days="90" class="px-3 py-1.5 rounded-lg bg-[#A4365A] text-white font-semibold">Last 3 Months</button>
            <button data-days="180" class="px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5] hover:bg-[#F8C8DC] text-[#392332] font-medium">Last 6 Months</button>
            <button data-days="365" class="px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5] hover:bg-[#F8C8DC] text-[#392332] font-medium">1 Year</button>
          </div>

          <!-- Date Range Pickers -->
          <div class="flex items-center gap-2 text-xs">
            <input type="date" id="rep-start-date" value="${initialFilter.startDate}" class="p-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30">
            <span class="text-[#725B69]">to</span>
            <input type="date" id="rep-end-date" value="${initialFilter.endDate}" class="p-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30">
          </div>

        </div>

        <!-- Inclusions Checkboxes -->
        <div class="flex items-center gap-6 text-xs text-[#725B69] pt-2 border-t border-[#F1D5D8]">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="rep-inc-notes" checked class="accent-[#A4365A]">
            <span>Include Personal Notes</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="rep-inc-meds" checked class="accent-[#A4365A]">
            <span>Include Medications & Treatments</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="rep-inc-alerts" checked class="accent-[#A4365A]">
            <span>Include Health Alerts</span>
          </label>
        </div>
      </div>

      <!-- Report Live Preview Document (Styled for screen and @media print) -->
      <div id="report-preview-container" class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-8 shadow-xs space-y-6 report-container">
        ${renderReportContent(compiled)}
      </div>

    </div>
  `;
}

function renderReportContent(data: any): string {
  return `
    <!-- Report Document Header -->
    <div class="border-b-2 border-[#F1D5D8] pb-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 text-[#A4365A] mb-1">
            ${getBrandSymbolSvg('w-6 h-6')}
            <span class="font-display text-xl font-bold text-[#392332]">Velmora Clinical Summary</span>
          </div>
          <span class="text-xs text-[#725B69]">Your cycle. Your clarity. · Prepared for healthcare consultation</span>
        </div>
        <div class="text-right text-xs text-[#725B69]">
          <div>Generated: <strong>${data.generatedDate}</strong></div>
          <div>Timeframe: <strong>${data.filter.startDate} to ${data.filter.endDate}</strong></div>
        </div>
      </div>
    </div>

    <!-- Section 1: Cycle & Bleeding Metrics -->
    <div class="space-y-3">
      <h2 class="font-display text-base font-bold text-[#392332] uppercase tracking-wider text-xs border-b border-[#F1D5D8] pb-1">
        1. Cycle Rhythm & Bleeding Observations
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-3 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/40">
          <span class="text-[#725B69] block text-[11px] uppercase">Median Cycle</span>
          <div class="text-lg font-extrabold text-[#A4365A] mt-0.5">${data.medianCycleLength} days</div>
          <span class="text-[10px] text-[#725B69]">Range: ${data.minCycleLength}–${data.maxCycleLength}d</span>
        </div>

        <div class="p-3 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/40">
          <span class="text-[#725B69] block text-[11px] uppercase">Recorded Bleeding</span>
          <div class="text-lg font-extrabold text-[#392332] mt-0.5">${data.typicalPeriodDuration} days</div>
          <span class="text-[10px] text-[#725B69]">Typical duration</span>
        </div>

        <div class="p-3 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/40">
          <span class="text-[#725B69] block text-[11px] uppercase">Heavy Flow Days</span>
          <div class="text-lg font-extrabold text-[#392332] mt-0.5">${data.flowBreakdown.heavy} days</div>
          <span class="text-[10px] text-[#725B69]">Medium: ${data.flowBreakdown.medium} · Light: ${data.flowBreakdown.light}</span>
        </div>

        <div class="p-3 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/40">
          <span class="text-[#725B69] block text-[11px] uppercase">Peak Pain Logged</span>
          <div class="text-lg font-extrabold text-[#392332] mt-0.5">${data.painStats.max} / 10</div>
          <span class="text-[10px] text-[#725B69]">Avg: ${data.painStats.average}/10</span>
        </div>
      </div>

      <!-- Periods Table -->
      <div class="overflow-x-auto pt-2">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-[#FFF0F5] text-[#392332] border-b border-[#F1D5D8]">
              <th class="p-2.5 font-bold">Start Date</th>
              <th class="p-2.5 font-bold">End Date</th>
              <th class="p-2.5 font-bold">Duration</th>
              <th class="p-2.5 font-bold">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${data.recordedPeriods.length === 0 ? `
              <tr><td colspan="4" class="p-4 text-center text-[#725B69]">No period start dates recorded in this range.</td></tr>
            ` : data.recordedPeriods.map((p: any) => {
              const dur = p.endDate ? getDaysDifference(p.startDate, p.endDate) + 1 + ' days' : 'Ongoing / unrecorded';
              return `
                <tr class="border-b border-[#F1D5D8] hover:bg-[#FFF8FA]">
                  <td class="p-2.5 font-semibold text-[#392332]">${p.startDate}</td>
                  <td class="p-2.5 text-[#725B69]">${p.endDate || '—'}</td>
                  <td class="p-2.5 font-medium text-[#392332]">${dur}</td>
                  <td class="p-2.5 text-[#725B69] italic">${p.notes ? escapeHtml(p.notes) : '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 2: Pain & Physical Symptoms -->
    <div class="space-y-3 pt-3">
      <h2 class="font-display text-base font-bold text-[#392332] uppercase tracking-wider text-xs border-b border-[#F1D5D8] pb-1">
        2. Pain Severity & Top Symptoms
      </h2>
      <div class="text-xs text-[#392332] space-y-2">
        <div class="flex items-center gap-4">
          <span>Average Pain Score: <strong>${data.painStats.average}/10</strong></span>
          <span>Days with Severe Pain (≥ 8/10): <strong>${data.painStats.daysSevere} days</strong></span>
        </div>
        ${data.symptomFrequencies.length === 0 ? `
          <p class="text-[#725B69] italic">No symptoms logged in daily entries for this timeframe.</p>
        ` : `
          <div class="flex flex-wrap gap-2 pt-1">
            ${data.symptomFrequencies.slice(0, 8).map((s: any) => `
              <span class="px-2.5 py-1 rounded-lg bg-[#FFF0F5] border border-[#F1D5D8] text-[11px] font-semibold text-[#392332] capitalize">
                ${escapeHtml(s.name)}: ${s.count} logs
              </span>
            `).join('')}
          </div>
        `}
      </div>
    </div>

    <!-- Section 3: Medications & Treatments Logged -->
    ${data.filter.includeMedications && data.medicationsLogged.length > 0 ? `
      <div class="space-y-2 pt-3">
        <h2 class="font-display text-base font-bold text-[#392332] uppercase tracking-wider text-xs border-b border-[#F1D5D8] pb-1">
          3. Medications & Relief Interventions
        </h2>
        <ul class="text-xs text-[#392332] space-y-1 pl-4 list-disc marker:text-[#A4365A]">
          ${data.medicationsLogged.map((m: any) => `
            <li><strong>${m.date}:</strong> ${escapeHtml(m.medication)}</li>
          `).join('')}
        </ul>
      </div>
    ` : ''}

    <!-- Section 4: Informational Health Alerts -->
    ${data.filter.includeAlerts && data.activeAlerts.length > 0 ? `
      <div class="space-y-2 pt-3">
        <h2 class="font-display text-base font-bold text-[#392332] uppercase tracking-wider text-xs border-b border-[#F1D5D8] pb-1">
          4. Informational Health Observations Recorded
        </h2>
        <div class="space-y-2 text-xs">
          ${data.activeAlerts.map((a: any) => `
            <div class="p-2.5 rounded-lg bg-[#FFF0F5] border border-[#F1D5D8]">
              <strong>${escapeHtml(a.title)}:</strong> ${escapeHtml(a.summary)}<br>
              <span class="text-[11px] text-[#725B69]">Clinical Context: ${escapeHtml(a.rationale)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div class="pt-6 border-t border-[#F1D5D8] text-[11px] text-[#725B69] flex justify-between">
      <span>Velmora Local-First Menstrual Health · www.velmora.app</span>
      <span>Client-side observational records</span>
    </div>
  `;
}

export function bindReportsEvents(container: HTMLElement, props: ReportsProps) {
  const { periods, dailyLogs, alerts, stats } = props;

  const startInput = container.querySelector('#rep-start-date') as HTMLInputElement;
  const endInput = container.querySelector('#rep-end-date') as HTMLInputElement;
  const notesCheck = container.querySelector('#rep-inc-notes') as HTMLInputElement;
  const medsCheck = container.querySelector('#rep-inc-meds') as HTMLInputElement;
  const alertsCheck = container.querySelector('#rep-inc-alerts') as HTMLInputElement;
  const previewContainer = container.querySelector('#report-preview-container') as HTMLElement;

  const getFilter = (): ReportFilter => ({
    startDate: startInput?.value || addDays(formatDate(new Date()), -90),
    endDate: endInput?.value || formatDate(new Date()),
    includeNotes: notesCheck?.checked ?? true,
    includeMedications: medsCheck?.checked ?? true,
    includeAlerts: alertsCheck?.checked ?? true
  });

  const updatePreview = () => {
    const f = getFilter();
    const compiled = compileReportData(periods, dailyLogs, alerts, stats, f);
    if (previewContainer) {
      previewContainer.innerHTML = renderReportContent(compiled);
    }
  };

  startInput?.addEventListener('change', updatePreview);
  endInput?.addEventListener('change', updatePreview);
  notesCheck?.addEventListener('change', updatePreview);
  medsCheck?.addEventListener('change', updatePreview);
  alertsCheck?.addEventListener('change', updatePreview);

  // Preset buttons
  container.querySelectorAll<HTMLButtonElement>('#range-presets button').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll<HTMLButtonElement>('#range-presets button').forEach(b => {
        b.className = 'px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5] hover:bg-[#F8C8DC] text-[#392332] font-medium';
      });
      btn.className = 'px-3 py-1.5 rounded-lg bg-[#A4365A] text-white font-semibold';
      const days = parseInt(btn.getAttribute('data-days') || '90');
      const today = formatDate(new Date());
      if (startInput) startInput.value = addDays(today, -days);
      if (endInput) endInput.value = today;
      updatePreview();
    });
  });

  // Print button
  container.querySelector('#report-print-btn')?.addEventListener('click', () => {
    window.print();
  });

  // Markdown download
  container.querySelector('#report-md-btn')?.addEventListener('click', () => {
    const f = getFilter();
    const compiled = compileReportData(periods, dailyLogs, alerts, stats, f);
    const md = generateMarkdownReport(compiled);
    downloadFile(md, `velmora-report-${f.startDate}-to-${f.endDate}.md`, 'text/markdown');
  });

  // HTML download
  container.querySelector('#report-html-btn')?.addEventListener('click', () => {
    const f = getFilter();
    const compiled = compileReportData(periods, dailyLogs, alerts, stats, f);
    const html = generateHtmlReport(compiled);
    downloadFile(html, `velmora-report-${f.startDate}-to-${f.endDate}.html`, 'text/html');
  });
}

/**
 * Velmora Dashboard View
 * Clear overview of recorded cycle facts, current cycle day,
 * next estimated period, today's log, and active alerts.
 */

import { PeriodRecord, DailyLog, HealthAlert, CycleStats, AppSection } from '../types/index.ts';
import { getIcon } from '../utils/icons.ts';
import { formatDate, getDaysDifference } from '../services/predictions.ts';

interface DashboardProps {
  stats: CycleStats;
  periods: PeriodRecord[];
  todayLog: DailyLog | null;
  activeAlerts: HealthAlert[];
  isDemoActive: boolean;
  onNavigate: (section: AppSection) => void;
  onStartPeriodToday: () => void;
  onOpenDailyLog: (date: string) => void;
  onDismissAlert: (id: string) => void;
}

export function renderDashboardView(props: DashboardProps): string {
  const { stats, periods, todayLog, activeAlerts, isDemoActive } = props;
  const todayStr = formatDate(new Date());

  const hasPeriods = periods.length > 0;
  const lastPeriod = periods[0]; // periods are sorted descending

  // Days until estimated next period
  let daysUntilNext: number | null = null;
  if (stats.estimatedNextPeriodStart) {
    daysUntilNext = getDaysDifference(todayStr, stats.estimatedNextPeriodStart);
  }

  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Understand your cycle. Feel more informed.</h1>
          <p class="text-sm text-[#725B69] mt-1">Velmora · Your cycle. Your clarity.</p>
        </div>
        ${isDemoActive ? `
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8C8DC] text-[#A4365A] text-xs font-semibold self-start sm:self-center border border-[#F1D5D8]">
            <span class="w-2 h-2 rounded-full bg-[#A4365A]"></span>
            <span>Demo Mode Active (Sample Records)</span>
          </div>
        ` : ''}
      </div>

      <!-- Active Alerts Banner (if any) -->
      ${activeAlerts.length > 0 ? `
        <div class="rounded-2xl border border-[#FB6F92] bg-[#FFFFFF] p-4 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm font-bold text-[#A4365A]">
              ${getIcon('alert-circle', 'w-4 h-4 text-[#FB6F92]')}
              <span>${activeAlerts.length} Informational Health Alert${activeAlerts.length > 1 ? 's' : ''}</span>
            </div>
            <button data-dash-nav="alerts" class="text-xs font-semibold text-[#A4365A] hover:underline">
              View All Alerts &rarr;
            </button>
          </div>
          <div class="space-y-2">
            ${activeAlerts.slice(0, 2).map(alert => `
              <div class="p-3 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] flex items-start justify-between gap-3 text-xs">
                <div>
                  <div class="font-semibold text-[#392332]">${alert.title}</div>
                  <div class="text-[#725B69] mt-0.5">${alert.summary}</div>
                </div>
                <button data-dismiss-alert="${alert.id}" class="text-[#725B69] hover:text-[#392332] p-1 text-[11px] underline shrink-0">
                  Dismiss
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Main Cycle Status Hero Card -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-6 shadow-xs">
        ${!hasPeriods ? `
          <!-- Empty State -->
          <div class="text-center py-8 max-w-md mx-auto space-y-4">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-[#FFF0F5] border border-[#F1D5D8] flex items-center justify-center text-[#A4365A]">
              ${getIcon('calendar', 'w-7 h-7')}
            </div>
            <div>
              <h2 class="font-display text-xl font-bold text-[#392332]">No Recorded Periods Yet</h2>
              <p class="text-sm text-[#725B69] mt-1.5 leading-relaxed">
                Log the first day of your last period or start today to begin calculating your personal cycle timeline and insights.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button id="dash-start-today-btn" class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] transition-colors shadow-xs">
                Record Period Start Today
              </button>
              <button data-dash-nav="calendar" class="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-[#392332] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] transition-colors">
                Open Calendar
              </button>
            </div>
          </div>
        ` : `
          <!-- Active Cycle Information -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <!-- Cycle Day Visual Dial -->
            <div class="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
              <div class="relative w-36 h-36 rounded-full border-4 border-[#F8C8DC] flex flex-col items-center justify-center bg-white shadow-xs">
                <span class="text-xs uppercase font-bold text-[#725B69] tracking-wider">Cycle Day</span>
                <span class="font-display text-4xl font-extrabold text-[#A4365A] my-0.5">
                  ${stats.currentCycleDay || 1}
                </span>
                <span class="text-[11px] text-[#725B69]">
                  of ~${stats.medianCycleLength} days
                </span>
              </div>
              <div class="mt-3">
                <span class="text-xs font-semibold text-[#392332] block">
                  Estimated Phase: ${stats.currentPhase || 'Follicular'}
                </span>
                <span class="text-[10px] text-[#725B69] block">
                  Approximation based on past median. Not medical confirmation.
                </span>
              </div>
            </div>

            <!-- Cycle Metrics Breakdown -->
            <div class="md:col-span-2 space-y-4">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                <div class="p-3.5 rounded-xl bg-[#FFF0F5]/30 border border-[#F1D5D8]">
                  <div class="text-[11px] uppercase font-semibold text-[#725B69]">Last Period Start</div>
                  <div class="text-sm font-bold text-[#392332] mt-1">${lastPeriod.startDate}</div>
                  <div class="text-[11px] text-[#725B69] mt-0.5">${stats.daysSinceLastStart || 0} days ago</div>
                </div>

                <div class="p-3.5 rounded-xl bg-[#FFF0F5]/30 border border-[#F1D5D8]">
                  <div class="text-[11px] uppercase font-semibold text-[#725B69]">Next Period (Estimate)</div>
                  <div class="text-sm font-bold text-[#A4365A] mt-1">
                    ${stats.estimatedNextPeriodStart || '—'}
                  </div>
                  <div class="text-[11px] text-[#725B69] mt-0.5">
                    ${daysUntilNext !== null
                      ? daysUntilNext > 0
                        ? `in ~${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''}`
                        : daysUntilNext === 0
                        ? 'Expected today'
                        : `${Math.abs(daysUntilNext)} day${Math.abs(daysUntilNext) !== 1 ? 's' : ''} past estimate`
                      : 'More history needed'}
                  </div>
                </div>

                <div class="p-3.5 rounded-xl bg-[#FFF0F5]/30 border border-[#F1D5D8] col-span-2 sm:col-span-1">
                  <div class="text-[11px] uppercase font-semibold text-[#725B69]">Typical Cycle Length</div>
                  <div class="text-sm font-bold text-[#392332] mt-1">${stats.medianCycleLength} days</div>
                  <div class="text-[11px] text-[#725B69] mt-0.5">
                    ${stats.isPreliminary ? 'Preliminary estimate' : `Based on ${stats.totalRecordedCycles} cycles`}
                  </div>
                </div>

              </div>

              <!-- Quick Action Strip -->
              <div class="flex flex-wrap items-center gap-2 pt-2">
                <button id="dash-log-today-btn" class="px-4 py-2 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
                  ${getIcon('plus', 'w-3.5 h-3.5')}
                  <span>Log Symptoms Today</span>
                </button>
                <button id="dash-start-period-btn" class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-lg transition-colors flex items-center gap-1.5">
                  ${getIcon('droplet', 'w-3.5 h-3.5 text-[#FB6F92]')}
                  <span>Start New Period</span>
                </button>
                <button data-dash-nav="calendar" class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-lg transition-colors flex items-center gap-1.5">
                  ${getIcon('calendar', 'w-3.5 h-3.5 text-[#A4365A]')}
                  <span>Calendar</span>
                </button>
                <button data-dash-nav="insights" class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-lg transition-colors flex items-center gap-1.5">
                  ${getIcon('activity', 'w-3.5 h-3.5 text-[#A4365A]')}
                  <span>Insights</span>
                </button>
                <button data-dash-nav="doctors" class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-lg transition-colors flex items-center gap-1.5">
                  ${getIcon('map-pin', 'w-3.5 h-3.5 text-[#A4365A]')}
                  <span>Find Care</span>
                </button>
              </div>
            </div>

          </div>
        `}
      </div>

      <!-- Today's Daily Log & Recent History Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Today's Log Card -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-[#F1D5D8]">
              <div class="flex items-center gap-2">
                <span class="text-[#A4365A]">${getIcon('droplet', 'w-4 h-4')}</span>
                <h3 class="font-display text-base font-bold text-[#392332]">Today's Health Log</h3>
              </div>
              <span class="text-xs text-[#725B69] font-medium">${todayStr}</span>
            </div>

            <div class="py-4 space-y-3">
              ${todayLog ? `
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="p-2.5 rounded-lg bg-[#FFF0F5]/50 border border-[#F1D5D8]">
                    <span class="text-[#725B69] block text-[11px]">Flow Level</span>
                    <span class="font-bold text-[#392332] capitalize mt-0.5 block">${todayLog.flow || 'None recorded'}</span>
                  </div>
                  <div class="p-2.5 rounded-lg bg-[#FFF0F5]/50 border border-[#F1D5D8]">
                    <span class="text-[#725B69] block text-[11px]">Pain Level</span>
                    <span class="font-bold text-[#392332] mt-0.5 block">
                      ${typeof todayLog.pain === 'number' ? `${todayLog.pain} / 10` : 'None logged'}
                    </span>
                  </div>
                </div>

                ${(todayLog.symptoms && todayLog.symptoms.length > 0) || (todayLog.customSymptoms && todayLog.customSymptoms.length > 0) ? `
                  <div>
                    <span class="text-xs font-semibold text-[#725B69] block mb-1">Symptoms:</span>
                    <div class="flex flex-wrap gap-1.5">
                      ${[...(todayLog.symptoms || []), ...(todayLog.customSymptoms || [])].map(s => `
                        <span class="text-xs px-2 py-0.5 rounded-md bg-[#FFF0F5] border border-[#F1D5D8] text-[#392332] capitalize">
                          ${s}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                ` : `
                  <div class="text-xs text-[#725B69]">No physical symptoms logged today.</div>
                `}

                ${todayLog.mood ? `
                  <div class="text-xs text-[#392332]">
                    <span class="text-[#725B69]">Mood:</span> <strong class="capitalize">${todayLog.mood}</strong>
                  </div>
                ` : ''}

                ${todayLog.notes ? `
                  <div class="text-xs p-2.5 rounded-lg bg-[#FFF8FA] border border-[#F1D5D8] text-[#392332] italic">
                    "${todayLog.notes}"
                  </div>
                ` : ''}
              ` : `
                <div class="py-6 text-center text-xs text-[#725B69] space-y-2">
                  <p>You haven't recorded symptoms or flow for today yet.</p>
                </div>
              `}
            </div>
          </div>

          <div class="pt-3 border-t border-[#F1D5D8]">
            <button
              id="dash-edit-today-log-btn"
              class="w-full py-2 px-3 text-xs font-semibold text-[#A4365A] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-xl transition-colors text-center"
            >
              ${todayLog ? 'Edit Today’s Log' : 'Log Today’s Symptoms & Flow'}
            </button>
          </div>
        </div>

        <!-- Recent Cycle History Card -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-[#F1D5D8]">
              <div class="flex items-center gap-2">
                <span class="text-[#A4365A]">${getIcon('calendar', 'w-4 h-4')}</span>
                <h3 class="font-display text-base font-bold text-[#392332]">Recent Recorded Periods</h3>
              </div>
              <button data-dash-nav="calendar" class="text-xs font-semibold text-[#A4365A] hover:underline">
                View All
              </button>
            </div>

            <div class="py-3 space-y-2.5">
              ${periods.length === 0 ? `
                <div class="py-6 text-center text-xs text-[#725B69]">
                  No recorded periods yet.
                </div>
              ` : periods.slice(0, 4).map((p, idx) => {
                const dur = p.endDate ? getDaysDifference(p.startDate, p.endDate) + 1 : null;
                return `
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF0F5]/40 border border-[#F1D5D8] text-xs">
                    <div>
                      <div class="font-semibold text-[#392332]">
                        ${p.startDate} ${p.endDate ? `to ${p.endDate}` : '(ongoing)'}
                      </div>
                      <div class="text-[11px] text-[#725B69]">
                        ${dur ? `${dur} days bleeding` : 'Start recorded'}
                        ${idx === 0 ? '· Most recent' : ''}
                      </div>
                    </div>
                    <span class="text-[11px] font-medium text-[#A4365A]">
                      ${idx === 0 ? 'Current Cycle' : `Cycle #${periods.length - idx}`}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="pt-3 border-t border-[#F1D5D8]">
            <button
              data-dash-nav="reports"
              class="w-full py-2 px-3 text-xs font-semibold text-[#392332] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-xl transition-colors text-center"
            >
              Export Report for Healthcare Visit
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function bindDashboardEvents(container: HTMLElement, props: DashboardProps) {
  // Navigation buttons
  container.querySelectorAll<HTMLButtonElement>('button[data-dash-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-dash-nav') as AppSection;
      if (section) props.onNavigate(section);
    });
  });

  // Start period today
  const startTodayBtn = container.querySelector('#dash-start-today-btn');
  if (startTodayBtn) startTodayBtn.addEventListener('click', props.onStartPeriodToday);

  const startPeriodBtn = container.querySelector('#dash-start-period-btn');
  if (startPeriodBtn) startPeriodBtn.addEventListener('click', props.onStartPeriodToday);

  // Today log button
  const logTodayBtn = container.querySelector('#dash-log-today-btn');
  if (logTodayBtn) {
    logTodayBtn.addEventListener('click', () => props.onOpenDailyLog(formatDate(new Date())));
  }

  const editTodayBtn = container.querySelector('#dash-edit-today-log-btn');
  if (editTodayBtn) {
    editTodayBtn.addEventListener('click', () => props.onOpenDailyLog(formatDate(new Date())));
  }

  // Dismiss alerts
  container.querySelectorAll<HTMLButtonElement>('button[data-dismiss-alert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-dismiss-alert');
      if (id) props.onDismissAlert(id);
    });
  });
}

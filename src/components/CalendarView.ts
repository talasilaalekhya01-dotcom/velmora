/**
 * Velmora Period Calendar Component
 * Month navigation, accessible date cells, distinct visual indicators,
 * date validation, period CRUD, and daily log integration.
 */

import { PeriodRecord, DailyLog, CycleStats } from '../types/index.ts';
import { getIcon } from '../utils/icons.ts';
import {
  formatDate,
  parseDate,
  isDateInPeriod,
  isDateInEstimatedNextPeriod,
  getDaysDifference
} from '../services/predictions.ts';

interface CalendarProps {
  periods: PeriodRecord[];
  dailyLogs: DailyLog[];
  stats: CycleStats;
  selectedDate: string; // YYYY-MM-DD
  viewYear: number;
  viewMonth: number; // 0-indexed (0 = Jan, 11 = Dec)
  onSelectDate: (date: string) => void;
  onChangeMonth: (year: number, month: number) => void;
  onSavePeriod: (period: PeriodRecord) => Promise<void>;
  onDeletePeriod: (id: string) => Promise<void>;
  onOpenDailyLog: (date: string) => void;
}

export function renderCalendarView(props: CalendarProps): string {
  const { periods, dailyLogs, stats, selectedDate, viewYear, viewMonth } = props;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayStr = formatDate(new Date());

  // First day of current view month and number of days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Create set of dates with logs for quick check
  const loggedDatesMap = new Map<string, DailyLog>();
  for (const log of dailyLogs) {
    loggedDatesMap.set(log.date, log);
  }

  // Find period that contains selectedDate (if any)
  const selectedPeriodInfo = isDateInPeriod(selectedDate, periods);
  const selectedDateLog = loggedDatesMap.get(selectedDate);

  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Period Calendar</h1>
          <p class="text-sm text-[#725B69] mt-1">Record cycle bleeding dates and view projected estimates.</p>
        </div>

        <div class="flex items-center gap-2">
          <button id="cal-today-btn" class="px-3 py-1.5 text-xs font-semibold text-[#A4365A] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-lg transition-colors">
            Today
          </button>
          <div class="flex items-center border border-[#F1D5D8] rounded-lg bg-[#FFFFFF] overflow-hidden">
            <button id="cal-prev-month-btn" class="p-2 text-[#725B69] hover:text-[#392332] hover:bg-[#FFF0F5] transition-colors" aria-label="Previous Month">
              ${getIcon('chevron-left', 'w-4 h-4')}
            </button>
            <span class="px-3 text-sm font-bold text-[#392332] whitespace-nowrap min-w-[130px] text-center">
              ${monthNames[viewMonth]} ${viewYear}
            </span>
            <button id="cal-next-month-btn" class="p-2 text-[#725B69] hover:text-[#392332] hover:bg-[#FFF0F5] transition-colors" aria-label="Next Month">
              ${getIcon('chevron-right', 'w-4 h-4')}
            </button>
          </div>
        </div>
      </div>

      <!-- Legend Ribbon -->
      <div class="flex flex-wrap items-center gap-4 text-xs text-[#725B69] bg-[#FFFFFF] p-3 rounded-xl border border-[#F1D5D8]">
        <div class="flex items-center gap-2">
          <span class="w-3.5 h-3.5 rounded-full bg-[#A4365A] flex items-center justify-center text-white text-[9px]">●</span>
          <span>Recorded Period</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3.5 h-3.5 rounded-full border-2 border-dashed border-[#FB6F92] bg-[#FFF0F5]"></span>
          <span>Estimated Period</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3.5 h-3.5 rounded-md border-2 border-[#A4365A] bg-transparent"></span>
          <span>Selected Date</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#FB6F92]"></span>
          <span>Symptom Logged</span>
        </div>
      </div>

      <!-- Calendar & Day Detail Grid Split -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <!-- Calendar Grid (2 Cols) -->
        <div class="lg:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-4 sm:p-6 shadow-xs">
          
          <!-- Day of Week Headers -->
          <div class="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#725B69] uppercase pb-2 mb-2 border-b border-[#F1D5D8]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <!-- Calendar Days Grid -->
          <div class="grid grid-cols-7 gap-1 sm:gap-2">
            ${generateCalendarCells(viewYear, viewMonth, firstDayOfMonth, daysInMonth, daysInPrevMonth, periods, stats, loggedDatesMap, selectedDate, todayStr)}
          </div>
        </div>

        <!-- Selected Date Inspector & Action Panel (1 Col) -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs space-y-5">
          
          <div class="border-b border-[#F1D5D8] pb-3">
            <span class="text-xs font-semibold text-[#725B69] uppercase">Selected Date</span>
            <div class="font-display text-xl font-bold text-[#392332] mt-0.5">
              ${selectedDate} ${selectedDate === todayStr ? '<span class="text-xs font-normal text-[#A4365A] ml-1">(Today)</span>' : ''}
            </div>
          </div>

          <!-- Period Status on Selected Date -->
          <div class="space-y-3">
            <label class="block text-xs font-semibold uppercase text-[#725B69]">Menstrual Bleeding</label>
            
            ${selectedPeriodInfo.inPeriod && selectedPeriodInfo.period ? `
              <div class="p-3.5 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs font-bold text-[#A4365A]">
                    ${getIcon('droplet', 'w-4 h-4 text-[#A4365A]')}
                    <span>Recorded Period Day</span>
                  </div>
                  <button id="cal-del-period-btn" data-period-id="${selectedPeriodInfo.period.id}" class="text-[11px] text-[#FB6F92] hover:text-[#A4365A] font-semibold underline">
                    Delete Record
                  </button>
                </div>
                <div class="text-xs text-[#392332]">
                  Period began on <strong>${selectedPeriodInfo.period.startDate}</strong>
                  ${selectedPeriodInfo.period.endDate ? ` and ended on <strong>${selectedPeriodInfo.period.endDate}</strong>` : ' (Ongoing)'}.
                </div>
                
                ${!selectedPeriodInfo.period.endDate ? `
                  <button id="cal-end-period-btn" class="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] transition-colors">
                    Mark End of Period on This Date
                  </button>
                ` : ''}
              </div>
            ` : `
              <div class="space-y-2">
                <button id="cal-record-start-btn" class="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] transition-colors flex items-center justify-center gap-1.5">
                  ${getIcon('plus', 'w-3.5 h-3.5')}
                  <span>Record Period Start Here</span>
                </button>
                
                <!-- Range Logger Accordion / Trigger -->
                <button id="cal-toggle-range-btn" class="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#725B69] hover:text-[#392332] bg-[#FFF0F5] border border-[#F1D5D8] transition-colors text-center">
                  Record Multi-Day Period Range
                </button>

                <div id="cal-range-form" class="hidden p-3 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] space-y-2 text-xs">
                  <div>
                    <label class="block text-[11px] font-semibold text-[#725B69]">Start Date</label>
                    <input type="date" id="range-start-input" value="${selectedDate}" class="w-full p-2 rounded-lg border border-[#F1D5D8] bg-white text-xs">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-[#725B69]">End Date (Optional)</label>
                    <input type="date" id="range-end-input" class="w-full p-2 rounded-lg border border-[#F1D5D8] bg-white text-xs">
                  </div>
                  <button id="save-range-btn" class="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49]">
                    Save Period Range
                  </button>
                </div>
              </div>
            `}
          </div>

          <!-- Daily Health Log on Selected Date -->
          <div class="space-y-3 pt-3 border-t border-[#F1D5D8]">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold uppercase text-[#725B69]">Daily Symptoms Log</label>
              <button id="cal-open-log-btn" class="text-xs font-semibold text-[#A4365A] hover:underline">
                ${selectedDateLog ? 'Edit Log' : '+ Add Log'}
              </button>
            </div>

            ${selectedDateLog ? `
              <div class="p-3 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8] text-xs space-y-2">
                <div class="flex justify-between">
                  <span class="text-[#725B69]">Flow:</span>
                  <span class="font-bold text-[#392332] capitalize">${selectedDateLog.flow || 'None'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#725B69]">Pain:</span>
                  <span class="font-bold text-[#392332]">${typeof selectedDateLog.pain === 'number' ? `${selectedDateLog.pain}/10` : 'None'}</span>
                </div>
                ${selectedDateLog.symptoms && selectedDateLog.symptoms.length > 0 ? `
                  <div class="pt-1">
                    <span class="text-[#725B69] block mb-1">Symptoms:</span>
                    <div class="flex flex-wrap gap-1">
                      ${selectedDateLog.symptoms.map(s => `
                        <span class="px-1.5 py-0.5 rounded bg-white border border-[#F1D5D8] text-[11px] capitalize">${s}</span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : `
              <div class="p-3 rounded-xl bg-[#FFF0F5]/30 border border-[#F1D5D8] text-center text-xs text-[#725B69]">
                No daily health log recorded for this date.
              </div>
            `}
          </div>

        </div>

      </div>

    </div>
  `;
}

function generateCalendarCells(
  year: number,
  month: number,
  firstDay: number,
  daysInMonth: number,
  daysInPrevMonth: number,
  periods: PeriodRecord[],
  stats: CycleStats,
  logsMap: Map<string, DailyLog>,
  selectedDate: string,
  todayStr: string
): string {
  let html = '';

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    html += `
      <div class="aspect-square p-1 rounded-xl bg-[#FFF0F5]/30 text-center opacity-40 text-xs flex items-center justify-center text-[#725B69] cursor-not-allowed">
        ${dayNum}
      </div>
    `;
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = dStr === selectedDate;
    const isToday = dStr === todayStr;
    const periodCheck = isDateInPeriod(dStr, periods);
    const isPredicted = isDateInEstimatedNextPeriod(dStr, stats);
    const hasLog = logsMap.has(dStr);

    let cellBg = 'bg-[#FFFFFF] hover:bg-[#FFF0F5] border border-[#F1D5D8]';
    let textStyle = 'text-[#392332]';
    let badgeHtml = '';

    if (periodCheck.inPeriod) {
      cellBg = 'bg-[#A4365A] text-white border-[#8A2B49] shadow-xs';
      textStyle = 'text-white font-bold';
      badgeHtml = `<span class="w-1.5 h-1.5 rounded-full bg-white mt-1"></span>`;
    } else if (isPredicted) {
      cellBg = 'bg-[#FFF0F5] border-2 border-dashed border-[#FB6F92]';
      textStyle = 'text-[#A4365A] font-medium';
      badgeHtml = `<span class="text-[9px] text-[#FB6F92] leading-none mt-0.5 font-bold">est</span>`;
    }

    if (isSelected) {
      cellBg += ' ring-2 ring-[#A4365A] ring-offset-2';
    }

    html += `
      <button
        data-cal-date="${dStr}"
        class="aspect-square p-1 sm:p-2 rounded-xl text-center flex flex-col items-center justify-between transition-all relative ${cellBg}"
        aria-label="${dStr}${isToday ? ', Today' : ''}${periodCheck.inPeriod ? ', Period Day' : ''}"
      >
        <span class="text-xs sm:text-sm font-semibold ${textStyle}">
          ${d}
        </span>
        
        <div class="flex items-center gap-1">
          ${badgeHtml}
          ${hasLog && !periodCheck.inPeriod ? `<span class="w-1.5 h-1.5 rounded-full bg-[#FB6F92]" title="Logged symptoms"></span>` : ''}
        </div>
      </button>
    `;
  }

  return html;
}

export function bindCalendarEvents(container: HTMLElement, props: CalendarProps) {
  // Month navigation
  container.querySelector('#cal-prev-month-btn')?.addEventListener('click', () => {
    let newM = props.viewMonth - 1;
    let newY = props.viewYear;
    if (newM < 0) {
      newM = 11;
      newY--;
    }
    props.onChangeMonth(newY, newM);
  });

  container.querySelector('#cal-next-month-btn')?.addEventListener('click', () => {
    let newM = props.viewMonth + 1;
    let newY = props.viewYear;
    if (newM > 11) {
      newM = 0;
      newY++;
    }
    props.onChangeMonth(newY, newM);
  });

  container.querySelector('#cal-today-btn')?.addEventListener('click', () => {
    const now = new Date();
    props.onChangeMonth(now.getFullYear(), now.getMonth());
    props.onSelectDate(formatDate(now));
  });

  // Date cell click
  container.querySelectorAll<HTMLButtonElement>('button[data-cal-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dateStr = btn.getAttribute('data-cal-date');
      if (dateStr) props.onSelectDate(dateStr);
    });
  });

  // Record period start here
  container.querySelector('#cal-record-start-btn')?.addEventListener('click', async () => {
    // Validate not in future
    const today = formatDate(new Date());
    if (props.selectedDate > today) {
      alert('Cannot record actual bleeding start in the future.');
      return;
    }
    const newRecord: PeriodRecord = {
      id: 'period_' + props.selectedDate,
      startDate: props.selectedDate,
      source: 'user',
      createdAt: Date.now()
    };
    await props.onSavePeriod(newRecord);
  });

  // Mark end of period on this date
  container.querySelector('#cal-end-period-btn')?.addEventListener('click', async () => {
    const periodInfo = isDateInPeriod(props.selectedDate, props.periods);
    if (periodInfo.period) {
      if (props.selectedDate < periodInfo.period.startDate) {
        alert('End date cannot precede the start date.');
        return;
      }
      const updated: PeriodRecord = {
        ...periodInfo.period,
        endDate: props.selectedDate
      };
      await props.onSavePeriod(updated);
    }
  });

  // Delete period
  container.querySelector('#cal-del-period-btn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLElement;
    const periodId = btn.getAttribute('data-period-id');
    if (periodId && confirm('Delete this period record?')) {
      await props.onDeletePeriod(periodId);
    }
  });

  // Toggle multi-day range form
  const toggleRangeBtn = container.querySelector('#cal-toggle-range-btn');
  const rangeForm = container.querySelector('#cal-range-form');
  if (toggleRangeBtn && rangeForm) {
    toggleRangeBtn.addEventListener('click', () => {
      rangeForm.classList.toggle('hidden');
    });
  }

  // Save multi-day range
  container.querySelector('#save-range-btn')?.addEventListener('click', async () => {
    const startInput = container.querySelector('#range-start-input') as HTMLInputElement;
    const endInput = container.querySelector('#range-end-input') as HTMLInputElement;
    const start = startInput?.value;
    const end = endInput?.value;

    if (!start) {
      alert('Please enter a start date.');
      return;
    }
    const today = formatDate(new Date());
    if (start > today) {
      alert('Start date cannot be in the future.');
      return;
    }
    if (end && end < start) {
      alert('End date cannot be earlier than start date.');
      return;
    }

    const record: PeriodRecord = {
      id: 'period_' + start,
      startDate: start,
      endDate: end || undefined,
      source: 'user',
      createdAt: Date.now()
    };
    await props.onSavePeriod(record);
  });

  // Open daily log
  container.querySelector('#cal-open-log-btn')?.addEventListener('click', () => {
    props.onOpenDailyLog(props.selectedDate);
  });
}

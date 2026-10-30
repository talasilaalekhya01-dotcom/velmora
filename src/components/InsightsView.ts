/**
 * Velmora Cycle Insights View
 * Interactive Chart.js visual analytics:
 * 1. Cycle Lengths Trend
 * 2. Period Bleeding Durations
 * 3. Pain Score Over Time
 * 4. Most Frequent Symptoms (Horizontal Bar)
 * 5. Flow Level Distribution (Doughnut)
 */

import { Chart, registerables } from 'chart.js';
import { PeriodRecord, DailyLog, CycleStats } from '../types/index.ts';
import { getIcon } from '../utils/icons.ts';
import { getDaysDifference } from '../services/predictions.ts';

Chart.register(...registerables);

interface InsightsProps {
  periods: PeriodRecord[];
  dailyLogs: DailyLog[];
  stats: CycleStats;
}

let activeCharts: Chart[] = [];

export function renderInsightsView(props: InsightsProps): string {
  const { periods, dailyLogs, stats } = props;
  const hasIntervals = stats.cycleIntervals.length > 0;
  const hasLogs = dailyLogs.length > 0;

  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Cycle Insights</h1>
          <p class="text-sm text-[#725B69] mt-1">Grounded in your actual recorded periods and daily observations.</p>
        </div>
      </div>

      <!-- Statistical Calculation Explanation Card -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs space-y-3">
        <div class="flex items-center gap-2">
          <span class="text-[#A4365A]">${getIcon('info', 'w-5 h-5')}</span>
          <h2 class="font-display text-base font-bold text-[#392332]">How Velmora Calculates Your Rhythm</h2>
        </div>
        <p class="text-xs text-[#725B69] leading-relaxed">
          Cycle intervals are measured between **consecutive actual period start dates**. Velmora calculates your typical cycle length using the **median** rather than the arithmetic average, ensuring an occasional unusually short or long cycle does not skew your timeline.
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div class="p-3 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
            <span class="text-[11px] uppercase font-semibold text-[#725B69]">Median Cycle</span>
            <div class="text-xl font-extrabold text-[#A4365A] mt-0.5">${stats.medianCycleLength} days</div>
            <span class="text-[10px] text-[#725B69]">${stats.isPreliminary ? 'Preliminary' : 'Established'}</span>
          </div>

          <div class="p-3 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
            <span class="text-[11px] uppercase font-semibold text-[#725B69]">Recorded Cycles</span>
            <div class="text-xl font-extrabold text-[#392332] mt-0.5">${stats.totalRecordedCycles}</div>
            <span class="text-[10px] text-[#725B69]">${stats.totalRecordedCycles >= 3 ? 'Sufficient history' : 'Need ≥ 3 for full baseline'}</span>
          </div>

          <div class="p-3 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
            <span class="text-[11px] uppercase font-semibold text-[#725B69]">Cycle Range</span>
            <div class="text-xl font-extrabold text-[#392332] mt-0.5">
              ${stats.totalRecordedCycles > 0 ? `${stats.minCycleLength}–${stats.maxCycleLength}` : '—'} days
            </div>
            <span class="text-[10px] text-[#725B69]">Variation: ${stats.variationDays} days</span>
          </div>

          <div class="p-3 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
            <span class="text-[11px] uppercase font-semibold text-[#725B69]">Typical Bleeding</span>
            <div class="text-xl font-extrabold text-[#392332] mt-0.5">${stats.medianPeriodDuration} days</div>
            <span class="text-[10px] text-[#725B69]">Duration median</span>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Chart 1: Cycle Length Variations -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-display text-sm font-bold text-[#392332]">Cycle Length History (Days)</h3>
              <span class="text-xs text-[#725B69]">Median: ${stats.medianCycleLength}d</span>
            </div>
            <p class="text-[11px] text-[#725B69] mb-4">Intervals between consecutive recorded start dates.</p>
            <div class="h-60 relative">
              ${hasIntervals ? `
                <canvas id="chart-cycle-lengths"></canvas>
              ` : `
                <div class="h-full flex items-center justify-center text-xs text-[#725B69] text-center p-4">
                  Record at least 2 consecutive periods to plot cycle intervals.
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Chart 2: Bleeding Duration (Days) -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-display text-sm font-bold text-[#392332]">Period Bleeding Duration</h3>
              <span class="text-xs text-[#725B69]">Normal range: 2–7d</span>
            </div>
            <p class="text-[11px] text-[#725B69] mb-4">Total days from period start to end date.</p>
            <div class="h-60 relative">
              ${periods.length > 0 ? `
                <canvas id="chart-period-durations"></canvas>
              ` : `
                <div class="h-full flex items-center justify-center text-xs text-[#725B69] text-center p-4">
                  No period records with recorded end dates yet.
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Chart 3: Pain Trends Over Time -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-display text-sm font-bold text-[#392332]">Pain Intensity Trend (0–10)</h3>
              <span class="text-xs text-[#725B69]">Recent Daily Logs</span>
            </div>
            <p class="text-[11px] text-[#725B69] mb-4">Track cramping and pain patterns across cycle days.</p>
            <div class="h-60 relative">
              ${hasLogs ? `
                <canvas id="chart-pain-trend"></canvas>
              ` : `
                <div class="h-full flex items-center justify-center text-xs text-[#725B69] text-center p-4">
                  Log daily entries to visualize pain trends.
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Chart 4: Top Symptoms Frequency -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-display text-sm font-bold text-[#392332]">Symptom Frequency</h3>
              <span class="text-xs text-[#725B69]">Most logged</span>
            </div>
            <p class="text-[11px] text-[#725B69] mb-4">Most common physical sensations logged in daily entries.</p>
            <div class="h-60 relative">
              ${hasLogs ? `
                <canvas id="chart-symptom-freq"></canvas>
              ` : `
                <div class="h-full flex items-center justify-center text-xs text-[#725B69] text-center p-4">
                  Log symptoms to view distribution.
                </div>
              `}
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function initInsightsCharts(container: HTMLElement, props: InsightsProps) {
  // Destroy any previously mounted charts
  for (const c of activeCharts) {
    try { c.destroy(); } catch (_) {}
  }
  activeCharts = [];

  const { stats, periods, dailyLogs } = props;

  // Chart 1: Cycle Lengths
  const cycleCanvas = container.querySelector('#chart-cycle-lengths') as HTMLCanvasElement;
  if (cycleCanvas && stats.cycleIntervals.length > 0) {
    const labels = stats.cycleIntervals.map(i => i.to);
    const data = stats.cycleIntervals.map(i => i.lengthDays);

    const chart = new Chart(cycleCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Cycle Length (Days)',
            data,
            borderColor: '#A4365A',
            backgroundColor: 'rgba(164, 54, 90, 0.1)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#A4365A',
            pointRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: Math.max(15, stats.minCycleLength - 4),
            max: stats.maxCycleLength + 4,
            grid: { color: '#F1D5D8' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
    activeCharts.push(chart);
  }

  // Chart 2: Period Bleeding Durations
  const durationCanvas = container.querySelector('#chart-period-durations') as HTMLCanvasElement;
  if (durationCanvas && periods.length > 0) {
    const validPeriods = periods.filter(p => !!p.endDate).slice(0, 8).reverse();
    const labels = validPeriods.map(p => p.startDate);
    const data = validPeriods.map(p => getDaysDifference(p.startDate, p.endDate!) + 1);

    if (data.length > 0) {
      const chart = new Chart(durationCanvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Bleeding Days',
              data,
              backgroundColor: '#FB6F92',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: Math.max(8, ...data) + 2,
              grid: { color: '#F1D5D8' }
            },
            x: { grid: { display: false } }
          }
        }
      });
      activeCharts.push(chart);
    }
  }

  // Chart 3: Pain Trend
  const painCanvas = container.querySelector('#chart-pain-trend') as HTMLCanvasElement;
  if (painCanvas && dailyLogs.length > 0) {
    const recentLogs = [...dailyLogs]
      .filter(l => typeof l.pain === 'number')
      .slice(0, 14)
      .reverse();

    if (recentLogs.length > 0) {
      const chart = new Chart(painCanvas, {
        type: 'line',
        data: {
          labels: recentLogs.map(l => l.date.slice(5)), // MM-DD
          datasets: [
            {
              label: 'Pain Score (0–10)',
              data: recentLogs.map(l => l.pain || 0),
              borderColor: '#FB6F92',
              backgroundColor: 'rgba(251, 111, 146, 0.15)',
              tension: 0.2,
              fill: true,
              pointBackgroundColor: '#FB6F92'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 10, grid: { color: '#F1D5D8' } },
            x: { grid: { display: false } }
          }
        }
      });
      activeCharts.push(chart);
    }
  }

  // Chart 4: Top Symptoms Bar
  const symCanvas = container.querySelector('#chart-symptom-freq') as HTMLCanvasElement;
  if (symCanvas && dailyLogs.length > 0) {
    const counts: Record<string, number> = {};
    for (const log of dailyLogs) {
      const all = [...(log.symptoms || []), ...(log.customSymptoms || [])];
      for (const s of all) {
        counts[s] = (counts[s] || 0) + 1;
      }
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);

    if (sorted.length > 0) {
      const chart = new Chart(symCanvas, {
        type: 'bar',
        data: {
          labels: sorted.map(([name]) => name.charAt(0).toUpperCase() + name.slice(1)),
          datasets: [
            {
              label: 'Occurrences',
              data: sorted.map(([, count]) => count),
              backgroundColor: '#A4365A',
              borderRadius: 6
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { color: '#F1D5D8' } },
            y: { grid: { display: false } }
          }
        }
      });
      activeCharts.push(chart);
    }
  }
}

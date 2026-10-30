/**
 * Velmora Health Alerts View
 * Transparent pattern recognition guidance with clinical context,
 * review/dismiss actions, and independent urgent care protocols.
 */

import { HealthAlert } from '../types/index.ts';
import { getIcon } from '../utils/icons.ts';
import { URGENT_CARE_GUIDELINES } from '../services/alertEngine.ts';

interface AlertsProps {
  alerts: HealthAlert[];
  onDismissAlert: (id: string) => Promise<void>;
}

export function renderAlertsView(props: AlertsProps): string {
  const { alerts } = props;
  const activeAlerts = alerts.filter(a => !a.dismissed);
  const dismissedAlerts = alerts.filter(a => a.dismissed);

  return `
    <div class="space-y-6 max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Health Alerts & Clinical Guidance</h1>
          <p class="text-sm text-[#725B69] mt-1">Informational observations generated from your recorded patterns.</p>
        </div>
      </div>

      <!-- Scope & Purpose Clarification Notice -->
      <div class="p-4 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] text-xs text-[#725B69] space-y-1.5">
        <div class="flex items-center gap-2 font-bold text-[#392332]">
          ${getIcon('info', 'w-4 h-4 text-[#A4365A]')}
          <span>How to use these health notices</span>
        </div>
        <p class="leading-relaxed">
          Velmora checks your recorded start dates, bleeding duration, flow intensity, and pain ratings against clinical benchmarks (such as ACOG and NHS guidelines). These alerts are <strong>informational preparation for discussions with your healthcare provider</strong>, not a medical diagnosis. The absence of alerts does not guarantee the absence of health conditions.
        </p>
      </div>

      <!-- Active Alerts Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-[#392332] flex items-center gap-2">
            <span>Active Informational Alerts</span>
            <span class="text-xs px-2 py-0.5 rounded-full ${activeAlerts.length > 0 ? 'bg-[#FB6F92] text-white' : 'bg-[#FFF0F5] text-[#725B69]'} font-semibold">
              ${activeAlerts.length}
            </span>
          </h2>
        </div>

        ${activeAlerts.length === 0 ? `
          <div class="p-8 rounded-2xl bg-[#FFFFFF] border border-[#F1D5D8] text-center space-y-2">
            <div class="w-12 h-12 mx-auto rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] flex items-center justify-center text-[#A4365A]">
              ${getIcon('check', 'w-6 h-6')}
            </div>
            <div class="font-display font-bold text-base text-[#392332]">No active alerts detected</div>
            <p class="text-xs text-[#725B69] max-w-md mx-auto">
              Your recorded cycle intervals, bleeding duration, and symptoms currently align within standard physiological thresholds.
            </p>
          </div>
        ` : `
          <div class="space-y-4">
            ${activeAlerts.map(alert => renderAlertCard(alert, false)).join('')}
          </div>
        `}
      </div>

      <!-- Urgent Care Guidelines (Always Available Independently) -->
      <div class="bg-[#FFFFFF] rounded-2xl border-2 border-[#FB6F92] p-5 shadow-xs space-y-3">
        <div class="flex items-center gap-2 text-sm font-bold text-[#A4365A]">
          ${getIcon('alert-triangle', 'w-5 h-5 text-[#FB6F92]')}
          <span>Urgent Clinical Warning Signs (When to Seek Immediate Care)</span>
        </div>
        <p class="text-xs text-[#725B69]">
          The following symptoms should prompt immediate medical evaluation regardless of your routine tracking alerts:
        </p>
        <ul class="text-xs text-[#392332] space-y-2 pl-4 list-disc marker:text-[#FB6F92]">
          ${URGENT_CARE_GUIDELINES[0].points.map(pt => `<li class="leading-relaxed">${pt}</li>`).join('')}
        </ul>
        <div class="text-[11px] text-[#725B69] pt-2 border-t border-[#F1D5D8]">
          Reference: ${URGENT_CARE_GUIDELINES[0].clinicalReference}
        </div>
      </div>

      <!-- Dismissed Alerts Archive (if any) -->
      ${dismissedAlerts.length > 0 ? `
        <div class="pt-4 border-t border-[#F1D5D8] space-y-3">
          <h3 class="text-xs font-semibold uppercase text-[#725B69]">Reviewed & Dismissed Observations (${dismissedAlerts.length})</h3>
          <div class="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
            ${dismissedAlerts.map(alert => renderAlertCard(alert, true)).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

function renderAlertCard(alert: HealthAlert, isDismissed: boolean): string {
  const badgeStyle =
    alert.severity === 'urgent'
      ? 'bg-[#FB6F92] text-white'
      : alert.severity === 'attention'
      ? 'bg-[#FFF0F5] text-[#A4365A] border border-[#F1D5D8]'
      : 'bg-[#FFF0F5] text-[#725B69] border border-[#F1D5D8]';

  return `
    <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs space-y-4">
      
      <!-- Top Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1D5D8] pb-3">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-lg bg-[#FFF0F5] border border-[#F1D5D8] flex items-center justify-center text-[#A4365A] shrink-0">
            ${getIcon(alert.severity === 'urgent' ? 'alert-triangle' : 'alert-circle', 'w-4 h-4')}
          </span>
          <div>
            <h3 class="font-display text-base font-bold text-[#392332]">${alert.title}</h3>
            <span class="text-[11px] text-[#725B69]">Relevant dates: ${alert.relevantDates.join(', ')}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-center">
          <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${badgeStyle}">
            ${alert.severity}
          </span>
          ${!isDismissed ? `
            <button
              data-dismiss-id="${alert.id}"
              class="px-2.5 py-1 text-xs font-medium text-[#725B69] hover:text-[#392332] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-lg transition-colors"
            >
              Dismiss
            </button>
          ` : `
            <span class="text-xs text-[#725B69] italic">Dismissed</span>
          `}
        </div>
      </div>

      <!-- Recorded Data -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
          <span class="text-[11px] uppercase font-semibold text-[#725B69] block mb-1">What Was Recorded</span>
          <p class="text-[#392332] font-medium leading-relaxed">${alert.recordedDataText}</p>
        </div>

        <div class="p-3 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
          <span class="text-[11px] uppercase font-semibold text-[#725B69] block mb-1">Recommended Next Step</span>
          <p class="text-[#392332] font-medium leading-relaxed">${alert.recommendedNextStep}</p>
        </div>
      </div>

      <!-- Clinical Rationale -->
      <div class="text-xs text-[#725B69] space-y-1 bg-[#FFF8FA] p-3 rounded-xl border border-[#F1D5D8]">
        <div class="font-semibold text-[#392332]">Why did this alert appear?</div>
        <p class="leading-relaxed">${alert.rationale}</p>
        <div class="text-[10px] text-[#725B69] pt-1">Source: ${alert.clinicalSource}</div>
      </div>

    </div>
  `;
}

export function bindAlertsEvents(container: HTMLElement, props: AlertsProps) {
  container.querySelectorAll<HTMLButtonElement>('button[data-dismiss-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-dismiss-id');
      if (id) {
        await props.onDismissAlert(id);
      }
    });
  });
}

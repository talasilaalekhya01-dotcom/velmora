/**
 * Velmora Desktop Sidebar Component
 * Stable left navigation panel with 10 sections and cycle status summary.
 */

import { AppSection } from '../types/index.ts';
import { getIcon, getBrandSymbolSvg, IconName } from '../utils/icons.ts';

interface SidebarProps {
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
  activeAlertsCount: number;
  isDemoActive: boolean;
  currentCycleDay?: number;
}

interface NavItem {
  section: AppSection;
  label: string;
  icon: IconName;
  badge?: string;
}

export function renderSidebar(props: SidebarProps): string {
  const { currentSection, activeAlertsCount, isDemoActive, currentCycleDay } = props;

  const items: NavItem[] = [
    { section: 'dashboard', label: 'Dashboard', icon: 'heart' },
    { section: 'calendar', label: 'Period Calendar', icon: 'calendar' },
    { section: 'daily-log', label: 'Daily Health Log', icon: 'droplet' },
    { section: 'insights', label: 'Cycle Insights', icon: 'activity' },
    {
      section: 'alerts',
      label: 'Health Alerts',
      icon: 'alert-circle',
      badge: activeAlertsCount > 0 ? String(activeAlertsCount) : undefined
    },
    { section: 'doctors', label: 'Find Care', icon: 'map-pin' },
    { section: 'products', label: 'Period Products', icon: 'package' },
    { section: 'reports', label: 'Health Reports', icon: 'file-text' },
    { section: 'education', label: 'Health Education', icon: 'book-open' },
    { section: 'settings', label: 'Settings & Privacy', icon: 'settings' }
  ];

  return `
    <aside class="w-64 bg-[#FFFFFF] border-r border-[#F1D5D8] flex flex-col shrink-0 min-h-[calc(100vh-61px)] no-print">
      
      <!-- Full Logo Lockup: Symbol beside Velmora wordmark -->
      <div class="p-4 pb-3 border-b border-[#F1D5D8] flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#FFF0F5] border border-[#F1D5D8] flex items-center justify-center shrink-0">
          ${getBrandSymbolSvg('w-5 h-5')}
        </div>
        <div>
          <span class="font-display font-bold text-lg text-[#392332] block leading-tight">Velmora</span>
          <span class="text-[11px] text-[#725B69] block">Your cycle. Your clarity.</span>
        </div>
      </div>

      <!-- Quick Cycle Status Capsule -->
      <div class="p-4 border-b border-[#F1D5D8] bg-[#FFF0F5]/50">
        <div class="text-xs text-[#725B69] font-medium uppercase tracking-wider">Current Cycle</div>
        <div class="text-base font-bold text-[#392332] mt-0.5 flex items-center justify-between">
          <span>${currentCycleDay ? `Day ${currentCycleDay} of Cycle` : 'Awaiting Period Start'}</span>
          ${isDemoActive ? '<span class="text-[10px] uppercase font-bold text-[#A4365A] bg-[#F8C8DC] px-2 py-0.5 rounded">Demo</span>' : ''}
        </div>
      </div>

      <!-- Navigation Link List -->
      <nav class="flex-1 py-4 px-3 space-y-1" aria-label="Sidebar Navigation">
        ${items.map(item => {
          const isActive = currentSection === item.section;
          return `
            <button
              data-sidebar-nav="${item.section}"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#FFF0F5] text-[#A4365A] font-semibold shadow-xs border border-[#F1D5D8]'
                  : 'text-[#725B69] hover:bg-[#FFF8FA] hover:text-[#392332]'
              }"
            >
              <div class="flex items-center gap-3">
                <span class="${isActive ? 'text-[#A4365A]' : 'text-[#725B69]'} shrink-0">
                  ${getIcon(item.icon, 'w-4 h-4')}
                </span>
                <span class="truncate">${item.label}</span>
              </div>
              ${item.badge ? `
                <span class="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-[#FB6F92] rounded-full">
                  ${item.badge}
                </span>
              ` : ''}
            </button>
          `;
        }).join('')}
      </nav>

      <!-- Privacy & Local-first Affirmation -->
      <div class="p-4 border-t border-[#F1D5D8] text-xs text-[#725B69] bg-[#FFF0F5]/30">
        <div class="flex items-center gap-1.5 font-semibold text-[#392332] mb-1">
          ${getIcon('shield-check', 'w-3.5 h-3.5 text-[#A4365A]')}
          <span>Local-First Privacy</span>
        </div>
        <p class="leading-relaxed">All health records are stored directly inside this browser. Never synced or sold.</p>
      </div>

    </aside>
  `;
}

export function bindSidebarEvents(container: HTMLElement, onNavigate: (section: AppSection) => void) {
  const btns = container.querySelectorAll<HTMLButtonElement>('button[data-sidebar-nav]');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-sidebar-nav') as AppSection;
      if (section) onNavigate(section);
    });
  });
}

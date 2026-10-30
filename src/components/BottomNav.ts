/**
 * Velmora Mobile Bottom Navigation & More Drawer Component
 * 5 bottom tabs: Home (Dashboard), Calendar, Log, Insights, More.
 * Accessible drawer for the remaining 5 sections.
 */

import { AppSection } from '../types/index.ts';
import { getIcon, getBrandSymbolSvg, IconName } from '../utils/icons.ts';

interface BottomNavProps {
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
  activeAlertsCount: number;
}

export function renderBottomNav(props: BottomNavProps): string {
  const { currentSection, activeAlertsCount } = props;

  const tabs: { section: AppSection | 'more'; label: string; icon: IconName; badge?: number }[] = [
    { section: 'dashboard', label: 'Home', icon: 'heart' },
    { section: 'calendar', label: 'Calendar', icon: 'calendar' },
    { section: 'daily-log', label: 'Log', icon: 'droplet' },
    { section: 'insights', label: 'Insights', icon: 'activity' },
    { section: 'more', label: 'More', icon: 'menu', badge: activeAlertsCount > 0 ? activeAlertsCount : undefined }
  ];

  const isMoreActive = ['alerts', 'doctors', 'products', 'reports', 'education', 'settings'].includes(currentSection);

  return `
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#F1D5D8] px-2 py-1.5 no-print" aria-label="Mobile Bottom Navigation">
      <div class="grid grid-cols-5 items-center justify-around">
        ${tabs.map(tab => {
          const isActive = tab.section === 'more' ? isMoreActive : currentSection === tab.section;
          return `
            <button
              data-bottom-tab="${tab.section}"
              class="flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors relative ${
                isActive ? 'text-[#A4365A] font-semibold' : 'text-[#725B69] hover:text-[#392332]'
              }"
            >
              <div class="relative">
                ${getIcon(tab.icon, 'w-5 h-5')}
                ${tab.badge ? `
                  <span class="absolute -top-1 -right-2 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold leading-none text-white bg-[#FB6F92] rounded-full">
                    ${tab.badge}
                  </span>
                ` : ''}
              </div>
              <span class="text-[11px] mt-0.5 whitespace-nowrap">${tab.label}</span>
            </button>
          `;
        }).join('')}
      </div>
    </nav>

    <!-- Mobile More Drawer Modal -->
    <div id="mobile-more-modal" class="fixed inset-0 z-50 bg-[#392332]/60 backdrop-blur-xs hidden transition-opacity" aria-hidden="true">
      <div class="absolute bottom-0 left-0 right-0 bg-[#FFFFFF] rounded-t-2xl p-5 border-t border-[#F1D5D8] max-h-[85vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-[#F1D5D8] mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-[#FFF0F5] border border-[#F1D5D8] flex items-center justify-center shrink-0">
              ${getBrandSymbolSvg('w-4 h-4')}
            </div>
            <span class="font-display font-bold text-lg text-[#392332]">All Sections</span>
          </div>
          <button id="close-more-modal-btn" class="p-1.5 rounded-lg text-[#725B69] hover:bg-[#FFF0F5] hover:text-[#392332]" aria-label="Close menu">
            ${getIcon('x', 'w-5 h-5')}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-2">
          ${[
            { section: 'alerts' as AppSection, label: 'Health Alerts', icon: 'alert-circle' as IconName, desc: 'Pattern notices and clinical guidance', badge: activeAlertsCount },
            { section: 'doctors' as AppSection, label: 'Find Doctors & Clinics', icon: 'map-pin' as IconName, desc: 'Nearby facilities & personal notes' },
            { section: 'products' as AppSection, label: 'Period Products', icon: 'package' as IconName, desc: 'Care guides & personal reviews' },
            { section: 'reports' as AppSection, label: 'Health Reports', icon: 'file-text' as IconName, desc: 'Export summary for doctor visits' },
            { section: 'education' as AppSection, label: 'Health Education', icon: 'book-open' as IconName, desc: 'Evidence-based cycle guides' },
            { section: 'settings' as AppSection, label: 'Settings & Privacy', icon: 'settings' as IconName, desc: 'PIN lock, cycle preferences & backup' }
          ].map(item => `
            <button
              data-drawer-nav="${item.section}"
              class="flex items-center justify-between p-3 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/50 hover:bg-[#FFF0F5] transition-colors text-left"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#F1D5D8] flex items-center justify-center text-[#A4365A] shrink-0">
                  ${getIcon(item.icon, 'w-4 h-4')}
                </div>
                <div>
                  <div class="text-sm font-semibold text-[#392332]">${item.label}</div>
                  <div class="text-xs text-[#725B69]">${item.desc}</div>
                </div>
              </div>
              ${item.badge ? `
                <span class="px-2 py-0.5 text-xs font-bold text-white bg-[#FB6F92] rounded-full">
                  ${item.badge}
                </span>
              ` : getIcon('chevron-right', 'w-4 h-4 text-[#725B69]')}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function bindBottomNavEvents(
  container: HTMLElement,
  onNavigate: (section: AppSection) => void
) {
  const modal = container.querySelector<HTMLElement>('#mobile-more-modal');
  const closeBtn = container.querySelector<HTMLButtonElement>('#close-more-modal-btn');

  const openModal = () => {
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  const tabs = container.querySelectorAll<HTMLButtonElement>('button[data-bottom-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-bottom-tab');
      if (target === 'more') {
        openModal();
      } else if (target) {
        onNavigate(target as AppSection);
      }
    });
  });

  const drawerBtns = container.querySelectorAll<HTMLButtonElement>('button[data-drawer-nav]');
  drawerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-drawer-nav') as AppSection;
      if (section) {
        closeModal();
        onNavigate(section);
      }
    });
  });
}

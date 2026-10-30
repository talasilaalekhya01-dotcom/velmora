/**
 * Velmora Header Component
 * Strict compliance with the Top Bar Contract:
 * [Zone 1: Wordmark] — [Zone 2: 4-5 concise single-line links] — [Zone 3: 1 primary action & status]
 */

import { AppSection } from '../types/index.ts';
import { getIcon, getBrandSymbolSvg } from '../utils/icons.ts';

interface HeaderProps {
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onQuickLog: () => void;
  isOnline: boolean;
  canInstallPWA: boolean;
  onInstallPWA: () => void;
}

export function renderHeader(props: HeaderProps): string {
  const { currentSection, isOnline, canInstallPWA } = props;

  const navLinks: { section: AppSection; label: string }[] = [
    { section: 'dashboard', label: 'Dashboard' },
    { section: 'calendar', label: 'Calendar' },
    { section: 'daily-log', label: 'Daily Log' },
    { section: 'insights', label: 'Insights' },
    { section: 'alerts', label: 'Alerts' }
  ];

  return `
    <header class="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#F1D5D8] px-4 sm:px-6 py-3 no-print">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
        
        <!-- Zone 1: Single text element Brand Wordmark -->
        <a href="#dashboard" id="header-brand-link" class="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#392332] whitespace-nowrap shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A4365A] focus-visible:ring-offset-2 rounded-lg">
          <div class="w-8 h-8 rounded-lg bg-[#FFF0F5] border border-[#F1D5D8] flex items-center justify-center shrink-0 group-hover:border-[#FB6F92] transition-colors">
            ${getBrandSymbolSvg('w-5 h-5 transition-transform duration-200 group-hover:scale-105')}
          </div>
          <span class="font-display font-bold text-xl text-[#392332]">Velmora</span>
        </a>

        <!-- Zone 2: 4-5 concise single-line nav links (Desktop) -->
        <nav class="hidden lg:flex items-center gap-6 text-sm font-medium text-[#725B69]" aria-label="Main Navigation">
          ${navLinks.map(link => `
            <button
              data-nav="${link.section}"
              class="whitespace-nowrap shrink-0 transition-colors py-1 hover:text-[#A4365A] ${
                currentSection === link.section
                  ? 'text-[#A4365A] font-semibold border-b-2 border-[#A4365A]'
                  : 'text-[#725B69]'
              }"
            >
              ${link.label}
            </button>
          `).join('')}
        </nav>

        <!-- Zone 3: 1 primary action + PWA / Status Indicator -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          ${!isOnline ? `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#A4365A] bg-[#FFF0F5] border border-[#F1D5D8] rounded-md whitespace-nowrap" title="Running offline with cached data">
              ${getIcon('shield', 'w-3.5 h-3.5 text-[#FB6F92]')}
              <span>Offline Mode</span>
            </span>
          ` : ''}

          ${canInstallPWA ? `
            <button
              id="pwa-install-btn"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#A4365A] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-lg transition-colors whitespace-nowrap"
            >
              ${getIcon('download', 'w-3.5 h-3.5')}
              <span>Install App</span>
            </button>
          ` : ''}

          <!-- Primary CTA Button -->
          <button
            id="quick-log-btn"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] active:bg-[#72223C] rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            ${getIcon('plus', 'w-4 h-4')}
            <span>Log Today</span>
          </button>
        </div>

      </div>
    </header>
  `;
}

export function bindHeaderEvents(
  container: HTMLElement,
  props: HeaderProps
) {
  const brandLink = container.querySelector('#header-brand-link');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      props.onNavigate('dashboard');
    });
  }

  const navBtns = container.querySelectorAll<HTMLButtonElement>('button[data-nav]');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = btn.getAttribute('data-nav') as AppSection;
      if (sec) props.onNavigate(sec);
    });
  });

  const quickLogBtn = container.querySelector('#quick-log-btn');
  if (quickLogBtn) {
    quickLogBtn.addEventListener('click', props.onQuickLog);
  }

  const pwaBtn = container.querySelector('#pwa-install-btn');
  if (pwaBtn) {
    pwaBtn.addEventListener('click', props.onInstallPWA);
  }
}

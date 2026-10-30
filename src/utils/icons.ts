/**
 * Velmora Clean SVG Icon Library
 * Consistent stroke-based icons matching wellness aesthetic.
 */

export type IconName =
  | 'calendar'
  | 'droplet'
  | 'heart'
  | 'activity'
  | 'shield'
  | 'shield-check'
  | 'alert-circle'
  | 'alert-triangle'
  | 'map-pin'
  | 'package'
  | 'file-text'
  | 'book-open'
  | 'settings'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'check'
  | 'x'
  | 'search'
  | 'locate'
  | 'download'
  | 'printer'
  | 'info'
  | 'lock'
  | 'unlock'
  | 'bell'
  | 'bell-off'
  | 'star'
  | 'clock'
  | 'arrow-right'
  | 'share'
  | 'menu'
  | 'refresh';

const iconsMap: Record<IconName, string> = {
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>`,
  droplet: `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>`,
  heart: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>`,
  activity: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>`,
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>`,
  'shield-check': `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline>`,
  'alert-circle': `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>`,
  'alert-triangle': `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`,
  'map-pin': `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>`,
  package: `<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>`,
  'file-text': `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>`,
  'book-open': `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>`,
  settings: `<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`,
  plus: `<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>`,
  trash: `<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>`,
  edit: `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>`,
  'chevron-left': `<polyline points="15 18 9 12 15 6"></polyline>`,
  'chevron-right': `<polyline points="9 18 15 12 9 6"></polyline>`,
  'chevron-down': `<polyline points="6 9 12 15 18 9"></polyline>`,
  'chevron-up': `<polyline points="18 15 12 9 6 15"></polyline>`,
  check: `<polyline points="20 6 9 17 4 12"></polyline>`,
  x: `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`,
  search: `<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>`,
  locate: `<line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="3"></circle>`,
  download: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>`,
  printer: `<polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>`,
  info: `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>`,
  lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`,
  unlock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>`,
  bell: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>`,
  'bell-off': `<path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line>`,
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>`,
  clock: `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`,
  'arrow-right': `<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>`,
  share: `<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>`,
  menu: `<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>`,
  refresh: `<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>`
};

export function getIcon(name: IconName, className = 'w-5 h-5', strokeWidth = 2): string {
  const content = iconsMap[name] || iconsMap['info'];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${className}" aria-hidden="true">${content}</svg>`;
}

export function getBrandSymbolSvg(className = 'w-6 h-6'): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="${className}" fill="none" aria-hidden="true">
      <!-- Subtle incomplete circular rhythm arc (Watermelon pink #FB6F92) -->
      <path
        d="M 21 68 A 38 38 0 1 1 79 68"
        stroke="#FB6F92"
        stroke-width="4.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      
      <!-- Distinctive V monogram: two smooth, gently curved shapes (Deep rose #A4365A) -->
      <path
        d="M 31 27 C 33 46, 44 64, 50 71"
        stroke="#A4365A"
        stroke-width="8.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M 50 71 C 56 64, 67 46, 69 27"
        stroke="#A4365A"
        stroke-width="8.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

export function getFullBrandLogoSvg(className = 'h-8 w-auto'): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 56" class="${className}" fill="none" aria-label="Velmora">
      <g transform="translate(6, 6) scale(0.44)">
        <path
          d="M 21 68 A 38 38 0 1 1 79 68"
          stroke="#FB6F92"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 31 27 C 33 46, 44 64, 50 71"
          stroke="#A4365A"
          stroke-width="9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 50 71 C 56 64, 67 46, 69 27"
          stroke="#A4365A"
          stroke-width="9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <text
        x="62"
        y="36"
        fill="#392332"
        font-family="Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        font-size="28"
        font-weight="700"
        letter-spacing="-0.03em"
        dominant-baseline="middle"
      >Velmora</text>
    </svg>
  `;
}

export function getBrandLogo(showTagline = false): string {
  return `
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
        ${getBrandSymbolSvg('w-7 h-7')}
      </div>
      <div>
        <span class="font-display text-xl font-bold tracking-tight text-[#392332] block leading-tight">Velmora</span>
        ${showTagline ? '<span class="text-xs text-[#725B69] block">Your cycle. Your clarity.</span>' : ''}
      </div>
    </div>
  `;
}


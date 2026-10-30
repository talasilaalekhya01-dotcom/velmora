/**
 * Velmora Toast Notification Utility
 * Accessible, lightweight toast announcements.
 */

import { getIcon } from '../utils/icons.ts';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

class ToastManager {
  private container: HTMLElement | null = null;

  private initContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'velmora-toast-container';
      this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0';
      this.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.container);
    }
  }

  public show(message: string, type: ToastType = 'info', duration = 3500) {
    this.initContainer();
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-[-10px] opacity-0 ${
      type === 'success'
        ? 'bg-[#FFFFFF] border-[#F1D5D8] text-[#392332]'
        : type === 'error'
        ? 'bg-[#FFFFFF] border-[#FB6F92] text-[#392332]'
        : type === 'warning'
        ? 'bg-[#FFFFFF] border-[#FFB6C1] text-[#392332]'
        : 'bg-[#FFFFFF] border-[#F1D5D8] text-[#392332]'
    }`;

    const iconColor =
      type === 'success' ? 'text-[#A4365A]' :
      type === 'error' ? 'text-[#FB6F92]' :
      type === 'warning' ? 'text-[#FB6F92]' : 'text-[#A4365A]';

    const iconName =
      type === 'success' ? 'check' :
      type === 'error' ? 'alert-triangle' :
      type === 'warning' ? 'alert-circle' : 'info';

    toast.innerHTML = `
      <div class="${iconColor} shrink-0 mt-0.5">${getIcon(iconName, 'w-4 h-4')}</div>
      <div class="flex-1 font-medium leading-snug">${message}</div>
      <button class="text-[#725B69] hover:text-[#392332] shrink-0 p-0.5" aria-label="Dismiss toast">
        ${getIcon('x', 'w-3.5 h-3.5')}
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss(toast));
    }

    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-[-10px]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  }

  private dismiss(toast: HTMLElement) {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-[-10px]');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

export const toast = new ToastManager();

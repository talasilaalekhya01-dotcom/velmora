/**
 * Velmora PIN Lock Screen Modal
 * Protects the UI interface when enabled using Web Crypto PBKDF2.
 */

import { verifyPin } from '../services/crypto.ts';
import { getIcon } from '../utils/icons.ts';

interface PinLockProps {
  salt: string;
  hash: string;
  onUnlocked: () => void;
  onResetRequested?: () => void;
}

export function renderPinLockModal(): string {
  return `
    <div id="pin-lock-overlay" class="fixed inset-0 z-50 bg-[#392332] flex items-center justify-center p-4">
      <div class="w-full max-w-xs text-center space-y-6">
        
        <div class="space-y-2">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-[#FFF0F5] border border-[#F1D5D8] flex items-center justify-center text-[#A4365A] shadow-sm">
            ${getIcon('lock', 'w-7 h-7')}
          </div>
          <h2 class="font-display text-2xl font-bold text-[#FFFFFF]">Velmora Locked</h2>
          <p class="text-xs text-[#F8C8DC]">Enter your PIN to access your records</p>
        </div>

        <!-- PIN Dots Display -->
        <div class="flex justify-center items-center gap-3 py-2" id="pin-dots">
          <span class="w-4 h-4 rounded-full border-2 border-[#F8C8DC] bg-transparent"></span>
          <span class="w-4 h-4 rounded-full border-2 border-[#F8C8DC] bg-transparent"></span>
          <span class="w-4 h-4 rounded-full border-2 border-[#F8C8DC] bg-transparent"></span>
          <span class="w-4 h-4 rounded-full border-2 border-[#F8C8DC] bg-transparent"></span>
        </div>

        <div id="pin-error-msg" class="text-xs text-[#FB6F92] min-h-[1.25rem] font-semibold"></div>

        <!-- Numeric Keypad -->
        <div class="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `
            <button
              data-pin-num="${n}"
              class="w-16 h-16 rounded-full bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 active:bg-[#FFFFFF]/30 text-white text-xl font-semibold flex items-center justify-center transition-colors mx-auto"
            >
              ${n}
            </button>
          `).join('')}
          <button
            id="pin-clear-btn"
            class="w-16 h-16 rounded-full text-[#F8C8DC] hover:text-white text-xs font-semibold flex items-center justify-center mx-auto"
          >
            Clear
          </button>
          <button
            data-pin-num="0"
            class="w-16 h-16 rounded-full bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 active:bg-[#FFFFFF]/30 text-white text-xl font-semibold flex items-center justify-center transition-colors mx-auto"
          >
            0
          </button>
          <button
            id="pin-backspace-btn"
            class="w-16 h-16 rounded-full text-[#F8C8DC] hover:text-white flex items-center justify-center mx-auto"
            aria-label="Backspace"
          >
            ${getIcon('chevron-left', 'w-6 h-6')}
          </button>
        </div>

        <div class="pt-4 text-xs text-[#F8C8DC]/70">
          <span>Protected with client-side Web Crypto PBKDF2</span>
        </div>

      </div>
    </div>
  `;
}

export function bindPinLockEvents(container: HTMLElement, props: PinLockProps) {
  let currentPin = '';
  let failedAttempts = 0;
  let isLockedOut = false;

  const errorEl = container.querySelector('#pin-error-msg') as HTMLElement;
  const dots = container.querySelectorAll('#pin-dots span');

  const updateDots = () => {
    dots.forEach((dot, idx) => {
      if (idx < currentPin.length) {
        dot.className = 'w-4 h-4 rounded-full border-2 border-[#FB6F92] bg-[#FB6F92]';
      } else {
        dot.className = 'w-4 h-4 rounded-full border-2 border-[#F8C8DC] bg-transparent';
      }
    });
  };

  const handleDigit = async (d: string) => {
    if (isLockedOut) return;
    if (currentPin.length >= 6) return;

    currentPin += d;
    updateDots();

    if (currentPin.length >= 4) {
      // Test the PIN
      const isValid = await verifyPin(currentPin, props.salt, props.hash);
      if (isValid) {
        if (errorEl) errorEl.textContent = '';
        props.onUnlocked();
      } else {
        if (currentPin.length >= 4) {
          // If 4 digits entered and wrong, check after small pause
          setTimeout(async () => {
            const recheck = await verifyPin(currentPin, props.salt, props.hash);
            if (recheck) {
              props.onUnlocked();
              return;
            }
            failedAttempts++;
            if (errorEl) {
              if (failedAttempts >= 5) {
                isLockedOut = true;
                errorEl.textContent = 'Too many attempts. Locked for 30s.';
                setTimeout(() => {
                  isLockedOut = false;
                  failedAttempts = 0;
                  if (errorEl) errorEl.textContent = '';
                }, 30000);
              } else {
                errorEl.textContent = `Incorrect PIN (${5 - failedAttempts} tries left)`;
              }
            }
            currentPin = '';
            updateDots();
          }, 250);
        }
      }
    }
  };

  const numBtns = container.querySelectorAll<HTMLButtonElement>('button[data-pin-num]');
  numBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-pin-num');
      if (num) handleDigit(num);
    });
  });

  container.querySelector('#pin-backspace-btn')?.addEventListener('click', () => {
    if (currentPin.length > 0) {
      currentPin = currentPin.slice(0, -1);
      updateDots();
      if (errorEl) errorEl.textContent = '';
    }
  });

  container.querySelector('#pin-clear-btn')?.addEventListener('click', () => {
    currentPin = '';
    updateDots();
    if (errorEl) errorEl.textContent = '';
  });

  // Physical keyboard listener
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      if (currentPin.length > 0) {
        currentPin = currentPin.slice(0, -1);
        updateDots();
      }
    } else if (e.key === 'Escape') {
      currentPin = '';
      updateDots();
    }
  };

  window.addEventListener('keydown', keyHandler);
}

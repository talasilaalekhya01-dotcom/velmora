/**
 * Velmora First-Time Onboarding Flow Modal
 * A welcoming, respectful, 3-step setup flow.
 * Explains browser storage, collects initial cycle parameters (all skippable),
 * and offers an optional demo mode.
 */

import { UserPreferences, PeriodRecord } from '../types/index.ts';
import { getIcon, getBrandSymbolSvg } from '../utils/icons.ts';
import { hashPin, generateRandomSalt } from '../services/crypto.ts';

interface OnboardingProps {
  onComplete: (data: {
    preferences: Partial<UserPreferences>;
    initialPeriod?: PeriodRecord;
    loadDemo?: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

export function renderOnboardingModal(): string {
  return `
    <div id="onboarding-overlay" class="fixed inset-0 z-50 bg-[#392332]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-[#FFFFFF] w-full max-w-lg rounded-2xl shadow-2xl border border-[#F1D5D8] overflow-hidden my-8">
        
        <!-- Header -->
        <div class="p-6 bg-gradient-to-b from-[#FFF0F5] to-[#FFFFFF] border-b border-[#F1D5D8] text-center">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-[#FFFFFF] border border-[#F1D5D8] flex items-center justify-center shadow-xs mb-3">
            ${getBrandSymbolSvg('w-8 h-8')}
          </div>
          <h2 class="font-display text-2xl font-bold text-[#392332]">Welcome to Velmora</h2>
          <p class="text-sm text-[#725B69] mt-1">Your cycle. Your clarity.</p>
        </div>

        <!-- Step Indicator -->
        <div class="px-6 pt-4 flex items-center justify-between text-xs font-semibold text-[#725B69]">
          <span id="onboard-step-indicator">Step 1 of 3: Privacy & Storage</span>
          <div class="flex gap-1.5" id="onboard-dots">
            <span class="w-2.5 h-2.5 rounded-full bg-[#A4365A]"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-[#F1D5D8]"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-[#F1D5D8]"></span>
          </div>
        </div>

        <!-- Step 1: Privacy & Local Storage Explanation -->
        <div id="onboard-step-1" class="p-6 space-y-4">
          <div class="rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] p-4 text-xs text-[#392332] space-y-2">
            <div class="font-bold text-sm flex items-center gap-2 text-[#A4365A]">
              ${getIcon('shield-check', 'w-4 h-4')}
              <span>Where your records live</span>
            </div>
            <p class="leading-relaxed text-[#725B69]">
              Velmora is built **local-first**. All cycle dates, symptoms, pain entries, and doctor notes stay strictly inside this browser using HTML5 IndexedDB.
            </p>
            <p class="leading-relaxed text-[#725B69]">
              • No remote server database or external account creation.<br />
              • Data does not sync between devices automatically.<br />
              • Clearing browser site data will remove your local records unless you export an offline backup in Settings.
            </p>
          </div>

          <div class="space-y-3 pt-2">
            <label class="block text-sm font-semibold text-[#392332]">How would you like to start?</label>
            <div class="space-y-2">
              <label class="flex items-start gap-3 p-3 rounded-xl border border-[#A4365A] bg-[#FFF0F5]/50 cursor-pointer">
                <input type="radio" name="onboard-mode" value="fresh" checked class="mt-1 accent-[#A4365A]">
                <div>
                  <div class="text-sm font-semibold text-[#392332]">Start with empty personal records (Recommended)</div>
                  <div class="text-xs text-[#725B69]">Log your own actual cycles and daily symptoms.</div>
                </div>
              </label>

              <label class="flex items-start gap-3 p-3 rounded-xl border border-[#F1D5D8] hover:bg-[#FFF8FA] cursor-pointer">
                <input type="radio" name="onboard-mode" value="demo" class="mt-1 accent-[#A4365A]">
                <div>
                  <div class="text-sm font-semibold text-[#392332]">Explore with Demo Mode</div>
                  <div class="text-xs text-[#725B69]">Loads 4 months of sample cycles to test charts, alerts, and reports. Can be cleared anytime with 1 click.</div>
                </div>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#F1D5D8]">
            <button id="step1-next-btn" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] transition-colors">
              Continue
            </button>
          </div>
        </div>

        <!-- Step 2: Cycle Parameters (Skippable) -->
        <div id="onboard-step-2" class="p-6 space-y-4 hidden">
          <div>
            <h3 class="font-display text-lg font-bold text-[#392332]">Typical Cycle Details</h3>
            <p class="text-xs text-[#725B69] mt-0.5">Help Velmora provide preliminary estimates. You can skip any unknown details.</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-[#725B69] mb-1">
                Last period start date (Optional)
              </label>
              <input
                type="date"
                id="onboard-last-period"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm focus:border-[#A4365A] focus:bg-white transition-colors"
              />
              <span class="text-[11px] text-[#725B69] mt-1 block">Leave blank if you prefer to record it later.</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase text-[#725B69] mb-1">
                  Cycle Length (Days)
                </label>
                <input
                  type="number"
                  id="onboard-cycle-length"
                  min="20"
                  max="50"
                  value="28"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm focus:border-[#A4365A] focus:bg-white"
                />
                <span class="text-[11px] text-[#725B69] mt-0.5 block">Typical: 28 days</span>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-[#725B69] mb-1">
                  Period Duration (Days)
                </label>
                <input
                  type="number"
                  id="onboard-period-duration"
                  min="2"
                  max="12"
                  value="5"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm focus:border-[#A4365A] focus:bg-white"
                />
                <span class="text-[11px] text-[#725B69] mt-0.5 block">Typical: 4–6 days</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-[#F1D5D8]">
            <button id="step2-back-btn" class="px-4 py-2 text-sm font-semibold text-[#725B69] hover:text-[#392332]">
              Back
            </button>
            <div class="flex gap-2">
              <button id="step2-skip-btn" class="px-4 py-2 text-sm font-semibold text-[#725B69] hover:text-[#392332]">
                Skip this
              </button>
              <button id="step2-next-btn" class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] transition-colors">
                Continue
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Optional PIN Setup & Finish -->
        <div id="onboard-step-3" class="p-6 space-y-4 hidden">
          <div>
            <h3 class="font-display text-lg font-bold text-[#392332]">Optional Privacy Lock (PIN)</h3>
            <p class="text-xs text-[#725B69] mt-0.5">Protect this app interface from shoulder-surfing when left open.</p>
          </div>

          <div class="rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] p-4 text-xs text-[#725B69] space-y-1.5">
            <div class="font-bold text-sm text-[#392332] flex items-center gap-1.5">
              ${getIcon('lock', 'w-4 h-4 text-[#A4365A]')}
              <span>Web Crypto PIN Verification</span>
            </div>
            <p>
              Your PIN is hashed with PBKDF2 (100,000 iterations) using a cryptographic salt. It locks the visual UI tab.
            </p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold uppercase text-[#725B69] mb-1">
                Set 4-Digit PIN (Optional)
              </label>
              <input
                type="password"
                id="onboard-pin"
                maxlength="6"
                placeholder="Leave blank to skip"
                class="w-full px-3.5 py-2.5 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm focus:border-[#A4365A] focus:bg-white tracking-widest text-center"
              />
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-[#F1D5D8]">
            <button id="step3-back-btn" class="px-4 py-2 text-sm font-semibold text-[#725B69] hover:text-[#392332]">
              Back
            </button>
            <button id="step3-finish-btn" class="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] transition-colors shadow-xs">
              Complete Setup
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function bindOnboardingEvents(container: HTMLElement, props: OnboardingProps) {
  let step = 1;

  const step1 = container.querySelector('#onboard-step-1') as HTMLElement;
  const step2 = container.querySelector('#onboard-step-2') as HTMLElement;
  const step3 = container.querySelector('#onboard-step-3') as HTMLElement;
  const indicator = container.querySelector('#onboard-step-indicator') as HTMLElement;
  const dots = container.querySelectorAll('#onboard-dots span');

  const updateUI = () => {
    step1.classList.toggle('hidden', step !== 1);
    step2.classList.toggle('hidden', step !== 2);
    step3.classList.toggle('hidden', step !== 3);

    if (indicator) {
      if (step === 1) indicator.textContent = 'Step 1 of 3: Privacy & Storage';
      if (step === 2) indicator.textContent = 'Step 2 of 3: Cycle Baseline';
      if (step === 3) indicator.textContent = 'Step 3 of 3: Optional PIN Security';
    }

    dots.forEach((dot, idx) => {
      dot.className = idx === step - 1
        ? 'w-2.5 h-2.5 rounded-full bg-[#A4365A]'
        : 'w-2.5 h-2.5 rounded-full bg-[#F1D5D8]';
    });
  };

  // Step 1 -> 2
  container.querySelector('#step1-next-btn')?.addEventListener('click', () => {
    const selectedMode = (container.querySelector('input[name="onboard-mode"]:checked') as HTMLInputElement)?.value;
    if (selectedMode === 'demo') {
      // Directly finish with demo data
      props.onComplete({
        preferences: { onboardingCompleted: true, isDemoActive: true },
        loadDemo: true
      });
      return;
    }
    step = 2;
    updateUI();
  });

  // Step 2 -> 1 or 3
  container.querySelector('#step2-back-btn')?.addEventListener('click', () => {
    step = 1;
    updateUI();
  });

  const goStep3 = () => {
    step = 3;
    updateUI();
  };

  container.querySelector('#step2-skip-btn')?.addEventListener('click', goStep3);
  container.querySelector('#step2-next-btn')?.addEventListener('click', goStep3);

  // Step 3 -> 2 or Finish
  container.querySelector('#step3-back-btn')?.addEventListener('click', () => {
    step = 2;
    updateUI();
  });

  container.querySelector('#step3-finish-btn')?.addEventListener('click', async () => {
    const cycleLengthInput = container.querySelector('#onboard-cycle-length') as HTMLInputElement;
    const periodDurationInput = container.querySelector('#onboard-period-duration') as HTMLInputElement;
    const lastPeriodInput = container.querySelector('#onboard-last-period') as HTMLInputElement;
    const pinInput = container.querySelector('#onboard-pin') as HTMLInputElement;

    const cycleLength = parseInt(cycleLengthInput?.value) || 28;
    const periodDuration = parseInt(periodDurationInput?.value) || 5;
    const lastPeriodDate = lastPeriodInput?.value;
    const pinVal = pinInput?.value.trim();

    let pinSalt: string | undefined;
    let pinHash: string | undefined;
    let pinEnabled = false;

    if (pinVal && pinVal.length >= 4) {
      pinSalt = generateRandomSalt();
      pinHash = await hashPin(pinVal, pinSalt);
      pinEnabled = true;
    }

    let initialPeriod: PeriodRecord | undefined;
    if (lastPeriodDate) {
      initialPeriod = {
        id: 'initial_period_' + lastPeriodDate,
        startDate: lastPeriodDate,
        source: 'user',
        createdAt: Date.now()
      };
    }

    await props.onComplete({
      preferences: {
        onboardingCompleted: true,
        defaultCycleLength: cycleLength,
        defaultPeriodDuration: periodDuration,
        pinEnabled,
        pinSalt,
        pinHash,
        isDemoActive: false
      },
      initialPeriod,
      loadDemo: false
    });
  });
}

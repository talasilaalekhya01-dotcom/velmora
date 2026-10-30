/**
 * Velmora Settings & Privacy View
 * Cycle preferences, Web Crypto PIN setup/removal, notification permissions,
 * JSON backup/restore, Demo dataset toggle, and confirmed full reset.
 */

import { UserPreferences } from '../types/index.ts';
import { getIcon } from '../utils/icons.ts';
import { hashPin, generateRandomSalt } from '../services/crypto.ts';

interface SettingsProps {
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => Promise<void>;
  onExportData: () => Promise<void>;
  onImportData: (jsonStr: string) => Promise<boolean>;
  onToggleDemo: (enable: boolean) => Promise<void>;
  onClearAllData: () => Promise<void>;
}

export function renderSettingsView(props: SettingsProps): string {
  const { preferences } = props;

  return `
    <div class="space-y-6 max-w-3xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Settings & Privacy</h1>
          <p class="text-sm text-[#725B69] mt-1">Manage cycle baselines, Web Crypto PIN lock, backup, and reset controls.</p>
        </div>
      </div>

      <!-- Section 1: Cycle Preferences -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-6 shadow-xs space-y-4">
        <div class="border-b border-[#F1D5D8] pb-3">
          <h2 class="font-display text-base font-bold text-[#392332] flex items-center gap-2">
            ${getIcon('calendar', 'w-4 h-4 text-[#A4365A]')}
            <span>Cycle Baseline Parameters</span>
          </h2>
          <p class="text-xs text-[#725B69] mt-0.5">Used as fallbacks when fewer than 3 completed cycles are recorded.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-semibold uppercase text-[#725B69] mb-1">
              Default Cycle Length (Days)
            </label>
            <input
              type="number"
              id="set-cycle-length"
              min="20"
              max="60"
              value="${preferences.defaultCycleLength}"
              class="w-full px-3 py-2 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm font-semibold text-[#392332]"
            />
            <span class="text-[11px] text-[#725B69] mt-1 block">ACOG typical: 28 days</span>
          </div>

          <div>
            <label class="block font-semibold uppercase text-[#725B69] mb-1">
              Default Bleeding Days
            </label>
            <input
              type="number"
              id="set-period-duration"
              min="2"
              max="15"
              value="${preferences.defaultPeriodDuration}"
              class="w-full px-3 py-2 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm font-semibold text-[#392332]"
            />
            <span class="text-[11px] text-[#725B69] mt-1 block">Typical: 4–7 days</span>
          </div>

          <div>
            <label class="block font-semibold uppercase text-[#725B69] mb-1">
              Luteal Phase (Days)
            </label>
            <input
              type="number"
              id="set-luteal-length"
              min="10"
              max="16"
              value="${preferences.lutealPhaseLength || 14}"
              class="w-full px-3 py-2 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm font-semibold text-[#392332]"
            />
            <span class="text-[11px] text-[#725B69] mt-1 block">Physiological median: 14 days</span>
          </div>
        </div>

        <div class="pt-2">
          <button id="save-cycle-prefs-btn" class="px-4 py-2 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-xl transition-colors shadow-xs">
            Save Cycle Preferences
          </button>
        </div>
      </div>

      <!-- Section 2: Privacy & Web Crypto PIN Lock -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-6 shadow-xs space-y-4">
        <div class="border-b border-[#F1D5D8] pb-3">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-base font-bold text-[#392332] flex items-center gap-2">
              ${getIcon('lock', 'w-4 h-4 text-[#A4365A]')}
              <span>Interface PIN Protection</span>
            </h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold ${preferences.pinEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-[#FFF0F5] text-[#725B69]'}">
              ${preferences.pinEnabled ? 'PIN Active' : 'Not Set'}
            </span>
          </div>
          <p class="text-xs text-[#725B69] mt-0.5">Locks this browser interface tab with Web Crypto PBKDF2 (100,000 iterations).</p>
        </div>

        <div class="p-3.5 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] text-xs text-[#725B69] space-y-1">
          <strong class="text-[#392332] block">Security Transparency Notice:</strong>
          <p>
            An interface PIN lock deters casual visual inspection or shoulder-surfing on an open device. It <em>does not</em> encrypt the underlying database files against someone with physical device root/operating-system access.
          </p>
        </div>

        ${preferences.pinEnabled ? `
          <div class="flex items-center justify-between text-xs pt-1">
            <span class="text-[#392332] font-medium">PIN verification is currently protecting this application tab.</span>
            <button id="disable-pin-btn" class="px-3 py-1.5 text-xs font-semibold text-[#FB6F92] hover:text-[#A4365A] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-xl transition-colors">
              Remove PIN Lock
            </button>
          </div>
        ` : `
          <div class="space-y-3 pt-1">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block font-semibold uppercase text-[#725B69] mb-1">New 4-to-6 Digit PIN</label>
                <input type="password" id="new-pin-input" maxlength="6" placeholder="••••" class="w-full px-3 py-2 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm font-semibold tracking-widest text-center">
              </div>
              <div>
                <label class="block font-semibold uppercase text-[#725B69] mb-1">Confirm PIN</label>
                <input type="password" id="confirm-pin-input" maxlength="6" placeholder="••••" class="w-full px-3 py-2 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm font-semibold tracking-widest text-center">
              </div>
            </div>
            <button id="enable-pin-btn" class="px-4 py-2 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-xl transition-colors shadow-xs">
              Activate PIN Lock
            </button>
          </div>
        `}
      </div>

      <!-- Section 3: Notification & Reminder Preferences -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-6 shadow-xs space-y-4">
        <div class="border-b border-[#F1D5D8] pb-3">
          <h2 class="font-display text-base font-bold text-[#392332] flex items-center gap-2">
            ${getIcon('bell', 'w-4 h-4 text-[#A4365A]')}
            <span>Reminders & Notifications</span>
          </h2>
          <p class="text-xs text-[#725B69] mt-0.5">Discreet in-app and browser notifications. Requires explicit permission.</p>
        </div>

        <div class="space-y-3 text-xs">
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" id="notif-toggle" ${preferences.notificationsEnabled ? 'checked' : ''} class="mt-0.5 accent-[#A4365A]">
            <div>
              <div class="font-semibold text-[#392332]">Enable Period & Daily Logging Reminders</div>
              <div class="text-[#725B69] mt-0.5">
                Notifications use discreet, privacy-conscious language (e.g., "Velmora: Time for your daily check-in"). Background scheduling depends on your browser staying active.
              </div>
            </div>
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label class="block font-semibold uppercase text-[#725B69] mb-1">Period Reminder</label>
              <select id="notif-days-before" class="w-full p-2 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-xs">
                <option value="1" ${preferences.periodReminderDaysBefore === 1 ? 'selected' : ''}>1 day before estimated period</option>
                <option value="2" ${preferences.periodReminderDaysBefore === 2 ? 'selected' : ''}>2 days before estimated period</option>
                <option value="3" ${preferences.periodReminderDaysBefore === 3 ? 'selected' : ''}>3 days before estimated period</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold uppercase text-[#725B69] mb-1">Daily Log Reminder Time</label>
              <input type="time" id="notif-daily-time" value="${preferences.dailyLogReminderTime || '20:00'}" class="w-full p-2 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-xs font-semibold">
            </div>
          </div>
        </div>

        <div class="pt-2">
          <button id="save-notif-btn" class="px-4 py-2 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-xl transition-colors shadow-xs">
            Save Notification Preferences
          </button>
        </div>
      </div>

      <!-- Section 4: Demo Dataset Controls -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-6 shadow-xs space-y-4">
        <div class="border-b border-[#F1D5D8] pb-3">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-base font-bold text-[#392332] flex items-center gap-2">
              ${getIcon('activity', 'w-4 h-4 text-[#A4365A]')}
              <span>Demonstration Mode</span>
            </h2>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold ${preferences.isDemoActive ? 'bg-[#F8C8DC] text-[#A4365A]' : 'bg-[#FFF0F5] text-[#725B69]'}">
              ${preferences.isDemoActive ? 'Demo Active' : 'Off'}
            </span>
          </div>
          <p class="text-xs text-[#725B69] mt-0.5">Populate sample multi-month cycle history for exploration.</p>
        </div>

        <p class="text-xs text-[#725B69] leading-relaxed">
          Demo data allows you to explore charts, interval calculations, clinical alerts, and reports without entering your own records. You can load or clear it anytime.
        </p>

        <div class="flex items-center gap-3 pt-1">
          ${preferences.isDemoActive ? `
            <button id="clear-demo-btn" class="px-4 py-2 text-xs font-semibold text-[#A4365A] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-xl transition-colors">
              Clear Demo Data & Return to Clean State
            </button>
          ` : `
            <button id="load-demo-btn" class="px-4 py-2 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-xl transition-colors shadow-xs">
              Load 4-Month Sample Dataset
            </button>
          `}
        </div>
      </div>

      <!-- Section 5: Data Backup, Restore & Reset -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-6 shadow-xs space-y-4">
        <div class="border-b border-[#F1D5D8] pb-3">
          <h2 class="font-display text-base font-bold text-[#392332] flex items-center gap-2">
            ${getIcon('download', 'w-4 h-4 text-[#A4365A]')}
            <span>Backup, Restore & Reset</span>
          </h2>
          <p class="text-xs text-[#725B69] mt-0.5">Export an offline JSON backup or completely erase records.</p>
        </div>

        <div class="space-y-4 text-xs">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
            <div>
              <div class="font-bold text-[#392332]">Export Offline Backup (.JSON)</div>
              <div class="text-[#725B69] mt-0.5">Download an unencrypted, complete archive of all periods, logs, notes, and reviews.</div>
            </div>
            <button id="export-backup-btn" class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-white hover:bg-[#FFF0F5] border border-[#F1D5D8] rounded-xl transition-colors shrink-0">
              Download JSON Backup
            </button>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FFF0F5]/50 border border-[#F1D5D8]">
            <div>
              <div class="font-bold text-[#392332]">Restore From JSON Backup</div>
              <div class="text-[#725B69] mt-0.5">Import previously exported Velmora records into this browser.</div>
            </div>
            <label class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-white hover:bg-[#FFF0F5] border border-[#F1D5D8] rounded-xl transition-colors cursor-pointer shrink-0">
              <span>Select File</span>
              <input type="file" id="import-file-input" accept=".json" class="sr-only">
            </label>
          </div>

          <div class="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
            <div class="font-bold text-rose-900">Danger Zone: Complete Data Reset</div>
            <p class="text-rose-700 leading-relaxed">
              Permanently purges all periods, daily logs, personal notes, reviews, and preferences from this browser's IndexedDB. This action cannot be undone.
            </p>
            <button id="full-reset-btn" class="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors shadow-xs">
              Permanently Erase All Data
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function bindSettingsEvents(container: HTMLElement, props: SettingsProps) {
  // Save Cycle Preferences
  container.querySelector('#save-cycle-prefs-btn')?.addEventListener('click', async () => {
    const cycleInput = container.querySelector('#set-cycle-length') as HTMLInputElement;
    const durInput = container.querySelector('#set-period-duration') as HTMLInputElement;
    const lutealInput = container.querySelector('#set-luteal-length') as HTMLInputElement;

    const updated: UserPreferences = {
      ...props.preferences,
      defaultCycleLength: parseInt(cycleInput?.value) || 28,
      defaultPeriodDuration: parseInt(durInput?.value) || 5,
      lutealPhaseLength: parseInt(lutealInput?.value) || 14
    };

    await props.onSavePreferences(updated);
  });

  // Enable PIN
  container.querySelector('#enable-pin-btn')?.addEventListener('click', async () => {
    const newPinInput = container.querySelector('#new-pin-input') as HTMLInputElement;
    const confirmPinInput = container.querySelector('#confirm-pin-input') as HTMLInputElement;
    const p1 = newPinInput?.value.trim();
    const p2 = confirmPinInput?.value.trim();

    if (!p1 || p1.length < 4) {
      alert('PIN must be at least 4 digits.');
      return;
    }
    if (p1 !== p2) {
      alert('PIN confirmation does not match.');
      return;
    }

    const salt = generateRandomSalt();
    const hash = await hashPin(p1, salt);

    const updated: UserPreferences = {
      ...props.preferences,
      pinEnabled: true,
      pinSalt: salt,
      pinHash: hash
    };

    await props.onSavePreferences(updated);
  });

  // Disable PIN
  container.querySelector('#disable-pin-btn')?.addEventListener('click', async () => {
    if (confirm('Remove PIN lock protection from this app?')) {
      const updated: UserPreferences = {
        ...props.preferences,
        pinEnabled: false,
        pinSalt: undefined,
        pinHash: undefined
      };
      await props.onSavePreferences(updated);
    }
  });

  // Notifications
  container.querySelector('#save-notif-btn')?.addEventListener('click', async () => {
    const notifToggle = container.querySelector('#notif-toggle') as HTMLInputElement;
    const daysBefore = container.querySelector('#notif-days-before') as HTMLSelectElement;
    const dailyTime = container.querySelector('#notif-daily-time') as HTMLInputElement;

    const enabled = notifToggle?.checked ?? false;

    if (enabled && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          alert('Browser notifications were not allowed. In-app reminders will still be active.');
        }
      }
    }

    const updated: UserPreferences = {
      ...props.preferences,
      notificationsEnabled: enabled,
      periodReminderDaysBefore: parseInt(daysBefore?.value) || 2,
      dailyLogReminderTime: dailyTime?.value || '20:00'
    };

    await props.onSavePreferences(updated);
  });

  // Demo toggle
  container.querySelector('#load-demo-btn')?.addEventListener('click', async () => {
    await props.onToggleDemo(true);
  });

  container.querySelector('#clear-demo-btn')?.addEventListener('click', async () => {
    await props.onToggleDemo(false);
  });

  // Export JSON backup
  container.querySelector('#export-backup-btn')?.addEventListener('click', async () => {
    await props.onExportData();
  });

  // Import JSON backup
  const importInput = container.querySelector('#import-file-input') as HTMLInputElement;
  importInput?.addEventListener('change', () => {
    const file = importInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        if (confirm('Restoring will replace your current records with the contents of this backup file. Proceed?')) {
          const success = await props.onImportData(content);
          if (success) {
            alert('Data restored successfully!');
          } else {
            alert('Failed to parse or restore backup file. Ensure it is a valid Velmora JSON file.');
          }
        }
      }
    };
    reader.readAsText(file);
  });

  // Full Reset
  container.querySelector('#full-reset-btn')?.addEventListener('click', async () => {
    const confirmation = prompt('Type RESET to permanently delete all local periods, logs, reviews, and preferences:');
    if (confirmation === 'RESET') {
      await props.onClearAllData();
      alert('All local application records have been cleared.');
    }
  });
}

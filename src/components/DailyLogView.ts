/**
 * Velmora Daily Health Log View
 * Allows recording menstrual flow, pain (0-10), symptoms, custom symptoms,
 * moods, medication notes, and deletion.
 */

import { DailyLog, FlowLevel } from '../types/index.ts';
import { getIcon } from '../utils/icons.ts';
import { formatDate } from '../services/predictions.ts';

interface DailyLogProps {
  currentDate: string; // YYYY-MM-DD
  existingLog: DailyLog | null;
  onSelectDate: (date: string) => void;
  onSaveLog: (log: DailyLog) => Promise<void>;
  onDeleteLog: (date: string) => Promise<void>;
}

const COMMON_SYMPTOMS = [
  'cramps',
  'headache',
  'bloating',
  'fatigue',
  'nausea',
  'back pain',
  'breast tenderness',
  'acne',
  'mood swings',
  'insomnia',
  'cravings',
  'constipation',
  'diarrhea'
];

const MOODS = [
  'calm',
  'happy',
  'energetic',
  'sensitive',
  'anxious',
  'irritable',
  'sad',
  'fatigued'
];

export function renderDailyLogView(props: DailyLogProps): string {
  const { currentDate, existingLog } = props;
  const todayStr = formatDate(new Date());

  const flow: FlowLevel | undefined = existingLog?.flow;
  const pain: number | undefined = existingLog?.pain;
  const symptoms: string[] = existingLog?.symptoms || [];
  const customSymptoms: string[] = existingLog?.customSymptoms || [];
  const mood: string | undefined = existingLog?.mood;
  const medications: string = existingLog?.medications || '';
  const notes: string = existingLog?.notes || '';

  return `
    <div class="space-y-6 max-w-3xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Daily Health Log</h1>
          <p class="text-sm text-[#725B69] mt-1">Track physical symptoms, flow intensity, and wellness observations.</p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-center">
          <input
            type="date"
            id="log-date-picker"
            value="${currentDate}"
            max="${todayStr}"
            class="px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFFFFF] text-sm text-[#392332] font-semibold shadow-xs"
          />
        </div>
      </div>

      <!-- Main Log Form -->
      <form id="daily-log-form" class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-6 shadow-xs space-y-6">
        
        <!-- Flow Intensity -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-bold text-[#392332] flex items-center gap-2">
              ${getIcon('droplet', 'w-4 h-4 text-[#A4365A]')}
              <span>Menstrual Flow</span>
            </label>
            <span class="text-xs text-[#725B69]">Distinguishes "none" from unrecorded</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            ${(['none', 'light', 'medium', 'heavy'] as FlowLevel[]).map(lvl => `
              <label class="flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center ${
                flow === lvl
                  ? 'bg-[#FFF0F5] border-[#A4365A] text-[#A4365A] ring-2 ring-[#A4365A]/20'
                  : 'bg-[#FFFFFF] border-[#F1D5D8] text-[#725B69] hover:bg-[#FFF8FA]'
              }">
                <input type="radio" name="flow" value="${lvl}" ${flow === lvl ? 'checked' : ''} class="sr-only">
                <span class="font-bold text-sm capitalize">${lvl}</span>
                <span class="text-[11px] mt-0.5 opacity-80">
                  ${lvl === 'none' ? 'No flow / dry' : lvl === 'light' ? 'Spotting or light' : lvl === 'medium' ? 'Standard flow' : 'Heavy absorption'}
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Pain Level (0 - 10) -->
        <div class="border-t border-[#F1D5D8] pt-6">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-bold text-[#392332] flex items-center gap-2">
              ${getIcon('activity', 'w-4 h-4 text-[#A4365A]')}
              <span>Pain & Cramping Intensity (0–10)</span>
            </label>
            <span id="pain-val-display" class="font-display font-bold text-base text-[#A4365A]">
              ${typeof pain === 'number' ? `${pain} / 10` : 'None logged'}
            </span>
          </div>

          <p class="text-xs text-[#725B69] mb-3">
            0 = No discomfort · 1–3 = Mild · 4–6 = Moderate cramping · 7–9 = Severe pain · 10 = Disabling
          </p>

          <input
            type="range"
            id="pain-slider"
            min="0"
            max="10"
            step="1"
            value="${typeof pain === 'number' ? pain : 0}"
            class="w-full accent-[#A4365A] cursor-pointer"
          />

          <div class="flex justify-between text-[11px] text-[#725B69] font-medium px-1 mt-1">
            <span>0 (None)</span>
            <span>2</span>
            <span>4 (Moderate)</span>
            <span>6</span>
            <span>8 (Severe)</span>
            <span>10 (Disabling)</span>
          </div>
        </div>

        <!-- Physical Symptoms Multi-select -->
        <div class="border-t border-[#F1D5D8] pt-6">
          <label class="text-sm font-bold text-[#392332] flex items-center gap-2 mb-2">
            ${getIcon('heart', 'w-4 h-4 text-[#A4365A]')}
            <span>Physical Symptoms</span>
          </label>

          <div class="flex flex-wrap gap-2 pt-1" id="symptoms-container">
            ${COMMON_SYMPTOMS.map(s => {
              const isChecked = symptoms.includes(s);
              return `
                <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-[#FFF0F5] border-[#A4365A] text-[#A4365A] font-semibold'
                    : 'bg-[#FFFFFF] border-[#F1D5D8] text-[#725B69] hover:bg-[#FFF8FA]'
                }">
                  <input type="checkbox" name="symptoms" value="${s}" ${isChecked ? 'checked' : ''} class="sr-only">
                  <span class="capitalize">${s}</span>
                </label>
              `;
            }).join('')}

            ${customSymptoms.map(cs => `
              <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-[#FFF0F5] border-[#A4365A] text-[#A4365A] text-xs font-semibold cursor-pointer">
                <input type="checkbox" name="custom-symptoms" value="${cs}" checked class="sr-only">
                <span class="capitalize">${cs}</span>
                <span class="text-[10px] ml-1 opacity-70">✕</span>
              </label>
            `).join('')}
          </div>

          <!-- Add Custom Symptom Input -->
          <div class="flex items-center gap-2 mt-3 max-w-sm">
            <input
              type="text"
              id="custom-symptom-input"
              placeholder="Add other symptom (e.g. migraine)"
              class="flex-1 px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30 text-xs focus:bg-white focus:border-[#A4365A]"
            />
            <button
              type="button"
              id="add-custom-symptom-btn"
              class="px-3 py-1.5 text-xs font-semibold text-[#A4365A] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <!-- Mood Selector -->
        <div class="border-t border-[#F1D5D8] pt-6">
          <label class="text-sm font-bold text-[#392332] block mb-2">Mood & Energy</label>
          <div class="flex flex-wrap gap-2">
            ${MOODS.map(m => `
              <label class="px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                mood === m
                  ? 'bg-[#A4365A] text-white border-[#A4365A] font-semibold shadow-xs'
                  : 'bg-[#FFFFFF] border-[#F1D5D8] text-[#725B69] hover:bg-[#FFF8FA]'
              }">
                <input type="radio" name="mood" value="${m}" ${mood === m ? 'checked' : ''} class="sr-only">
                <span class="capitalize">${m}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Medications & Relief -->
        <div class="border-t border-[#F1D5D8] pt-6 space-y-4">
          <div>
            <label class="text-xs font-semibold uppercase text-[#725B69] block mb-1">
              Medications & Treatments Used
            </label>
            <input
              type="text"
              id="log-medications"
              value="${medications}"
              placeholder="e.g. Ibuprofen 400mg with breakfast, Heating pad"
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm focus:border-[#A4365A] focus:bg-white"
            />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase text-[#725B69] block mb-1">
              Personal Notes
            </label>
            <textarea
              id="log-notes"
              rows="3"
              placeholder="Notes on activity, stress, cervical fluid, sleep, or wellness observations..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 text-sm focus:border-[#A4365A] focus:bg-white resize-none"
            >${notes}</textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-6 border-t border-[#F1D5D8]">
          ${existingLog ? `
            <button
              type="button"
              id="log-delete-btn"
              class="px-4 py-2 text-xs font-semibold text-[#FB6F92] hover:text-[#A4365A] hover:bg-[#FFF0F5] rounded-xl transition-colors"
            >
              Delete This Entry
            </button>
          ` : '<div></div>'}

          <div class="flex items-center gap-3">
            <button
              type="submit"
              id="log-save-btn"
              class="px-6 py-2.5 text-sm font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] active:bg-[#72223C] rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              ${getIcon('check', 'w-4 h-4')}
              <span>Save Entry</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  `;
}

export function bindDailyLogEvents(container: HTMLElement, props: DailyLogProps) {
  // Date picker listener
  const datePicker = container.querySelector('#log-date-picker') as HTMLInputElement;
  if (datePicker) {
    datePicker.addEventListener('change', () => {
      props.onSelectDate(datePicker.value);
    });
  }

  // Pain slider visual update
  const painSlider = container.querySelector('#pain-slider') as HTMLInputElement;
  const painDisplay = container.querySelector('#pain-val-display') as HTMLElement;
  if (painSlider && painDisplay) {
    painSlider.addEventListener('input', () => {
      const v = parseInt(painSlider.value);
      painDisplay.textContent = `${v} / 10`;
    });
  }

  // Radio styling updates for flow & mood
  container.querySelectorAll('input[name="flow"]').forEach(radio => {
    radio.addEventListener('change', () => {
      container.querySelectorAll('input[name="flow"]').forEach(r => {
        const label = r.closest('label');
        if (label) {
          if ((r as HTMLInputElement).checked) {
            label.className = 'flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center bg-[#FFF0F5] border-[#A4365A] text-[#A4365A] ring-2 ring-[#A4365A]/20';
          } else {
            label.className = 'flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center bg-[#FFFFFF] border-[#F1D5D8] text-[#725B69] hover:bg-[#FFF8FA]';
          }
        }
      });
    });
  });

  container.querySelectorAll('input[name="mood"]').forEach(radio => {
    radio.addEventListener('change', () => {
      container.querySelectorAll('input[name="mood"]').forEach(r => {
        const label = r.closest('label');
        if (label) {
          if ((r as HTMLInputElement).checked) {
            label.className = 'px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors bg-[#A4365A] text-white border-[#A4365A] shadow-xs';
          } else {
            label.className = 'px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors bg-[#FFFFFF] border-[#F1D5D8] text-[#725B69] hover:bg-[#FFF8FA]';
          }
        }
      });
    });
  });

  // Symptoms toggle styling
  container.querySelectorAll('input[name="symptoms"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const label = checkbox.closest('label');
      if (label) {
        if ((checkbox as HTMLInputElement).checked) {
          label.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors bg-[#FFF0F5] border-[#A4365A] text-[#A4365A]';
        } else {
          label.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors bg-[#FFFFFF] border-[#F1D5D8] text-[#725B69] hover:bg-[#FFF8FA]';
        }
      }
    });
  });

  // Custom symptom addition
  const customInput = container.querySelector('#custom-symptom-input') as HTMLInputElement;
  const addCustomBtn = container.querySelector('#add-custom-symptom-btn');
  const symptomsContainer = container.querySelector('#symptoms-container');

  const addCustom = () => {
    const val = customInput?.value.trim().toLowerCase();
    if (!val) return;

    const label = document.createElement('label');
    label.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-[#FFF0F5] border-[#A4365A] text-[#A4365A] text-xs font-semibold cursor-pointer';
    label.innerHTML = `
      <input type="checkbox" name="custom-symptoms" value="${val}" checked class="sr-only">
      <span class="capitalize">${val}</span>
      <span class="text-[10px] ml-1 opacity-70">✕</span>
    `;

    label.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).tagName !== 'INPUT') {
        label.remove();
      }
    });

    symptomsContainer?.appendChild(label);
    if (customInput) customInput.value = '';
  };

  addCustomBtn?.addEventListener('click', addCustom);
  customInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  });

  // Delete Log
  container.querySelector('#log-delete-btn')?.addEventListener('click', async () => {
    if (confirm(`Delete the health log for ${props.currentDate}?`)) {
      await props.onDeleteLog(props.currentDate);
    }
  });

  // Form submit
  const form = container.querySelector('#daily-log-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const flowSelected = (form.querySelector('input[name="flow"]:checked') as HTMLInputElement)?.value as FlowLevel | undefined;
    const painVal = parseInt((form.querySelector('#pain-slider') as HTMLInputElement)?.value) || 0;

    const symptomsSelected: string[] = [];
    form.querySelectorAll<HTMLInputElement>('input[name="symptoms"]:checked').forEach(c => {
      symptomsSelected.push(c.value);
    });

    const customSelected: string[] = [];
    form.querySelectorAll<HTMLInputElement>('input[name="custom-symptoms"]:checked').forEach(c => {
      customSelected.push(c.value);
    });

    const moodSelected = (form.querySelector('input[name="mood"]:checked') as HTMLInputElement)?.value;
    const medicationsVal = (form.querySelector('#log-medications') as HTMLInputElement)?.value.trim();
    const notesVal = (form.querySelector('#log-notes') as HTMLTextAreaElement)?.value.trim();

    const logEntry: DailyLog = {
      date: props.currentDate,
      flow: flowSelected,
      pain: painVal,
      symptoms: symptomsSelected,
      customSymptoms: customSelected,
      mood: moodSelected,
      medications: medicationsVal || undefined,
      notes: notesVal || undefined,
      updatedAt: Date.now()
    };

    const saveBtn = container.querySelector('#log-save-btn') as HTMLButtonElement;
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    try {
      await props.onSaveLog(logEntry);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `${getIcon('check', 'w-4 h-4')}<span>Saved</span>`;
        setTimeout(() => {
          saveBtn.innerHTML = `${getIcon('check', 'w-4 h-4')}<span>Save Entry</span>`;
        }, 1500);
      }
    }
  });
}

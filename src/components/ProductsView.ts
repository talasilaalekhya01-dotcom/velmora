/**
 * Velmora Period Products Guide & Personal Reviews View
 * Objective, sourced guides for 6 menstrual care items,
 * personal rating & comfort evaluation, with zero e-commerce/shopping clutter.
 */

import { ProductReview } from '../types/index.ts';
import { PERIOD_PRODUCTS } from '../services/productData.ts';
import { getIcon } from '../utils/icons.ts';

interface ProductsProps {
  userReviews: Record<string, ProductReview>;
  onSaveReview: (review: ProductReview) => Promise<void>;
}

export function renderProductsView(props: ProductsProps): string {
  const { userReviews } = props;

  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Period Products Guide</h1>
          <p class="text-sm text-[#725B69] mt-1">Objective information, safety guidelines, and your personal product reviews.</p>
        </div>
      </div>

      <!-- Educational Notice -->
      <div class="p-4 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] text-xs text-[#725B69] space-y-1">
        <div class="flex items-center gap-1.5 font-bold text-[#392332]">
          ${getIcon('info', 'w-4 h-4 text-[#A4365A]')}
          <span>Unbiased Health Guidance</span>
        </div>
        <p class="leading-relaxed">
          Velmora does not sell products or accept affiliate compensation. Wear times and TSS safety guidelines are verified against FDA and NHS clinical standards.
        </p>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        ${PERIOD_PRODUCTS.map(product => {
          const review = userReviews[product.id];
          return `
            <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs flex flex-col justify-between space-y-4">
              
              <div class="space-y-3">
                <!-- Header -->
                <div class="flex items-start justify-between gap-2 border-b border-[#F1D5D8] pb-3">
                  <div>
                    <h3 class="font-display text-lg font-bold text-[#392332]">${product.name}</h3>
                    <span class="text-xs font-semibold text-[#A4365A] uppercase tracking-wider">${product.category}</span>
                  </div>
                  <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    product.ecoImpact === 'Low' ? 'bg-emerald-50 text-emerald-700' :
                    product.ecoImpact === 'Moderate' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  }">
                    ${product.ecoImpact} Eco Footprint
                  </span>
                </div>

                <p class="text-xs text-[#725B69] leading-relaxed">
                  ${product.description}
                </p>

                <!-- Key Metrics Strip -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="p-2.5 rounded-lg bg-[#FFF0F5]/50 border border-[#F1D5D8]">
                    <span class="text-[11px] uppercase font-semibold text-[#725B69] block">Wear Time</span>
                    <span class="font-bold text-[#392332] mt-0.5 block">${product.wearTime}</span>
                  </div>
                  <div class="p-2.5 rounded-lg bg-[#FFF0F5]/50 border border-[#F1D5D8]">
                    <span class="text-[11px] uppercase font-semibold text-[#725B69] block">TSS Risk Level</span>
                    <span class="font-bold text-[#392332] mt-0.5 block">${product.tssRisk}</span>
                  </div>
                </div>

                <!-- Pros & Cons -->
                <div class="space-y-2 text-xs">
                  <div>
                    <span class="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block mb-1">Advantages</span>
                    <ul class="space-y-1 text-[#392332] pl-3 list-disc marker:text-emerald-500">
                      ${product.pros.map(pro => `<li>${pro}</li>`).join('')}
                    </ul>
                  </div>

                  <div class="pt-1">
                    <span class="font-bold text-rose-800 text-[11px] uppercase tracking-wider block mb-1">Considerations</span>
                    <ul class="space-y-1 text-[#392332] pl-3 list-disc marker:text-rose-400">
                      ${product.cons.map(con => `<li>${con}</li>`).join('')}
                    </ul>
                  </div>
                </div>

                <!-- Care & Disposal -->
                <div class="text-xs p-3 rounded-xl bg-[#FFF8FA] border border-[#F1D5D8] text-[#725B69]">
                  <strong class="text-[#392332] block mb-0.5">Care & Disposal:</strong>
                  ${product.careAndDisposal}
                </div>

                <!-- Personal Review Display (if reviewed) -->
                ${review ? `
                  <div class="p-3 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] space-y-1.5 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-[#A4365A]">Your Personal Review:</span>
                      <span class="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-[#392332] border border-[#F1D5D8]">
                        ${review.personalVerdict}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-[11px] text-[#725B69]">
                      <span>Overall: <strong>${review.rating}/5★</strong></span>
                      <span>Comfort: <strong>${review.comfort}/5</strong></span>
                      <span>Leak Protection: <strong>${review.leakProtection}/5</strong></span>
                    </div>
                    ${review.notes ? `
                      <p class="italic text-[#392332] pt-0.5">"${review.notes}"</p>
                    ` : ''}
                  </div>
                ` : ''}
              </div>

              <!-- Review Trigger Button -->
              <div class="pt-3 border-t border-[#F1D5D8]">
                <button
                  data-open-product-review="${product.id}"
                  class="w-full py-2 px-3 text-xs font-semibold text-[#A4365A] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-xl transition-colors text-center"
                >
                  ${review ? 'Edit Your Review' : '+ Add Personal Review & Notes'}
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>

      <!-- Product Review Modal -->
      <div id="product-review-modal" class="fixed inset-0 z-50 bg-[#392332]/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#F1D5D8] p-6 max-w-md w-full space-y-4 shadow-2xl">
          <div class="flex items-center justify-between border-b border-[#F1D5D8] pb-3">
            <div>
              <h3 class="font-display text-base font-bold text-[#392332]" id="prod-review-title">Product Review</h3>
              <span class="text-xs text-[#725B69]">Saved privately on your device</span>
            </div>
            <button id="close-prod-modal-btn" class="p-1 rounded-lg text-[#725B69] hover:bg-[#FFF0F5]">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-[#725B69] mb-1">Overall Rating (1–5)</label>
              <select id="prod-rating-select" class="w-full p-2 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30 text-xs">
                <option value="5">5 ★★★★★ (Exceptional)</option>
                <option value="4">4 ★★★★☆ (Good)</option>
                <option value="3">3 ★★★☆☆ (Acceptable)</option>
                <option value="2">2 ★★☆☆☆ (Needs improvement)</option>
                <option value="1">1 ★☆☆☆☆ (Did not work for me)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-[#725B69] mb-1">Comfort (1–5)</label>
                <select id="prod-comfort-select" class="w-full p-2 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30 text-xs">
                  <option value="5">5 - Very comfortable</option>
                  <option value="4">4 - Comfortable</option>
                  <option value="3">3 - Moderate</option>
                  <option value="2">2 - Uncomfortable</option>
                  <option value="1">1 - Irritating</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-[#725B69] mb-1">Leak Protection (1–5)</label>
                <select id="prod-leak-select" class="w-full p-2 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30 text-xs">
                  <option value="5">5 - Zero leaks</option>
                  <option value="4">4 - High security</option>
                  <option value="3">3 - Adequate</option>
                  <option value="2">2 - Minor leaks</option>
                  <option value="1">1 - Frequent leaks</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-[#725B69] mb-1">Your Personal Verdict</label>
              <select id="prod-verdict-select" class="w-full p-2 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30 text-xs">
                <option value="Regular choice">Regular choice</option>
                <option value="Backup option">Backup option</option>
                <option value="Not for me">Not for me</option>
                <option value="Want to try">Want to try</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-[#725B69] mb-1">Personal Experience & Sizing Notes</label>
              <textarea id="prod-notes-text" rows="3" placeholder="Specific brands tried, cup firmness, learning curve, comfort on heavy days..." class="w-full p-2.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30 resize-none"></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-[#F1D5D8]">
            <button id="cancel-prod-modal-btn" class="px-3 py-1.5 text-xs text-[#725B69] hover:text-[#392332]">
              Cancel
            </button>
            <button id="save-prod-modal-btn" class="px-4 py-1.5 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-lg">
              Save Review
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function bindProductsEvents(container: HTMLElement, props: ProductsProps) {
  let activeProductId = '';

  const modal = container.querySelector('#product-review-modal') as HTMLElement;
  const title = container.querySelector('#prod-review-title') as HTMLElement;
  const ratingSelect = container.querySelector('#prod-rating-select') as HTMLSelectElement;
  const comfortSelect = container.querySelector('#prod-comfort-select') as HTMLSelectElement;
  const leakSelect = container.querySelector('#prod-leak-select') as HTMLSelectElement;
  const verdictSelect = container.querySelector('#prod-verdict-select') as HTMLSelectElement;
  const notesText = container.querySelector('#prod-notes-text') as HTMLTextAreaElement;

  const openModal = (prodId: string) => {
    activeProductId = prodId;
    const prod = PERIOD_PRODUCTS.find(p => p.id === prodId);
    const existing = props.userReviews[prodId];

    if (title && prod) title.textContent = `Review: ${prod.name}`;
    if (ratingSelect) ratingSelect.value = String(existing?.rating || 5);
    if (comfortSelect) comfortSelect.value = String(existing?.comfort || 4);
    if (leakSelect) leakSelect.value = String(existing?.leakProtection || 4);
    if (verdictSelect) verdictSelect.value = existing?.personalVerdict || 'Regular choice';
    if (notesText) notesText.value = existing?.notes || '';

    if (modal) modal.classList.remove('hidden');
  };

  const closeModal = () => {
    if (modal) modal.classList.add('hidden');
    activeProductId = '';
  };

  container.querySelector('#close-prod-modal-btn')?.addEventListener('click', closeModal);
  container.querySelector('#cancel-prod-modal-btn')?.addEventListener('click', closeModal);

  container.querySelectorAll<HTMLButtonElement>('button[data-open-product-review]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open-product-review');
      if (id) openModal(id);
    });
  });

  container.querySelector('#save-prod-modal-btn')?.addEventListener('click', async () => {
    if (!activeProductId) return;

    const review: ProductReview = {
      productId: activeProductId,
      rating: parseInt(ratingSelect?.value) || 5,
      comfort: parseInt(comfortSelect?.value) || 4,
      leakProtection: parseInt(leakSelect?.value) || 4,
      personalVerdict: (verdictSelect?.value as any) || 'Regular choice',
      notes: notesText?.value.trim() || '',
      updatedAt: Date.now()
    };

    await props.onSaveReview(review);
    closeModal();
  });
}

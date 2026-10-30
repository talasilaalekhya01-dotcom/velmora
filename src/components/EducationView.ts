/**
 * Velmora Health Education View
 * Curated, evidence-based articles with ACOG/NHS sources and October 2026 review date.
 */

import { EducationArticle } from '../types/index.ts';
import { EDUCATION_ARTICLES } from '../services/educationData.ts';
import { getIcon } from '../utils/icons.ts';

interface EducationProps {
  selectedArticleId?: string;
  onSelectArticle: (id?: string) => void;
}

export function renderEducationView(props: EducationProps): string {
  const { selectedArticleId } = props;

  // If viewing a specific article
  if (selectedArticleId) {
    const article = EDUCATION_ARTICLES.find(a => a.id === selectedArticleId);
    if (article) {
      return renderArticleReader(article);
    }
  }

  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Health Education & Science</h1>
          <p class="text-sm text-[#725B69] mt-1">Reliable, peer-reviewed clinical knowledge about cycles, symptoms, and reproductive wellness.</p>
        </div>
      </div>

      <!-- Trust & Attribution Banner -->
      <div class="p-4 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] text-xs text-[#725B69] space-y-1">
        <div class="flex items-center gap-1.5 font-bold text-[#392332]">
          ${getIcon('book-open', 'w-4 h-4 text-[#A4365A]')}
          <span>Clinical Review Commitment</span>
        </div>
        <p class="leading-relaxed">
          All educational materials are curated directly from peer-reviewed clinical standards (including ACOG, NHS, CDC, and WHO). Articles reflect physiological science without commercial product endorsements. <strong>Last reviewed: October 2026</strong>.
        </p>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto text-xs" id="edu-category-filters">
        <button data-edu-cat="all" class="px-3 py-1.5 rounded-lg bg-[#A4365A] text-white font-semibold">All Topics</button>
        <button data-edu-cat="Fundamentals" class="px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFFFFF] hover:bg-[#FFF0F5] text-[#392332] font-medium">Cycle Fundamentals</button>
        <button data-edu-cat="Symptoms & Care" class="px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFFFFF] hover:bg-[#FFF0F5] text-[#392332] font-medium">Symptoms & Care</button>
        <button data-edu-cat="Products & Hygiene" class="px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFFFFF] hover:bg-[#FFF0F5] text-[#392332] font-medium">Hygiene & Safety</button>
        <button data-edu-cat="Privacy & Science" class="px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFFFFF] hover:bg-[#FFF0F5] text-[#392332] font-medium">Privacy & Science</button>
      </div>

      <!-- Articles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="edu-articles-container">
        ${EDUCATION_ARTICLES.map(art => renderArticleCard(art)).join('')}
      </div>

    </div>
  `;
}

function renderArticleCard(art: EducationArticle): string {
  return `
    <div
      data-article-card-id="${art.id}"
      data-category="${art.category}"
      class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-5 shadow-xs flex flex-col justify-between hover:border-[#FB6F92] transition-colors cursor-pointer group"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs text-[#725B69]">
          <span class="font-semibold text-[#A4365A]">${art.category}</span>
          <span>${art.readTime}</span>
        </div>

        <h3 class="font-display text-lg font-bold text-[#392332] group-hover:text-[#A4365A] transition-colors leading-snug">
          ${art.title}
        </h3>

        <p class="text-xs text-[#725B69] leading-relaxed line-clamp-3">
          ${art.summary}
        </p>
      </div>

      <div class="pt-4 border-t border-[#F1D5D8] flex items-center justify-between text-xs text-[#725B69] mt-4">
        <span>Reviewed: ${art.lastReviewed}</span>
        <span class="font-semibold text-[#A4365A] group-hover:underline flex items-center gap-1">
          Read Guide &rarr;
        </span>
      </div>
    </div>
  `;
}

function renderArticleReader(article: EducationArticle): string {
  return `
    <div class="space-y-6 max-w-3xl mx-auto">
      
      <!-- Back Link -->
      <div>
        <button id="edu-back-btn" class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A4365A] hover:underline">
          ${getIcon('chevron-left', 'w-4 h-4')}
          <span>Back to All Articles</span>
        </button>
      </div>

      <!-- Article Shell -->
      <article class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-6 sm:p-10 shadow-xs space-y-6">
        
        <header class="space-y-3 border-b border-[#F1D5D8] pb-6">
          <div class="flex items-center gap-3 text-xs text-[#725B69]">
            <span class="font-semibold text-[#A4365A] uppercase tracking-wider">${article.category}</span>
            <span>·</span>
            <span>${article.readTime}</span>
            <span>·</span>
            <span>Last reviewed ${article.lastReviewed}</span>
          </div>

          <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-[#392332] leading-tight">
            ${article.title}
          </h1>

          <p class="text-sm text-[#725B69] leading-relaxed italic bg-[#FFF0F5]/50 p-3 rounded-xl border border-[#F1D5D8]">
            ${article.summary}
          </p>
        </header>

        <!-- Markdown / HTML Content -->
        <div class="prose text-sm text-[#392332] space-y-4 leading-relaxed">
          ${formatMarkdownBody(article.contentMarkdown)}
        </div>

        <!-- Verified Sources & Citations -->
        <footer class="pt-6 border-t border-[#F1D5D8] space-y-2 text-xs">
          <div class="font-bold text-[#392332] flex items-center gap-1.5">
            ${getIcon('shield-check', 'w-4 h-4 text-[#A4365A]')}
            <span>Verified Clinical Citations & Authorities</span>
          </div>
          <ul class="space-y-1.5 text-[#725B69] pl-3 list-disc marker:text-[#A4365A]">
            ${article.sources.map(src => `
              <li>
                <a href="${src.url}" target="_blank" rel="noopener noreferrer" class="hover:text-[#A4365A] underline">
                  ${src.title}
                </a>
              </li>
            `).join('')}
          </ul>
        </footer>

      </article>

    </div>
  `;
}

function formatMarkdownBody(md: string): string {
  // Simple clean markdown parser for headings, lists, bold text
  return md
    .trim()
    .replace(/^### (.*$)/gim, '<h3 class="font-display text-base font-bold text-[#392332] mt-5 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="font-display text-lg font-bold text-[#392332] mt-6 mb-2 border-b border-[#F1D5D8] pb-1">$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-[#392332]">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc marker:text-[#FB6F92]">$1</li>')
    .replace(/\n\n/gim, '</p><p class="text-sm leading-relaxed text-[#392332] mt-2 mb-2">');
}

export function bindEducationEvents(container: HTMLElement, props: EducationProps) {
  // Card click to read
  container.querySelectorAll<HTMLElement>('[data-article-card-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-article-card-id');
      if (id) props.onSelectArticle(id);
    });
  });

  // Back button
  container.querySelector('#edu-back-btn')?.addEventListener('click', () => {
    props.onSelectArticle(undefined);
  });

  // Category filter buttons
  container.querySelectorAll<HTMLButtonElement>('#edu-category-filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll<HTMLButtonElement>('#edu-category-filters button').forEach(b => {
        b.className = 'px-3 py-1.5 rounded-lg border border-[#F1D5D8] bg-[#FFFFFF] hover:bg-[#FFF0F5] text-[#392332] font-medium';
      });
      btn.className = 'px-3 py-1.5 rounded-lg bg-[#A4365A] text-white font-semibold';

      const cat = btn.getAttribute('data-edu-cat');
      const cards = container.querySelectorAll<HTMLElement>('[data-article-card-id]');
      cards.forEach(c => {
        if (cat === 'all' || c.getAttribute('data-category') === cat) {
          c.classList.remove('hidden');
        } else {
          c.classList.add('hidden');
        }
      });
    });
  });
}

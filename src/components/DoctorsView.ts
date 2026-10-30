/**
 * Velmora Find Doctors & Healthcare Facilities View
 * Interactive Leaflet Map + facility list, Nominatim geocoder,
 * Overpass API integration, and local private facility notes.
 */

import L from 'leaflet';
import { HealthcareFacility, FacilityReview } from '../types/index.ts';
import { getIcon } from '../utils/icons.ts';
import {
  fetchNearbyHealthcare,
  geocodeLocality,
  FALLBACK_FACILITIES
} from '../services/overpass.ts';

interface DoctorsProps {
  userReviews: Record<string, FacilityReview>;
  onSaveReview: (review: FacilityReview) => Promise<void>;
  onDeleteReview: (facilityId: string) => Promise<void>;
}

let mapInstance: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;

export function renderDoctorsView(props: DoctorsProps): string {
  return `
    <div class="space-y-6 max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F1D5D8]">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#392332]">Find Healthcare & Clinics</h1>
          <p class="text-sm text-[#725B69] mt-1">Locate nearby clinics, hospitals, and gynecological care.</p>
        </div>
      </div>

      <!-- Privacy & External Service Notice -->
      <div class="p-4 rounded-xl bg-[#FFF0F5] border border-[#F1D5D8] text-xs text-[#725B69] space-y-1">
        <div class="flex items-center gap-1.5 font-bold text-[#392332]">
          ${getIcon('shield', 'w-4 h-4 text-[#A4365A]')}
          <span>Privacy & External Map Policy</span>
        </div>
        <p class="leading-relaxed">
          Locality searches query OpenStreetMap (Nominatim & Overpass). <strong>Only your searched city/coordinates are sent</strong>. Your menstrual cycle records, health logs, and personal notes are never transmitted.
        </p>
      </div>

      <!-- Search & Filter Controls -->
      <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-4 shadow-xs space-y-3">
        <div class="flex flex-col sm:flex-row gap-2">
          
          <div class="flex-1 relative">
            <span class="absolute left-3 top-2.5 text-[#725B69]">
              ${getIcon('search', 'w-4 h-4')}
            </span>
            <input
              type="text"
              id="clinic-search-input"
              placeholder="Search by city, town, or zip code (e.g., Seattle, Austin, 94103)..."
              class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 focus:bg-white focus:border-[#A4365A]"
            />
          </div>

          <button
            id="clinic-search-btn"
            class="px-4 py-2 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-xl transition-colors whitespace-nowrap"
          >
            Search Locality
          </button>

          <button
            id="clinic-locate-btn"
            class="px-3.5 py-2 text-xs font-semibold text-[#392332] bg-[#FFF0F5] hover:bg-[#F8C8DC] border border-[#F1D5D8] rounded-xl transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            ${getIcon('locate', 'w-3.5 h-3.5 text-[#A4365A]')}
            <span>Use My Location</span>
          </button>

        </div>

        <!-- Category Filters -->
        <div class="flex items-center gap-2 pt-1 overflow-x-auto text-xs" id="facility-filters">
          <button data-filter="all" class="px-3 py-1 rounded-lg font-semibold bg-[#A4365A] text-white">All Facilities</button>
          <button data-filter="Gynecology" class="px-3 py-1 rounded-lg font-medium bg-[#FFF0F5] text-[#725B69] hover:text-[#392332] border border-[#F1D5D8]">Gynecology & Women's Health</button>
          <button data-filter="Clinic" class="px-3 py-1 rounded-lg font-medium bg-[#FFF0F5] text-[#725B69] hover:text-[#392332] border border-[#F1D5D8]">Clinics</button>
          <button data-filter="Hospital" class="px-3 py-1 rounded-lg font-medium bg-[#FFF0F5] text-[#725B69] hover:text-[#392332] border border-[#F1D5D8]">Hospitals & Urgent Care</button>
        </div>
      </div>

      <!-- Map & List Split View -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        <!-- Interactive Leaflet Map Container -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-3 shadow-xs">
          <div id="leaflet-map-container" class="w-full h-80 sm:h-[450px] rounded-xl overflow-hidden bg-[#FFF0F5]"></div>
          <div class="text-[10px] text-[#725B69] text-center mt-2">
            Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" class="underline">OpenStreetMap</a> contributors.
          </div>
        </div>

        <!-- Facility List Container -->
        <div class="bg-[#FFFFFF] rounded-2xl border border-[#F1D5D8] p-4 shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#F1D5D8]">
            <h3 class="font-display text-sm font-bold text-[#392332]" id="facility-count-heading">
              Available Facilities
            </h3>
            <span class="text-xs text-[#725B69]">Tap a facility for details</span>
          </div>

          <div id="facilities-list-container" class="max-h-[420px] overflow-y-auto space-y-2.5 pr-1">
            <div class="p-6 text-center text-xs text-[#725B69]">
              Loading healthcare facilities...
            </div>
          </div>
        </div>

      </div>

      <!-- Personal Review & Note Modal -->
      <div id="facility-review-modal" class="fixed inset-0 z-50 bg-[#392332]/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#F1D5D8] p-6 max-w-md w-full space-y-4 shadow-2xl">
          <div class="flex items-center justify-between border-b border-[#F1D5D8] pb-3">
            <div>
              <h3 class="font-display text-base font-bold text-[#392332]" id="review-facility-title">Facility Notes</h3>
              <span class="text-xs text-[#725B69]">Personal private review stored in this browser</span>
            </div>
            <button id="close-review-modal-btn" class="p-1 rounded-lg text-[#725B69] hover:bg-[#FFF0F5]">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-[#725B69] mb-1">Your Rating</label>
              <div class="flex items-center gap-1 text-amber-400" id="star-rating-selector">
                ${[1, 2, 3, 4, 5].map(star => `
                  <button type="button" data-star="${star}" class="p-1 hover:scale-110 transition-transform">
                    ${getIcon('star', 'w-5 h-5 fill-current')}
                  </button>
                `).join('')}
              </div>
            </div>

            <div>
              <label class="block font-semibold text-[#725B69] mb-1">Visit Date (Optional)</label>
              <input type="date" id="review-visit-date" class="w-full p-2 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30">
            </div>

            <div>
              <label class="block font-semibold text-[#725B69] mb-1">Personal Notes & Practitioner Experience</label>
              <textarea id="review-notes-text" rows="3" placeholder="Doctor name, wait time, listening quality, appointment notes..." class="w-full p-2.5 rounded-lg border border-[#F1D5D8] bg-[#FFF0F5]/30 resize-none"></textarea>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-[#F1D5D8]">
            <button id="delete-review-btn" class="text-xs text-[#FB6F92] hover:text-[#A4365A] font-semibold hidden">
              Delete Note
            </button>
            <div class="flex gap-2 ml-auto">
              <button id="cancel-review-btn" class="px-3 py-1.5 text-xs text-[#725B69] hover:text-[#392332]">
                Cancel
              </button>
              <button id="save-review-btn" class="px-4 py-1.5 text-xs font-semibold text-white bg-[#A4365A] hover:bg-[#8A2B49] rounded-lg">
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function initDoctorsMap(container: HTMLElement, props: DoctorsProps) {
  const mapEl = container.querySelector('#leaflet-map-container') as HTMLElement;
  if (!mapEl) return;

  // Cleanup prior map
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  let currentLat = 37.7749; // Default San Francisco
  let currentLon = -122.4194;
  let activeFacilities: HealthcareFacility[] = [...FALLBACK_FACILITIES];
  let activeFilter = 'all';

  // Initialize Leaflet Map
  mapInstance = L.map(mapEl).setView([currentLat, currentLon], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);

  // Review modal state
  let currentFacilityForReview: HealthcareFacility | null = null;
  let selectedRating = 5;

  const reviewModal = container.querySelector('#facility-review-modal') as HTMLElement;
  const reviewTitle = container.querySelector('#review-facility-title') as HTMLElement;
  const visitDateInput = container.querySelector('#review-visit-date') as HTMLInputElement;
  const notesTextInput = container.querySelector('#review-notes-text') as HTMLTextAreaElement;
  const deleteReviewBtn = container.querySelector('#delete-review-btn') as HTMLButtonElement;

  const openReviewModal = (facility: HealthcareFacility) => {
    currentFacilityForReview = facility;
    const existing = props.userReviews[facility.id];
    selectedRating = existing?.rating || 5;

    if (reviewTitle) reviewTitle.textContent = `Notes on ${facility.name}`;
    if (visitDateInput) visitDateInput.value = existing?.visitedDate || '';
    if (notesTextInput) notesTextInput.value = existing?.notes || '';
    if (deleteReviewBtn) deleteReviewBtn.classList.toggle('hidden', !existing);

    updateStarVisuals();
    if (reviewModal) reviewModal.classList.remove('hidden');
  };

  const closeReviewModal = () => {
    if (reviewModal) reviewModal.classList.add('hidden');
    currentFacilityForReview = null;
  };

  const updateStarVisuals = () => {
    const starBtns = container.querySelectorAll<HTMLButtonElement>('#star-rating-selector button');
    starBtns.forEach((btn, idx) => {
      const starVal = idx + 1;
      if (starVal <= selectedRating) {
        btn.className = 'p-1 text-amber-500 hover:scale-110 transition-transform';
      } else {
        btn.className = 'p-1 text-slate-300 hover:scale-110 transition-transform';
      }
    });
  };

  container.querySelectorAll<HTMLButtonElement>('#star-rating-selector button').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-star') || '5');
      selectedRating = val;
      updateStarVisuals();
    });
  });

  container.querySelector('#close-review-modal-btn')?.addEventListener('click', closeReviewModal);
  container.querySelector('#cancel-review-btn')?.addEventListener('click', closeReviewModal);

  container.querySelector('#save-review-btn')?.addEventListener('click', async () => {
    if (!currentFacilityForReview) return;
    const review: FacilityReview = {
      facilityId: currentFacilityForReview.id,
      facilityName: currentFacilityForReview.name,
      rating: selectedRating,
      visitedDate: visitDateInput?.value || undefined,
      notes: notesTextInput?.value.trim() || '',
      updatedAt: Date.now()
    };
    await props.onSaveReview(review);
    closeReviewModal();
    renderFacilityList();
  });

  container.querySelector('#delete-review-btn')?.addEventListener('click', async () => {
    if (!currentFacilityForReview) return;
    if (confirm('Delete your personal note for this facility?')) {
      await props.onDeleteReview(currentFacilityForReview.id);
      closeReviewModal();
      renderFacilityList();
    }
  });

  // Render facility markers and list
  const renderFacilityList = () => {
    if (!markersLayer || !mapInstance) return;
    markersLayer.clearLayers();

    const listContainer = container.querySelector('#facilities-list-container') as HTMLElement;
    const countHeading = container.querySelector('#facility-count-heading') as HTMLElement;

    const filtered = activeFacilities.filter(f => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'Gynecology') return f.type === 'Gynecology' || f.type === "Women's Health";
      return f.type === activeFilter;
    });

    if (countHeading) {
      countHeading.textContent = `Healthcare Facilities (${filtered.length})`;
    }

    if (filtered.length === 0) {
      if (listContainer) {
        listContainer.innerHTML = `
          <div class="p-6 text-center text-xs text-[#725B69]">
            No facilities matching the current filter within this area.
          </div>
        `;
      }
      return;
    }

    // Add map markers
    filtered.forEach(facility => {
      const isGyn = facility.type === 'Gynecology' || facility.type === "Women's Health";
      const markerColor = isGyn ? '#FB6F92' : '#A4365A';

      // Custom Leaflet DivIcon
      const icon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([facility.lat, facility.lon], { icon }).addTo(markersLayer!);
      
      const popupHtml = `
        <div style="font-size: 12px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <strong style="color: #392332; font-size: 13px;">${facility.name}</strong><br>
          <span style="color: #A4365A; font-weight: 600;">${facility.type}</span><br>
          <span style="color: #725B69;">${facility.address}</span><br>
          ${facility.phone ? `<span style="color: #725B69;">📞 ${facility.phone}</span><br>` : ''}
          ${facility.distanceKm ? `<span style="color: #725B69;">📍 ~${facility.distanceKm} km away</span>` : ''}
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

    // Render list items
    if (listContainer) {
      listContainer.innerHTML = filtered.map(f => {
        const userReview = props.userReviews[f.id];
        return `
          <div class="p-3.5 rounded-xl border border-[#F1D5D8] bg-[#FFF0F5]/30 hover:bg-[#FFF0F5] transition-colors space-y-2 text-xs">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-bold text-[#392332] text-sm">${f.name}</h4>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-[11px] font-semibold text-[#A4365A] uppercase">${f.type}</span>
                  ${f.specialtyConfirmed ? `<span class="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">Gynecology Confirmed</span>` : ''}
                </div>
              </div>
              ${f.distanceKm ? `
                <span class="text-xs font-semibold text-[#725B69] shrink-0">~${f.distanceKm} km</span>
              ` : ''}
            </div>

            <div class="text-[#725B69] space-y-0.5">
              <div>${f.address}</div>
              ${f.phone ? `<div>Phone: <strong>${f.phone}</strong></div>` : ''}
              ${f.openingHours ? `<div class="text-[11px]">Hours: ${f.openingHours}</div>` : ''}
            </div>

            ${userReview ? `
              <div class="p-2 rounded-lg bg-white border border-[#F1D5D8] space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-[#392332]">Your Private Note:</span>
                  <div class="flex text-amber-500 text-[10px]">
                    ${'★'.repeat(userReview.rating)}${'☆'.repeat(5 - userReview.rating)}
                  </div>
                </div>
                ${userReview.notes ? `<p class="italic text-[#725B69]">"${userReview.notes}"</p>` : ''}
              </div>
            ` : ''}

            <div class="flex items-center justify-between pt-1">
              <button data-center-lat="${f.lat}" data-center-lon="${f.lon}" class="text-[11px] font-semibold text-[#A4365A] hover:underline">
                Show on Map &rarr;
              </button>

              <button data-note-id="${f.id}" class="text-[11px] font-semibold text-[#392332] bg-white hover:bg-[#F8C8DC] border border-[#F1D5D8] px-2.5 py-1 rounded-lg transition-colors">
                ${userReview ? 'Edit Note' : '+ Add Personal Note'}
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Bind show on map buttons
      listContainer.querySelectorAll<HTMLButtonElement>('button[data-center-lat]').forEach(btn => {
        btn.addEventListener('click', () => {
          const lat = parseFloat(btn.getAttribute('data-center-lat') || '0');
          const lon = parseFloat(btn.getAttribute('data-center-lon') || '0');
          if (lat && lon && mapInstance) {
            mapInstance.flyTo([lat, lon], 15);
          }
        });
      });

      // Bind note buttons
      listContainer.querySelectorAll<HTMLButtonElement>('button[data-note-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-note-id');
          const fac = filtered.find(f => f.id === id);
          if (fac) openReviewModal(fac);
        });
      });
    }
  };

  // Initial list render
  renderFacilityList();

  // Search locality
  const searchInput = container.querySelector('#clinic-search-input') as HTMLInputElement;
  const searchBtn = container.querySelector('#clinic-search-btn');

  const executeSearch = async () => {
    const q = searchInput?.value.trim();
    if (!q) return;

    if (searchBtn) {
      searchBtn.textContent = 'Searching...';
      (searchBtn as HTMLButtonElement).disabled = true;
    }

    try {
      const geo = await geocodeLocality(q);
      if (geo && mapInstance) {
        currentLat = geo.lat;
        currentLon = geo.lon;
        mapInstance.flyTo([currentLat, currentLon], 13);
        const results = await fetchNearbyHealthcare(currentLat, currentLon);
        activeFacilities = results;
        renderFacilityList();
      } else {
        alert(`Could not find coordinates for "${q}". Using closest regional directory.`);
      }
    } finally {
      if (searchBtn) {
        searchBtn.textContent = 'Search Locality';
        (searchBtn as HTMLButtonElement).disabled = false;
      }
    }
  };

  searchBtn?.addEventListener('click', executeSearch);
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  });

  // Use my location
  container.querySelector('#clinic-locate-btn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        currentLat = pos.coords.latitude;
        currentLon = pos.coords.longitude;
        if (mapInstance) mapInstance.flyTo([currentLat, currentLon], 14);
        const results = await fetchNearbyHealthcare(currentLat, currentLon);
        activeFacilities = results;
        renderFacilityList();
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        alert('Location access was denied or timed out. You can manually enter your city or postal code above.');
      },
      { timeout: 8000 }
    );
  });

  // Filter buttons
  container.querySelectorAll<HTMLButtonElement>('#facility-filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll<HTMLButtonElement>('#facility-filters button').forEach(b => {
        b.className = 'px-3 py-1 rounded-lg font-medium bg-[#FFF0F5] text-[#725B69] hover:text-[#392332] border border-[#F1D5D8]';
      });
      btn.className = 'px-3 py-1 rounded-lg font-semibold bg-[#A4365A] text-white';
      activeFilter = btn.getAttribute('data-filter') || 'all';
      renderFacilityList();
    });
  });
}

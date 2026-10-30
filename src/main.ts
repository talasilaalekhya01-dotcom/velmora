/**
 * Velmora Main Application Controller
 * Pure HTML5, CSS3, and vanilla TypeScript/ES modules.
 * Integrates IndexedDB, Chart.js, Leaflet, Web Crypto, PWA Service Worker,
 * and responsive desktop/mobile layouts.
 */

import './index.css';
import {
  AppSection,
  PeriodRecord,
  DailyLog,
  HealthAlert,
  FacilityReview,
  ProductReview,
  UserPreferences,
  CycleStats
} from './types/index.ts';
import { db } from './db/index.ts';
import { calculateCycleStats, formatDate, parseDate } from './services/predictions.ts';
import { evaluateHealthAlerts } from './services/alertEngine.ts';
import { downloadFile } from './services/reports.ts';
import { toast } from './components/Toast.ts';
import { renderHeader, bindHeaderEvents } from './components/Header.ts';
import { renderSidebar, bindSidebarEvents } from './components/Sidebar.ts';
import { renderBottomNav, bindBottomNavEvents } from './components/BottomNav.ts';
import { renderDashboardView, bindDashboardEvents } from './components/DashboardView.ts';
import { renderCalendarView, bindCalendarEvents } from './components/CalendarView.ts';
import { renderDailyLogView, bindDailyLogEvents } from './components/DailyLogView.ts';
import { renderInsightsView, initInsightsCharts } from './components/InsightsView.ts';
import { renderAlertsView, bindAlertsEvents } from './components/AlertsView.ts';
import { renderDoctorsView, initDoctorsMap } from './components/DoctorsView.ts';
import { renderProductsView, bindProductsEvents } from './components/ProductsView.ts';
import { renderReportsView, bindReportsEvents } from './components/ReportsView.ts';
import { renderEducationView, bindEducationEvents } from './components/EducationView.ts';
import { renderSettingsView, bindSettingsEvents } from './components/SettingsView.ts';
import { renderOnboardingModal, bindOnboardingEvents } from './components/OnboardingModal.ts';
import { renderPinLockModal, bindPinLockEvents } from './components/PinLockModal.ts';
import {
  DEMO_PERIODS,
  DEMO_LOGS,
  DEMO_PRODUCT_REVIEWS,
  DEMO_FACILITY_REVIEWS
} from './services/demoData.ts';

class VelmoraApp {
  private root: HTMLElement;
  private currentSection: AppSection = 'dashboard';
  private periods: PeriodRecord[] = [];
  private dailyLogs: DailyLog[] = [];
  private alerts: HealthAlert[] = [];
  private facilityReviews: Record<string, FacilityReview> = {};
  private productReviews: Record<string, ProductReview> = {};
  private preferences!: UserPreferences;
  private stats!: CycleStats;

  // View state
  private selectedCalendarDate: string = formatDate(new Date());
  private selectedLogDate: string = formatDate(new Date());
  private calendarYear: number = new Date().getFullYear();
  private calendarMonth: number = new Date().getMonth();
  private selectedEducationArticleId?: string;

  // Security & PWA state
  private isPinUnlocked: boolean = false;
  private isOnline: boolean = navigator.onLine;
  private deferredPwaPrompt: any = null;

  constructor(rootEl: HTMLElement) {
    this.root = rootEl;
  }

  public async init() {
    this.initPWA();
    this.initNetworkListeners();

    try {
      this.preferences = await db.getPreferences();
      await this.refreshState();

      // Check PIN lock
      if (this.preferences.pinEnabled && this.preferences.pinHash && this.preferences.pinSalt) {
        this.isPinUnlocked = false;
      } else {
        this.isPinUnlocked = true;
      }

      this.render();
    } catch (err) {
      console.error('Initialization error in Velmora:', err);
      this.root.innerHTML = `
        <div class="p-8 text-center text-sm text-[#392332]">
          <h2 class="text-lg font-bold text-[#A4365A]">Initialization Error</h2>
          <p class="text-xs text-[#725B69] mt-2">Could not access local storage database. Please check your browser storage permissions.</p>
        </div>
      `;
    }
  }

  private initPWA() {
    // Service Worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('ServiceWorker registration error:', err);
        });
      });
    }

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPwaPrompt = e;
      this.render();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPwaPrompt = null;
      toast.show('Velmora installed successfully!', 'success');
      this.render();
    });
  }

  private initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      toast.show('Back online. Live maps and external searches available.', 'success');
      this.render();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      toast.show('You are offline. Velmora is running locally.', 'info');
      this.render();
    });
  }

  private async refreshState() {
    const [periods, logs, existingAlerts, facReviews, prodReviews] = await Promise.all([
      db.getAllPeriods(),
      db.getAllDailyLogs(),
      db.getAllAlerts(),
      db.getAllFacilityReviews(),
      db.getAllProductReviews()
    ]);

    this.periods = periods;
    this.dailyLogs = logs;
    this.facilityReviews = facReviews;
    this.productReviews = prodReviews;

    // Recalculate stats
    this.stats = calculateCycleStats(
      this.periods,
      this.preferences.defaultCycleLength,
      this.preferences.defaultPeriodDuration,
      this.preferences.lutealPhaseLength
    );

    // Evaluate health alerts rule engine
    const evaluatedAlerts = evaluateHealthAlerts(this.periods, this.dailyLogs, this.stats, existingAlerts);
    this.alerts = evaluatedAlerts;
    await db.saveAlerts(evaluatedAlerts);
  }

  public render() {
    // 1. PIN Lock overlay check
    if (this.preferences.pinEnabled && !this.isPinUnlocked && this.preferences.pinSalt && this.preferences.pinHash) {
      this.root.innerHTML = renderPinLockModal();
      bindPinLockEvents(this.root, {
        salt: this.preferences.pinSalt,
        hash: this.preferences.pinHash,
        onUnlocked: () => {
          this.isPinUnlocked = true;
          toast.show('Unlocked', 'success');
          this.render();
        }
      });
      return;
    }

    // 2. First-time Onboarding check
    if (!this.preferences.onboardingCompleted) {
      this.root.innerHTML = renderOnboardingModal();
      bindOnboardingEvents(this.root, {
        onComplete: async (data) => {
          if (data.loadDemo) {
            await this.loadDemoDataset();
          } else {
            if (data.initialPeriod) {
              await db.savePeriod(data.initialPeriod);
            }
            const updated = { ...this.preferences, ...data.preferences };
            await db.savePreferences(updated);
            this.preferences = updated;
          }
          await this.refreshState();
          toast.show('Welcome to Velmora! Your setup is complete.', 'success');
          this.render();
        },
        onClose: () => {
          this.preferences.onboardingCompleted = true;
          db.savePreferences(this.preferences);
          this.render();
        }
      });
      return;
    }

    // 3. Main Application Shell
    const activeAlertsCount = this.alerts.filter(a => !a.dismissed).length;
    const todayStr = formatDate(new Date());
    const todayLog = this.dailyLogs.find(l => l.date === todayStr) || null;

    this.root.innerHTML = `
      <div class="min-h-screen flex flex-col bg-[#FFF0F5]">
        
        <!-- Header (Top Bar Contract) -->
        <div id="header-container">
          ${renderHeader({
            currentSection: this.currentSection,
            onNavigate: (sec) => this.navigateTo(sec),
            onQuickLog: () => {
              this.selectedLogDate = formatDate(new Date());
              this.navigateTo('daily-log');
            },
            isOnline: this.isOnline,
            canInstallPWA: !!this.deferredPwaPrompt,
            onInstallPWA: () => this.promptPWAInstall()
          })}
        </div>

        <!-- Main Body (Sidebar + Content Viewport) -->
        <div class="flex-1 flex max-w-7xl w-full mx-auto">
          
          <!-- Desktop Stable Sidebar -->
          <div class="hidden lg:block shrink-0" id="sidebar-container">
            ${renderSidebar({
              currentSection: this.currentSection,
              onNavigate: (sec) => this.navigateTo(sec),
              activeAlertsCount,
              isDemoActive: !!this.preferences.isDemoActive,
              currentCycleDay: this.stats.currentCycleDay
            })}
          </div>

          <!-- Main Content Area -->
          <main class="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto" id="main-content-viewport">
            ${this.renderCurrentSectionView(todayLog)}
          </main>

        </div>

        <!-- Mobile Bottom Navigation + More Sheet -->
        <div id="bottom-nav-container">
          ${renderBottomNav({
            currentSection: this.currentSection,
            onNavigate: (sec) => this.navigateTo(sec),
            activeAlertsCount
          })}
        </div>

      </div>
    `;

    this.bindGlobalEvents(todayLog);
  }

  private renderCurrentSectionView(todayLog: DailyLog | null): string {
    switch (this.currentSection) {
      case 'dashboard':
        return renderDashboardView({
          stats: this.stats,
          periods: this.periods,
          todayLog,
          activeAlerts: this.alerts.filter(a => !a.dismissed),
          isDemoActive: !!this.preferences.isDemoActive,
          onNavigate: (sec) => this.navigateTo(sec),
          onStartPeriodToday: async () => {
            const today = formatDate(new Date());
            const newRecord: PeriodRecord = {
              id: 'period_' + today,
              startDate: today,
              source: 'user',
              createdAt: Date.now()
            };
            await db.savePeriod(newRecord);
            await this.refreshState();
            toast.show('Period start recorded for today', 'success');
            this.render();
          },
          onOpenDailyLog: (date) => {
            this.selectedLogDate = date;
            this.navigateTo('daily-log');
          },
          onDismissAlert: async (id) => {
            await db.dismissAlert(id);
            await this.refreshState();
            this.render();
          }
        });

      case 'calendar':
        return renderCalendarView({
          periods: this.periods,
          dailyLogs: this.dailyLogs,
          stats: this.stats,
          selectedDate: this.selectedCalendarDate,
          viewYear: this.calendarYear,
          viewMonth: this.calendarMonth,
          onSelectDate: (d) => {
            this.selectedCalendarDate = d;
            this.render();
          },
          onChangeMonth: (y, m) => {
            this.calendarYear = y;
            this.calendarMonth = m;
            this.render();
          },
          onSavePeriod: async (record) => {
            await db.savePeriod(record);
            await this.refreshState();
            toast.show('Period record updated in IndexedDB', 'success');
            this.render();
          },
          onDeletePeriod: async (id) => {
            await db.deletePeriod(id);
            await this.refreshState();
            toast.show('Period record deleted', 'info');
            this.render();
          },
          onOpenDailyLog: (date) => {
            this.selectedLogDate = date;
            this.navigateTo('daily-log');
          }
        });

      case 'daily-log': {
        const logForDate = this.dailyLogs.find(l => l.date === this.selectedLogDate) || null;
        return renderDailyLogView({
          currentDate: this.selectedLogDate,
          existingLog: logForDate,
          onSelectDate: (d) => {
            this.selectedLogDate = d;
            this.render();
          },
          onSaveLog: async (log) => {
            await db.saveDailyLog(log);
            await this.refreshState();
            toast.show(`Health log for ${log.date} saved to local database`, 'success');
            this.render();
          },
          onDeleteLog: async (date) => {
            await db.deleteDailyLog(date);
            await this.refreshState();
            toast.show(`Health log for ${date} removed`, 'info');
            this.render();
          }
        });
      }

      case 'insights':
        return renderInsightsView({
          periods: this.periods,
          dailyLogs: this.dailyLogs,
          stats: this.stats
        });

      case 'alerts':
        return renderAlertsView({
          alerts: this.alerts,
          onDismissAlert: async (id) => {
            await db.dismissAlert(id);
            await this.refreshState();
            toast.show('Alert acknowledged', 'info');
            this.render();
          }
        });

      case 'doctors':
        return renderDoctorsView({
          userReviews: this.facilityReviews,
          onSaveReview: async (review) => {
            await db.saveFacilityReview(review);
            this.facilityReviews[review.facilityId] = review;
            toast.show('Facility note saved locally', 'success');
          },
          onDeleteReview: async (facId) => {
            await db.deleteFacilityReview(facId);
            delete this.facilityReviews[facId];
            toast.show('Facility note removed', 'info');
          }
        });

      case 'products':
        return renderProductsView({
          userReviews: this.productReviews,
          onSaveReview: async (review) => {
            await db.saveProductReview(review);
            this.productReviews[review.productId] = review;
            toast.show('Personal product review saved', 'success');
            this.render();
          }
        });

      case 'reports':
        return renderReportsView({
          periods: this.periods,
          dailyLogs: this.dailyLogs,
          alerts: this.alerts,
          stats: this.stats
        });

      case 'education':
        return renderEducationView({
          selectedArticleId: this.selectedEducationArticleId,
          onSelectArticle: (id) => {
            this.selectedEducationArticleId = id;
            this.render();
          }
        });

      case 'settings':
        return renderSettingsView({
          preferences: this.preferences,
          onSavePreferences: async (prefs) => {
            await db.savePreferences(prefs);
            this.preferences = prefs;
            await this.refreshState();
            toast.show('Preferences updated', 'success');
            this.render();
          },
          onExportData: async () => {
            const json = await db.exportAllData();
            const filename = `velmora-backup-${formatDate(new Date())}.json`;
            downloadFile(json, filename, 'application/json');
            toast.show('Offline JSON backup downloaded', 'success');
          },
          onImportData: async (jsonStr) => {
            const success = await db.importData(jsonStr);
            if (success) {
              this.preferences = await db.getPreferences();
              await this.refreshState();
              this.render();
            }
            return success;
          },
          onToggleDemo: async (enable) => {
            if (enable) {
              await this.loadDemoDataset();
              toast.show('4 months of sample data loaded', 'success');
            } else {
              await db.clearAllUserData();
              this.preferences.isDemoActive = false;
              await db.savePreferences(this.preferences);
              await this.refreshState();
              toast.show('Demo data cleared. Returned to clean state.', 'info');
            }
            this.render();
          },
          onClearAllData: async () => {
            await db.clearAllUserData();
            this.preferences = await db.getPreferences();
            this.preferences.onboardingCompleted = true;
            this.preferences.isDemoActive = false;
            await db.savePreferences(this.preferences);
            await this.refreshState();
            this.render();
          }
        });

      default:
        return '<div>Section not found</div>';
    }
  }

  private bindGlobalEvents(todayLog: DailyLog | null) {
    const headerContainer = this.root.querySelector('#header-container') as HTMLElement;
    if (headerContainer) {
      bindHeaderEvents(headerContainer, {
        currentSection: this.currentSection,
        onNavigate: (sec) => this.navigateTo(sec),
        onQuickLog: () => {
          this.selectedLogDate = formatDate(new Date());
          this.navigateTo('daily-log');
        },
        isOnline: this.isOnline,
        canInstallPWA: !!this.deferredPwaPrompt,
        onInstallPWA: () => this.promptPWAInstall()
      });
    }

    const sidebarContainer = this.root.querySelector('#sidebar-container') as HTMLElement;
    if (sidebarContainer) {
      bindSidebarEvents(sidebarContainer, (sec) => this.navigateTo(sec));
    }

    const bottomNavContainer = this.root.querySelector('#bottom-nav-container') as HTMLElement;
    if (bottomNavContainer) {
      bindBottomNavEvents(bottomNavContainer, (sec) => this.navigateTo(sec));
    }

    const viewport = this.root.querySelector('#main-content-viewport') as HTMLElement;
    if (viewport) {
      switch (this.currentSection) {
        case 'dashboard':
          bindDashboardEvents(viewport, {
            stats: this.stats,
            periods: this.periods,
            todayLog,
            activeAlerts: this.alerts.filter(a => !a.dismissed),
            isDemoActive: !!this.preferences.isDemoActive,
            onNavigate: (sec) => this.navigateTo(sec),
            onStartPeriodToday: async () => {
              const today = formatDate(new Date());
              const newRecord: PeriodRecord = {
                id: 'period_' + today,
                startDate: today,
                source: 'user',
                createdAt: Date.now()
              };
              await db.savePeriod(newRecord);
              await this.refreshState();
              toast.show('Period start recorded for today', 'success');
              this.render();
            },
            onOpenDailyLog: (date) => {
              this.selectedLogDate = date;
              this.navigateTo('daily-log');
            },
            onDismissAlert: async (id) => {
              await db.dismissAlert(id);
              await this.refreshState();
              this.render();
            }
          });
          break;

        case 'calendar':
          bindCalendarEvents(viewport, {
            periods: this.periods,
            dailyLogs: this.dailyLogs,
            stats: this.stats,
            selectedDate: this.selectedCalendarDate,
            viewYear: this.calendarYear,
            viewMonth: this.calendarMonth,
            onSelectDate: (d) => {
              this.selectedCalendarDate = d;
              this.render();
            },
            onChangeMonth: (y, m) => {
              this.calendarYear = y;
              this.calendarMonth = m;
              this.render();
            },
            onSavePeriod: async (record) => {
              await db.savePeriod(record);
              await this.refreshState();
              toast.show('Period record updated in IndexedDB', 'success');
              this.render();
            },
            onDeletePeriod: async (id) => {
              await db.deletePeriod(id);
              await this.refreshState();
              toast.show('Period record deleted', 'info');
              this.render();
            },
            onOpenDailyLog: (date) => {
              this.selectedLogDate = date;
              this.navigateTo('daily-log');
            }
          });
          break;

        case 'daily-log': {
          const logForDate = this.dailyLogs.find(l => l.date === this.selectedLogDate) || null;
          bindDailyLogEvents(viewport, {
            currentDate: this.selectedLogDate,
            existingLog: logForDate,
            onSelectDate: (d) => {
              this.selectedLogDate = d;
              this.render();
            },
            onSaveLog: async (log) => {
              await db.saveDailyLog(log);
              await this.refreshState();
              toast.show(`Health log for ${log.date} saved to local database`, 'success');
              this.render();
            },
            onDeleteLog: async (date) => {
              await db.deleteDailyLog(date);
              await this.refreshState();
              toast.show(`Health log for ${date} removed`, 'info');
              this.render();
            }
          });
          break;
        }

        case 'insights':
          initInsightsCharts(viewport, {
            periods: this.periods,
            dailyLogs: this.dailyLogs,
            stats: this.stats
          });
          break;

        case 'alerts':
          bindAlertsEvents(viewport, {
            alerts: this.alerts,
            onDismissAlert: async (id) => {
              await db.dismissAlert(id);
              await this.refreshState();
              toast.show('Alert acknowledged', 'info');
              this.render();
            }
          });
          break;

        case 'doctors':
          initDoctorsMap(viewport, {
            userReviews: this.facilityReviews,
            onSaveReview: async (review) => {
              await db.saveFacilityReview(review);
              this.facilityReviews[review.facilityId] = review;
              toast.show('Facility note saved locally', 'success');
            },
            onDeleteReview: async (facId) => {
              await db.deleteFacilityReview(facId);
              delete this.facilityReviews[facId];
              toast.show('Facility note removed', 'info');
            }
          });
          break;

        case 'products':
          bindProductsEvents(viewport, {
            userReviews: this.productReviews,
            onSaveReview: async (review) => {
              await db.saveProductReview(review);
              this.productReviews[review.productId] = review;
              toast.show('Personal product review saved', 'success');
              this.render();
            }
          });
          break;

        case 'reports':
          bindReportsEvents(viewport, {
            periods: this.periods,
            dailyLogs: this.dailyLogs,
            alerts: this.alerts,
            stats: this.stats
          });
          break;

        case 'education':
          bindEducationEvents(viewport, {
            selectedArticleId: this.selectedEducationArticleId,
            onSelectArticle: (id) => {
              this.selectedEducationArticleId = id;
              this.render();
            }
          });
          break;

        case 'settings':
          bindSettingsEvents(viewport, {
            preferences: this.preferences,
            onSavePreferences: async (prefs) => {
              await db.savePreferences(prefs);
              this.preferences = prefs;
              await this.refreshState();
              toast.show('Preferences updated', 'success');
              this.render();
            },
            onExportData: async () => {
              const json = await db.exportAllData();
              const filename = `velmora-backup-${formatDate(new Date())}.json`;
              downloadFile(json, filename, 'application/json');
              toast.show('Offline JSON backup downloaded', 'success');
            },
            onImportData: async (jsonStr) => {
              const success = await db.importData(jsonStr);
              if (success) {
                this.preferences = await db.getPreferences();
                await this.refreshState();
                this.render();
              }
              return success;
            },
            onToggleDemo: async (enable) => {
              if (enable) {
                await this.loadDemoDataset();
                toast.show('4 months of sample data loaded', 'success');
              } else {
                await db.clearAllUserData();
                this.preferences.isDemoActive = false;
                await db.savePreferences(this.preferences);
                await this.refreshState();
                toast.show('Demo data cleared. Returned to clean state.', 'info');
              }
              this.render();
            },
            onClearAllData: async () => {
              await db.clearAllUserData();
              this.preferences = await db.getPreferences();
              this.preferences.onboardingCompleted = true;
              this.preferences.isDemoActive = false;
              await db.savePreferences(this.preferences);
              await this.refreshState();
              this.render();
            }
          });
          break;
      }
    }
  }

  private navigateTo(section: AppSection) {
    this.currentSection = section;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private async promptPWAInstall() {
    if (!this.deferredPwaPrompt) return;
    this.deferredPwaPrompt.prompt();
    const choice = await this.deferredPwaPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      this.deferredPwaPrompt = null;
      this.render();
    }
  }

  private async loadDemoDataset() {
    await db.clearAllUserData();
    for (const p of DEMO_PERIODS) await db.savePeriod(p);
    for (const l of DEMO_LOGS) await db.saveDailyLog(l);
    for (const r of Object.values(DEMO_PRODUCT_REVIEWS)) await db.saveProductReview(r);
    for (const f of Object.values(DEMO_FACILITY_REVIEWS)) await db.saveFacilityReview(f);

    this.preferences.isDemoActive = true;
    this.preferences.onboardingCompleted = true;
    await db.savePreferences(this.preferences);
    await this.refreshState();
  }
}

// Mount application once DOM is ready
const appRoot = document.getElementById('app') || document.body;
const velmora = new VelmoraApp(appRoot);
velmora.init();

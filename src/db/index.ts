/**
 * Velmora IndexedDB Database Engine
 * Pure local-first persistent storage using HTML5 IndexedDB API.
 */

import { PeriodRecord, DailyLog, HealthAlert, FacilityReview, ProductReview, UserPreferences } from '../types/index.ts';

const DB_NAME = 'velmora_menstrual_health_db';
const DB_VERSION = 1;

class VelmoraDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  public async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Periods Store
        if (!db.objectStoreNames.contains('periods')) {
          const periodStore = db.createObjectStore('periods', { keyPath: 'id' });
          periodStore.createIndex('startDate', 'startDate', { unique: false });
        }

        // Daily Logs Store
        if (!db.objectStoreNames.contains('dailyLogs')) {
          db.createObjectStore('dailyLogs', { keyPath: 'date' });
        }

        // Health Alerts Store
        if (!db.objectStoreNames.contains('alerts')) {
          const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
          alertStore.createIndex('ruleId', 'ruleId', { unique: false });
        }

        // Healthcare Facility Reviews & Notes
        if (!db.objectStoreNames.contains('facilityReviews')) {
          db.createObjectStore('facilityReviews', { keyPath: 'facilityId' });
        }

        // Product Reviews
        if (!db.objectStoreNames.contains('productReviews')) {
          db.createObjectStore('productReviews', { keyPath: 'productId' });
        }

        // Preferences & Security
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(new Error(`Failed to open Velmora IndexedDB: ${request.error?.message}`));
      };
    });

    return this.initPromise;
  }

  // Generic helper for transaction
  private async executeTx<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T> | void
  ): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let req: IDBRequest<T> | void;

      try {
        req = callback(store);
      } catch (err) {
        reject(err);
        return;
      }

      tx.oncomplete = () => {
        if (req && 'result' in req) {
          resolve(req.result);
        } else {
          resolve(undefined as unknown as T);
        }
      };

      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  // --- PERIODS API ---
  public async getAllPeriods(): Promise<PeriodRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('periods', 'readonly');
      const store = tx.objectStore('periods');
      const index = store.index('startDate');
      const req = index.getAll();
      req.onsuccess = () => {
        // Return sorted descending by startDate
        const periods = (req.result || []) as PeriodRecord[];
        periods.sort((a, b) => b.startDate.localeCompare(a.startDate));
        resolve(periods);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async savePeriod(period: PeriodRecord): Promise<void> {
    await this.executeTx('periods', 'readwrite', (store) => {
      store.put(period);
    });
  }

  public async deletePeriod(id: string): Promise<void> {
    await this.executeTx('periods', 'readwrite', (store) => {
      store.delete(id);
    });
  }

  // --- DAILY LOGS API ---
  public async getDailyLog(date: string): Promise<DailyLog | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('dailyLogs', 'readonly');
      const store = tx.objectStore('dailyLogs');
      const req = store.get(date);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllDailyLogs(): Promise<DailyLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('dailyLogs', 'readonly');
      const store = tx.objectStore('dailyLogs');
      const req = store.getAll();
      req.onsuccess = () => {
        const logs = (req.result || []) as DailyLog[];
        logs.sort((a, b) => b.date.localeCompare(a.date));
        resolve(logs);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async saveDailyLog(log: DailyLog): Promise<void> {
    await this.executeTx('dailyLogs', 'readwrite', (store) => {
      store.put(log);
    });
  }

  public async deleteDailyLog(date: string): Promise<void> {
    await this.executeTx('dailyLogs', 'readwrite', (store) => {
      store.delete(date);
    });
  }

  // --- ALERTS API ---
  public async getAllAlerts(): Promise<HealthAlert[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('alerts', 'readonly');
      const store = tx.objectStore('alerts');
      const req = store.getAll();
      req.onsuccess = () => {
        const alerts = (req.result || []) as HealthAlert[];
        alerts.sort((a, b) => b.createdAt - a.createdAt);
        resolve(alerts);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async saveAlerts(alerts: HealthAlert[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('alerts', 'readwrite');
      const store = tx.objectStore('alerts');
      for (const alert of alerts) {
        store.put(alert);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async dismissAlert(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('alerts', 'readwrite');
      const store = tx.objectStore('alerts');
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result) {
          const updated = { ...req.result, dismissed: true };
          store.put(updated);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- FACILITY REVIEWS API ---
  public async getAllFacilityReviews(): Promise<Record<string, FacilityReview>> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('facilityReviews', 'readonly');
      const store = tx.objectStore('facilityReviews');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []) as FacilityReview[];
        const map: Record<string, FacilityReview> = {};
        for (const item of list) {
          map[item.facilityId] = item;
        }
        resolve(map);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async saveFacilityReview(review: FacilityReview): Promise<void> {
    await this.executeTx('facilityReviews', 'readwrite', (store) => {
      store.put(review);
    });
  }

  public async deleteFacilityReview(facilityId: string): Promise<void> {
    await this.executeTx('facilityReviews', 'readwrite', (store) => {
      store.delete(facilityId);
    });
  }

  // --- PRODUCT REVIEWS API ---
  public async getAllProductReviews(): Promise<Record<string, ProductReview>> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('productReviews', 'readonly');
      const store = tx.objectStore('productReviews');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []) as ProductReview[];
        const map: Record<string, ProductReview> = {};
        for (const item of list) {
          map[item.productId] = item;
        }
        resolve(map);
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async saveProductReview(review: ProductReview): Promise<void> {
    await this.executeTx('productReviews', 'readwrite', (store) => {
      store.put(review);
    });
  }

  // --- PREFERENCES API ---
  public async getPreferences(): Promise<UserPreferences> {
    const defaultPrefs: UserPreferences = {
      onboardingCompleted: false,
      defaultCycleLength: 28,
      defaultPeriodDuration: 5,
      lutealPhaseLength: 14,
      notificationsEnabled: false,
      periodReminderDaysBefore: 2,
      dailyLogReminderTime: '20:00',
      pinEnabled: false,
      theme: 'rose-blush',
      isDemoActive: false
    };

    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('preferences', 'readonly');
      const store = tx.objectStore('preferences');
      const req = store.get('user_preferences');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve({ ...defaultPrefs, ...req.result.value });
        } else {
          resolve(defaultPrefs);
        }
      };
      req.onerror = () => resolve(defaultPrefs);
    });
  }

  public async savePreferences(prefs: UserPreferences): Promise<void> {
    await this.executeTx('preferences', 'readwrite', (store) => {
      store.put({ key: 'user_preferences', value: prefs });
    });
  }

  // --- FULL DATA RESET & BACKUP ---
  public async exportAllData(): Promise<string> {
    const [periods, dailyLogs, alerts, facilityReviews, productReviews, preferences] = await Promise.all([
      this.getAllPeriods(),
      this.getAllDailyLogs(),
      this.getAllAlerts(),
      this.getAllFacilityReviews(),
      this.getAllProductReviews(),
      this.getPreferences()
    ]);

    const backupPayload = {
      app: 'Velmora',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        periods,
        dailyLogs,
        alerts,
        facilityReviews,
        productReviews,
        preferences: {
          ...preferences,
          // Exclude PIN security tokens from plaintext backup for defense in depth
          pinSalt: undefined,
          pinHash: undefined,
          pinEnabled: false
        }
      }
    };

    return JSON.stringify(backupPayload, null, 2);
  }

  public async importData(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) return false;

      const db = await this.getDB();
      const stores = ['periods', 'dailyLogs', 'alerts', 'facilityReviews', 'productReviews'];

      // Clear existing records
      await this.clearAllUserData();

      // Repopulate
      if (Array.isArray(parsed.data.periods)) {
        for (const p of parsed.data.periods) await this.savePeriod(p);
      }
      if (Array.isArray(parsed.data.dailyLogs)) {
        for (const l of parsed.data.dailyLogs) await this.saveDailyLog(l);
      }
      if (parsed.data.facilityReviews) {
        for (const r of Object.values(parsed.data.facilityReviews) as FacilityReview[]) {
          await this.saveFacilityReview(r);
        }
      }
      if (parsed.data.productReviews) {
        for (const r of Object.values(parsed.data.productReviews) as ProductReview[]) {
          await this.saveProductReview(r);
        }
      }
      if (parsed.data.preferences) {
        const existing = await this.getPreferences();
        await this.savePreferences({ ...existing, ...parsed.data.preferences });
      }

      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  public async clearAllUserData(): Promise<void> {
    const db = await this.getDB();
    const stores = ['periods', 'dailyLogs', 'alerts', 'facilityReviews', 'productReviews'];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(stores, 'readwrite');
      for (const name of stores) {
        tx.objectStore(name).clear();
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new VelmoraDatabase();

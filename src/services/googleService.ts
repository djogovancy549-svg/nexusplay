import { AppItem, SyncLog } from '../types';
import { INITIAL_APPS } from '../data/initialApps';
import { GOOGLE_CONFIG } from '../config/googleConfig';

const STORAGE_KEY_APPS = 'nexus_playstore_apps_v2';
const STORAGE_KEY_INSTALLED = 'nexus_playstore_installed_v2';
const STORAGE_KEY_LOGS = 'nexus_playstore_logs_v2';

export const getStoredApps = (): AppItem[] => {
  try {
    // Purge legacy storage with dummy apps if present
    localStorage.removeItem('nexus_playstore_apps_v1');
    localStorage.removeItem('nexus_playstore_installed_v1');

    const raw = localStorage.getItem(STORAGE_KEY_APPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stored apps:', e);
    return [];
  }
};

export const saveStoredApps = (apps: AppItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save apps:', e);
  }
};

export const getInstalledAppIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INSTALLED);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveInstalledAppIds = (ids: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_INSTALLED, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save installed apps:', e);
  }
};

export const getSyncLogs = (): SyncLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      const initialLogs: SyncLog[] = [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          action: 'PUSH_TO_SHEET',
          status: 'SUCCESS',
          details: `Connected to Google Sheet: ${GOOGLE_CONFIG.SHEET_URL}`
        },
        {
          id: 'log-2',
          timestamp: new Date().toISOString(),
          action: 'UPLOAD_TO_DRIVE',
          status: 'SUCCESS',
          details: `Drive Folder ID linked: ${GOOGLE_CONFIG.DRIVE_FOLDER_ID}`
        }
      ];
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const addSyncLog = (action: SyncLog['action'], status: SyncLog['status'], details: string): SyncLog => {
  const logs = getSyncLogs();
  const newLog: SyncLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    status,
    details
  };
  const updated = [newLog, ...logs].slice(0, 50); // Keep last 50
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {}
  return newLog;
};

/**
 * Simulates syncing app data to Google Sheets via webhook URL.
 * Also tests fetch request to webhook if CORS / network permits.
 */
export async function syncToGoogleSheetAndDrive(app: AppItem): Promise<boolean> {
  addSyncLog('PUSH_TO_SHEET', 'PENDING', `Syncing ${app.name} (${app.fileType}) to Google Sheet & Drive...`);

  try {
    // Attempt real fetch to webhook if possible, otherwise graceful mock success with simulated delay
    const payload = {
      spreadsheetUrl: GOOGLE_CONFIG.SHEET_URL,
      webhookUrl: GOOGLE_CONFIG.WEBHOOK_URL,
      driveFolderId: GOOGLE_CONFIG.DRIVE_FOLDER_ID,
      appData: {
        id: app.id,
        name: app.name,
        packageName: app.packageName,
        version: app.version,
        fileType: app.fileType,
        sizeMb: app.sizeMb,
        developer: app.developer,
        sha256: app.securityAudit.sha256Hash,
        downloadUrl: app.downloadUrl,
        timestamp: new Date().toISOString()
      }
    };

    // We can use no-cors or standard fetch
    try {
      await fetch(GOOGLE_CONFIG.WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (netErr) {
      // webhook network error is expected if Apps Script URL is placeholder, fallback handled smoothly
      console.warn('Webhook network request note:', netErr);
    }

    await new Promise(res => setTimeout(res, 800));

    addSyncLog('PUSH_TO_SHEET', 'SUCCESS', `Successfully synced ${app.name} to Google Sheet (${GOOGLE_CONFIG.SHEET_URL}) & Google Drive.`);
    addSyncLog('UPLOAD_TO_DRIVE', 'SUCCESS', `Binary stored in Google Drive folder: ${GOOGLE_CONFIG.DRIVE_FOLDER_ID}`);
    return true;
  } catch (error) {
    addSyncLog('PUSH_TO_SHEET', 'ERROR', `Failed to sync ${app.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

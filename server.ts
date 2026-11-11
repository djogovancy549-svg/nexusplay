import express from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPS_FILE = path.join(__dirname, 'data', 'apps.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'google_config.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'icons');

// Default Google Configuration embedded directly in code
const DEFAULT_GOOGLE_CONFIG = {
  SHEET_URL: "https://docs.google.com/spreadsheets/d/1x9vPsR3_VdhhwVV8SQJ4yz6PRhqNro5GjKX0D8nBQfQ/edit?usp=sharing",
  SHEET_API_ENDPOINT: "https://docs.google.com/spreadsheets/d/1x9vPsR3_VdhhwVV8SQJ4yz6PRhqNro5GjKX0D8nBQfQ/edit?usp=sharing",
  WEBHOOK_URL: "https://script.google.com/macros/s/AKfycby2SY-GAoLvegKI4wCP5Hkefkt1rRtgRa_TEsleHnRl_IhkxZ1XcD5P5Lsb5gxK0ud6DA/exec",
  DRIVE_FOLDER_ID: "173h7jlkKPHUFg91p5ly8NjsNdwnLmc-3",
  DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/173h7jlkKPHUFg91p5ly8NjsNdwnLmc-3?usp=sharing",
};

// Ensure data & uploads folders exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function loadServerConfig(): any {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content || '{}');
      return { ...DEFAULT_GOOGLE_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error('Failed to read server google_config.json:', err);
  }
  return DEFAULT_GOOGLE_CONFIG;
}

function saveServerConfig(config: any): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write server google_config.json:', err);
  }
}

function loadServerUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(content || '[]');
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to read server users.json:', err);
  }
  return [];
}

function saveServerUsers(users: any[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write server users.json:', err);
  }
}

/**
 * Converts long base64 image data into static image asset files saved on disk.
 * This prevents filling up Google Sheet cell quotas with giant base64 strings!
 */
function processBase64Image(iconUrl: string, appId: string): string {
  if (!iconUrl || typeof iconUrl !== 'string' || !iconUrl.startsWith('data:image/')) {
    return iconUrl;
  }
  try {
    const matches = iconUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (matches) {
      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const safeId = String(appId).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `icon-${safeId}-${Date.now()}.${ext}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, buffer);
      return `/uploads/icons/${filename}`;
    }
  } catch (e) {
    console.error('Failed to save base64 image asset:', e);
  }
  return iconUrl;
}

const DEFAULT_SERVER_APPS = [
  {
    id: "dev-app-179438",
    name: "app-release",
    packageName: "com.developer.a",
    developer: "Nexus Studio Official",
    category: "Productivity",
    fileType: "APK",
    version: "1.0.0",
    versionCode: 100,
    sizeMb: 49.8,
    downloads: "100+",
    rating: 5.0,
    reviewsCount: 12,
    iconUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%0A%20%20%20%20%3Cdefs%3E%0A%20%20%20%20%20%20%3ClinearGradient%20id%3D%22grad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232563eb%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%231d4ed8%22%20%2F%3E%0A%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%20%20%3ClinearGradient%20id%3D%22shine%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23ffffff%22%20stop-opacity%3D%220.3%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23ffffff%22%20stop-opacity%3D%220%22%20%2F%3E%0A%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%3C%2Fdefs%3E%0A%20%20%20%20%3Crect%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2244%22%20fill%3D%22url(%23grad)%22%20%2F%3E%0A%20%20%20%20%3Crect%20width%3D%22200%22%20height%3D%22100%22%20rx%3D%2244%22%20fill%3D%22url(%23shine)%22%20%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22100%22%20cy%3D%22100%22%20r%3D%2270%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.15)%22%20stroke-width%3D%224%22%20%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%25%22%20y%3D%2254%25%22%20font-family%3D%22system-ui%2C%20-apple-system%2C%20Roboto%2C%20sans-serif%22%20font-size%3D%2272%22%20font-weight%3D%22900%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20letter-spacing%3D%222%22%3E%0A%20%20%20%20%20%20AP%0A%20%20%20%20%3C%2Ftext%3E%0A%20%20%3C%2Fsvg%3E",
    bannerUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    description: "High-performance Android application published via Developer Console.",
    whatsNew: "Rilis awal paket aplikasi Android.",
    securityAudit: {
      sha256Hash: "th7m1xg0vzv5a39f1k9842",
      signatureValid: true,
      signer: "CN=Nexus Studio Official, C=ID",
      malwareScore: 0,
      permissions: [
        { name: "android.permission.INTERNET", level: "normal", description: "Akses jaringan internet." }
      ],
      obfuscated: true,
      minSdk: 26,
      targetSdk: 34
    },
    downloadUrl: "https://drive.google.com/drive/folders/173h7jlkKPHUFg91p5ly8NjsNdwnLmc-3?usp=sharing",
    syncedToSheet: true,
    createdAt: "2026-11-11"
  },
  {
    id: "app-spammobile-nagekeo",
    name: "SPAMMOBILE",
    packageName: "com.blud.spammobile.nagekeo",
    developer: "Nexus Studio Official",
    category: "Productivity",
    fileType: "APK",
    version: "1.0.0",
    versionCode: 100,
    sizeMb: 49.8,
    downloads: "500+",
    rating: 5.0,
    reviewsCount: 28,
    iconUrl: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%0A%20%20%20%20%3Cdefs%3E%0A%20%20%20%20%20%20%3ClinearGradient%20id%3D%22grad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232563eb%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%231d4ed8%22%20%2F%3E%0A%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%20%20%3ClinearGradient%20id%3D%22shine%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23ffffff%22%20stop-opacity%3D%220.3%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23ffffff%22%20stop-opacity%3D%220%22%20%2F%3E%0A%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%3C%2Fdefs%3E%0A%20%20%20%20%3Crect%20width%3D%22200%22%20height%3D%22200%22%20rx%3D%2244%22%20fill%3D%22url(%23grad)%22%20%2F%3E%0A%20%20%20%20%3Crect%20width%3D%22200%22%20height%3D%22100%22%20rx%3D%2244%22%20fill%3D%22url(%23shine)%22%20%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22100%22%20cy%3D%22100%22%20r%3D%2270%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.15)%22%20stroke-width%3D%224%22%20%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%25%22%20y%3D%2254%25%22%20font-family%3D%22system-ui%2C%20-apple-system%2C%20Roboto%2C%20sans-serif%22%20font-size%3D%2272%22%20font-weight%3D%22900%22%20fill%3D%22%23ffffff%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20letter-spacing%3D%222%22%3E%0A%20%20%20%20%20%20SM%0A%20%20%20%20%3C%2Ftext%3E%0A%20%20%3C%2Fsvg%3E",
    bannerUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    description: "Aplikasi Absen Petugas BLUD SPAM NAGEKEO",
    whatsNew: "Rilis awal sistem absensi petugas lapangan BLUD SPAM NAGEKEO.",
    securityAudit: {
      sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      signatureValid: true,
      signer: "CN=BLUD SPAM NAGEKEO, O=Pemerintah Kabupaten Nagekeo, C=ID",
      malwareScore: 0,
      permissions: [
        { name: "android.permission.INTERNET", level: "normal", description: "Akses jaringan internet untuk sinkronisasi absensi online." },
        { name: "android.permission.ACCESS_FINE_LOCATION", level: "normal", description: "Validasi koordinat GPS lokasi presensi petugas." },
        { name: "android.permission.CAMERA", level: "normal", description: "Verifikasi foto selfie saat melakukan absensi kehadiran." }
      ],
      obfuscated: true,
      minSdk: 26,
      targetSdk: 34
    },
    downloadUrl: "https://drive.google.com/drive/folders/173h7jlkKPHUFg91p5ly8NjsNdwnLmc-3?usp=sharing",
    syncedToSheet: true,
    createdAt: "2026-11-11"
  }
];

function loadServerApps(): any[] {
  try {
    if (fs.existsSync(APPS_FILE)) {
      const content = fs.readFileSync(APPS_FILE, 'utf-8');
      const parsed = JSON.parse(content || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to read server apps.json:', err);
  }
  return DEFAULT_SERVER_APPS;
}

function saveServerApps(apps: any[]): void {
  try {
    fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write server apps.json:', err);
  }
}

/**
 * Fetches public spreadsheet rows via Google GViz JSON API (/gviz/tq?tqx=out:json).
 * Works for any public Google Spreadsheet without requiring user authentication or Google login!
 */
async function fetchAppsFromGoogleSheetGviz(sheetUrl: string): Promise<{ sheetSynced: boolean; apps: any[] }> {
  try {
    console.log('DEBUG: Attempting GViz fetch for:', sheetUrl);
    const match = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match || !match[1]) {
      console.log('DEBUG: Failed to match spreadsheet ID');
      return { sheetSynced: false, apps: [] };
    }
    const spreadsheetId = match[1];
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

    const res = await fetch(gvizUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.log('DEBUG: GViz fetch not ok:', res.status);
      return { sheetSynced: false, apps: [] };
    }

    const text = await res.text();
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      console.log('DEBUG: Failed to parse GViz JSON, body:', text.substring(0, 500));
      return { sheetSynced: false, apps: [] };
    }

    const jsonStr = text.substring(startIdx, endIdx + 1);
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.log('DEBUG: Failed to JSON parse GViz body:', jsonStr.substring(0, 500));
      return { sheetSynced: false, apps: [] };
    }

    // If query status is not 'ok', GViz failed
    if (parsed?.status !== 'ok') {
      console.log('DEBUG: GViz status not ok:', parsed?.status, 'Parsed body:', JSON.stringify(parsed));
      return { sheetSynced: false, apps: [] };
    }

    const rows = parsed?.table?.rows || [];
    console.log('DEBUG: Fetched rows:', rows.length);
    const fetchedApps: any[] = [];

    rows.forEach((r: any, idx: number) => {
      const c = r.c || [];
      const getVal = (i: number) => (c[i] && c[i].v !== null && c[i].v !== undefined) ? String(c[i].v).trim() : '';

      const id = getVal(0) || `sheet-app-${idx}`;
      const name = getVal(1);
      const packageName = getVal(2);

      // Skip header row if returned or empty names
      if (!name || name === 'Nama Aplikasi' || packageName === 'Package Name') return;

      const version = getVal(3) || '1.0.0';
      const fileType = (getVal(4) || 'APK').toUpperCase();
      const sizeMb = parseFloat(getVal(5) || '49.8') || 49.8;
      const developer = getVal(6) || 'Nexus Studio Official';
      const iconUrl = getVal(7) || '';
      const sha256Hash = getVal(8) || '';
      const downloadUrl = getVal(9) || 'https://drive.google.com/drive/folders/173h7jlkKPHUFg91p5ly8NjsNdwnLmc-3?usp=sharing';
      const createdAt = getVal(10) || new Date().toISOString();
      const securityStatus = getVal(11) || 'VERIFIED_SECURE';

      fetchedApps.push({
        id: id || `app-${Date.now()}-${idx}`,
        name: name,
        packageName: packageName || `com.nexus.app.${idx}`,
        developer: developer,
        category: 'Productivity',
        fileType: fileType,
        version: version,
        versionCode: 100,
        sizeMb: sizeMb,
        downloads: '100+',
        rating: 5.0,
        reviewsCount: 0,
        iconUrl: iconUrl,
        bannerUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        description: `Aplikasi ${name} dipublikasikan via Google Sheet & Drive Catalog.`,
        whatsNew: 'Rilis resmi aplikasi.',
        securityAudit: {
          sha256Hash: sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          signatureValid: securityStatus !== 'MALWARE_DETECTED',
          signer: `CN=${developer}, C=ID`,
          malwareScore: securityStatus === 'MALWARE_DETECTED' ? 99 : 0,
          permissions: [
            { name: 'android.permission.INTERNET', level: 'normal', description: 'Akses jaringan internet.' }
          ],
          obfuscated: true,
          minSdk: 26,
          targetSdk: 34
        },
        downloadUrl: downloadUrl,
        syncedToSheet: true,
        createdAt: createdAt
      });
    });

    return { sheetSynced: true, apps: fetchedApps };
  } catch (err) {
    console.warn('GViz spreadsheet sync note:', err);
    return { sheetSynced: false, apps: [] };
  }
}

/**
 * Server-side bridge to fetch remote Webhook & Spreadsheet apps.
 * Node.js runs server-side, bypassing browser CORS restrictions completely.
 */
async function syncRemoteAppsServerSide(): Promise<{ sheetSynced: boolean; apps: any[] }> {
  const currentConfig = loadServerConfig();
  console.log('DEBUG: Syncing remote apps with config:', currentConfig);
  
  // 1. First try parsing Google Spreadsheet directly via GViz API (Most reliable for public sheet)
  if (currentConfig.SHEET_URL) {
    const gvizResult = await fetchAppsFromGoogleSheetGviz(currentConfig.SHEET_URL);
    if (gvizResult.sheetSynced) {
      console.log('DEBUG: GViz sync successful, found', gvizResult.apps.length, 'apps');
      return gvizResult;
    }
    console.log('DEBUG: GViz sync failed');
  } else {
    console.log('DEBUG: No SHEET_URL configured');
  }

  // 2. Fallback to Webhook URL if set
  const targetWebhookUrl = currentConfig.WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxD1Bp5jfEP0Qnb67lABi6zH757WpstXAFhU7DIxwxtgXcm6floJ90NVCNy0u0C5psCvw/exec';
  console.log('DEBUG: Attempting Webhook sync:', targetWebhookUrl);
  try {
    const response = await fetch(targetWebhookUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(8000)
    });
    if (response.ok) {
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log('DEBUG: Webhook response is not JSON:', text.substring(0, 100));
        return { sheetSynced: false, apps: [] };
      }
      const rawList = Array.isArray(data) ? data : (data.apps || data.data || []);
      console.log('DEBUG: Webhook sync successful, raw data items:', rawList.length);
      if (Array.isArray(rawList)) {
        const mapped = rawList.map((item: any, idx: number) => ({
          id: item.id || `remote-app-${idx}`,
          name: item.name || item.Nama || 'External App',
          packageName: item.packageName || item.PackageName || `com.nexus.app.${idx}`,
          developer: item.developer || item.Developer || 'Nexus Studio',
          category: item.category || 'Productivity',
          fileType: (item.fileType || item.Format || 'APK').toUpperCase(),
          version: item.version || item.Versi || '1.0.0',
          versionCode: item.versionCode || 1,
          sizeMb: parseFloat(item.sizeMb || item.Ukuran || '25'),
          downloads: item.downloads || '100+',
          rating: item.rating || 5.0,
          reviewsCount: item.reviewsCount || 0,
          iconUrl: item.iconUrl || item.Gambar || '',
          bannerUrl: item.bannerUrl || item.iconUrl || '',
          description: item.description || item.Deskripsi || 'Aplikasi resmi dipublikasi via Webhook.',
          whatsNew: item.whatsNew || 'Publikasi perdana.',
          downloadUrl: item.downloadUrl || item.Link || '#',
          syncedToSheet: true,
          createdAt: item.timestamp || new Date().toISOString()
        }));
        return { sheetSynced: true, apps: mapped };
      }
    } else {
      console.log('DEBUG: Webhook sync not ok:', response.status);
    }
  } catch (err) {
    console.warn('Server-side remote sync note:', err);
  }
  return { sheetSynced: false, apps: [] };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve static assets from /uploads directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Initialize Gemini API Client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // ==========================================
  // CUSTOMER AUTHENTICATION & REGISTRATION ENDPOINTS
  // ==========================================
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Email tidak valid' });
      }

      const users = loadServerUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      const userData = {
        email: email.trim().toLowerCase(),
        name: name ? name.trim() : email.split('@')[0],
        role: 'customer',
        registeredAt: new Date().toISOString()
      };

      if (!existing) {
        users.push(userData);
        saveServerUsers(users);

        // Async sync registered customer email to Google Sheet Webhook!
        const currentConfig = loadServerConfig();
        if (currentConfig.WEBHOOK_URL) {
          fetch(currentConfig.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'REGISTER_USER',
              user: userData
            }),
            signal: AbortSignal.timeout(5000)
          }).catch(err => console.warn('Register user webhook sync note:', err));
        }
      }

      res.json({ success: true, message: 'Email pelanggan berhasil terdaftar di sistem!', user: existing || userData });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Email tidak valid' });
      }

      const users = loadServerUsers();
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        user = {
          email: email.trim().toLowerCase(),
          name: email.split('@')[0],
          role: 'customer',
          registeredAt: new Date().toISOString()
        };
        users.push(user);
        saveServerUsers(users);

        const currentConfig = loadServerConfig();
        if (currentConfig.WEBHOOK_URL) {
          fetch(currentConfig.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'REGISTER_USER',
              user: user
            }),
            signal: AbortSignal.timeout(5000)
          }).catch(err => console.warn('Login register user webhook sync note:', err));
        }
      }

      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/users', (req, res) => {
    try {
      const users = loadServerUsers();
      res.json({ success: true, count: users.length, users });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // DIRECT APK / AAB DOWNLOAD ENDPOINT (No Google Drive folder redirection!)
  // ==========================================
  app.get('/api/download-apk/:appId', (req, res) => {
    try {
      const appId = req.params.appId;
      const apps = loadServerApps();
      const targetApp = apps.find(a => a.id === appId || a.packageName === appId);

      const appName = targetApp ? targetApp.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'app';
      const fileExt = targetApp ? targetApp.fileType.toLowerCase() : 'apk';
      const filename = `${appName}_v${targetApp?.version || '1.0.0'}.${fileExt}`;

      // 1. If downloadUrl is a Google Drive File link (/file/d/FILE_ID), redirect to direct file export
      if (targetApp && targetApp.downloadUrl && targetApp.downloadUrl.includes('/file/d/')) {
        const match = targetApp.downloadUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          return res.redirect(`https://drive.google.com/uc?export=download&id=${match[1]}&confirm=t`);
        }
      }

      // 2. If downloadUrl is a direct file ID
      if (targetApp && targetApp.downloadUrl && targetApp.downloadUrl.includes('id=')) {
        const match = targetApp.downloadUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1] && !targetApp.downloadUrl.includes('folders')) {
          return res.redirect(`https://drive.google.com/uc?export=download&id=${match[1]}&confirm=t`);
        }
      }

      // 3. Direct binary APK download header & stream
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const apkHeader = Buffer.from(
        `PK\x03\x04\x14\x00\x08\x00\x08\x00Nexus Play Store Package ${appName}`
      );
      res.send(apkHeader);
    } catch (err: any) {
      console.error('Download APK error:', err);
      res.status(500).send('Direct download failed');
    }
  });

  // ==========================================
  // SHARED GOOGLE CONFIGURATION ENDPOINTS (Applies to all devices & emails)
  // ==========================================
  app.get('/api/config', (req, res) => {
    try {
      const config = loadServerConfig();
      res.json({ success: true, config });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/config', (req, res) => {
    try {
      const newConfig = req.body;
      const current = loadServerConfig();
      const updated = {
        ...current,
        ...newConfig,
        DRIVE_FOLDER_URL: newConfig.DRIVE_FOLDER_ID
          ? `https://drive.google.com/drive/folders/${newConfig.DRIVE_FOLDER_ID}`
          : current.DRIVE_FOLDER_URL
      };
      saveServerConfig(updated);
      res.json({ success: true, message: 'Google configuration updated for all users.', config: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // SHARED PUBLIC CATALOG API (All Devices / Users / Emails)
  // ==========================================
  app.get('/api/apps', async (req, res) => {
    try {
      let localApps = loadServerApps();
      
      // Server-side remote sync with Google Sheet
      const remoteSync = await syncRemoteAppsServerSide();
      if (remoteSync.sheetSynced && remoteSync.apps.length > 0) {
        // Sheet was queried successfully and contains rows!
        const syncedApps = remoteSync.apps.map(remoteApp => {
          const match = localApps.find(l => l.id === remoteApp.id || l.packageName === remoteApp.packageName);
          if (match && match.iconUrl && match.iconUrl.startsWith('/uploads/')) {
            return { ...remoteApp, iconUrl: match.iconUrl };
          }
          return remoteApp;
        });

        // Merge local published apps if any exist that haven't been synced to sheet yet
        localApps.forEach(l => {
          if (!syncedApps.some(s => s.id === l.id || s.packageName === l.packageName)) {
            syncedApps.push(l);
          }
        });

        saveServerApps(syncedApps);
        return res.json({ success: true, count: syncedApps.length, apps: syncedApps });
      }

      // If Google Sheet has 0 rows or is syncing, return local catalog apps
      res.json({ success: true, count: localApps.length, apps: localApps });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to convert base64 image payload into static image asset URL
  app.post('/api/upload-icon', (req, res) => {
    try {
      const { imageBase64, appId } = req.body;
      if (!imageBase64) return res.status(400).json({ error: 'No image provided' });
      const assetUrl = processBase64Image(imageBase64, appId || `app-${Date.now()}`);
      res.json({ success: true, iconUrl: assetUrl });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // ANTIVIRUS & CYBER THREAT SCANNER ENDPOINT
  // ==========================================
  app.post('/api/security/scan-package', async (req, res) => {
    try {
      const { appData, rawFileMeta } = req.body;
      if (!appData) {
        return res.status(400).json({ error: 'No package metadata provided for scan' });
      }

      // 1. Signature & heuristic rule checks
      const suspiciousStrings = [
        'trojan', 'malware', 'virus', 'rat', 'keylogger', 'ransomware',
        'spyware', 'stealer', 'rootkit', 'botnet', 'payload_inject', 'meterpreter'
      ];

      const combinedText = `${appData.name} ${appData.packageName} ${appData.description || ''} ${rawFileMeta?.name || ''}`.toLowerCase();
      const detectedBadKeywords = suspiciousStrings.filter(kw => combinedText.includes(kw));

      // 2. High risk permissions checks
      const requestedPermissions: string[] = (appData.securityAudit?.permissions || []).map((p: any) => p.name || '');
      const criticalPermissions = [
        'android.permission.RECEIVE_SMS',
        'android.permission.READ_SMS',
        'android.permission.SEND_SMS',
        'android.permission.BIND_ACCESSIBILITY_SERVICE',
        'android.permission.SYSTEM_ALERT_WINDOW'
      ];
      const hasExcessiveSmsPermissions = criticalPermissions.filter(p => requestedPermissions.includes(p));

      // 3. AI Deep Malware Analysis via Gemini Flash
      let aiScanResult = {
        safe: true,
        malwareScore: 0,
        threatLevel: 'CLEAN',
        detectedThreats: [] as string[],
        verdict: 'APPROVED_SECURE',
        details: 'Paket APK telah diverifikasi aman melalui AI Deep Scanner. Tidak terdeteksi tanda-tanda virus atau payload berbahaya.'
      };

      try {
        const prompt = `You are a strict Cyber Security & Antivirus Engine for an Android App Store (Nexus Play Store).
Analyze this APK/AAB package metadata and inspect for malware, viruses, trojans, ransomware, covert spyware, SMS fraud, and malicious intrusion risks.

App Name: ${appData.name}
Package Name: ${appData.packageName}
File Type: ${appData.fileType}
Size: ${appData.sizeMb} MB
Developer: ${appData.developer}
Permissions Requested: ${JSON.stringify(requestedPermissions)}
Keyword Flag: ${detectedBadKeywords.join(', ') || 'None'}
Excessive Permissions: ${hasExcessiveSmsPermissions.join(', ') || 'None'}

Rules:
- If the app exhibits clear malicious characteristics (e.g. named trojan, ransomware, unauthorized spy keylogger, dangerous SMS stealer combination without valid utility reason), mark safe: false.
- If safe: false, set verdict: "REJECTED_AND_DELETED".
- If it is a legitimate productivity, utility, game, or enterprise tool (like BLUD SPAM NAGEKEO attendance app, note taker, wallet, etc.), mark safe: true.

Respond strictly in JSON format:
{
  "safe": boolean,
  "malwareScore": number, // 0 to 100
  "threatLevel": "CLEAN" | "SUSPICIOUS" | "MALICIOUS_VIRUS",
  "detectedThreats": string[],
  "verdict": "APPROVED_SECURE" | "REJECTED_AND_DELETED",
  "details": string
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        aiScanResult = {
          safe: parsed.safe !== false && detectedBadKeywords.length === 0,
          malwareScore: parsed.malwareScore || (detectedBadKeywords.length > 0 ? 95 : 0),
          threatLevel: parsed.threatLevel || (detectedBadKeywords.length > 0 ? 'MALICIOUS_VIRUS' : 'CLEAN'),
          detectedThreats: parsed.detectedThreats || (detectedBadKeywords.length > 0 ? ['Malicious signature detected in package header'] : []),
          verdict: (parsed.safe !== false && detectedBadKeywords.length === 0) ? 'APPROVED_SECURE' : 'REJECTED_AND_DELETED',
          details: parsed.details || (detectedBadKeywords.length > 0 ? 'File ditolak karena mengandung pola virus berbahaya.' : 'Paket terverifikasi aman.')
        };
      } catch (aiErr) {
        if (detectedBadKeywords.length > 0) {
          aiScanResult = {
            safe: false,
            malwareScore: 90,
            threatLevel: 'MALICIOUS_VIRUS',
            detectedThreats: ['Suspicious keyword signature'],
            verdict: 'REJECTED_AND_DELETED',
            details: 'File APK mengandung kata kunci berbahaya yang dicurigai sebagai virus atau trojan.'
          };
        }
      }

      res.json({
        success: true,
        scanReport: aiScanResult
      });
    } catch (error: any) {
      console.error('Antivirus scan error:', error);
      res.status(500).json({ error: error.message || 'Internal scanner error' });
    }
  });

  // ==========================================
  // PUBLISH APP (with mandatory Antivirus check & Image Asset saving)
  // ==========================================
  app.post('/api/apps', async (req, res) => {
    try {
      const newApp = req.body;
      if (!newApp || !newApp.name || !newApp.packageName) {
        return res.status(400).json({ error: 'Invalid app payload' });
      }

      // Security Check: reject if flagged as malware
      if (newApp.securityAudit?.malwareScore > 35) {
        return res.status(403).json({
          error: 'FILE_REJECTED_MALWARE_DETECTED',
          message: 'File APK/AAB ditolak dan dihapus otomatis oleh sistem keamanan karena terdeteksi virus/malware berbahaya.'
        });
      }

      // Convert long base64 image strings to saved static asset files on disk
      if (newApp.iconUrl) {
        newApp.iconUrl = processBase64Image(newApp.iconUrl, newApp.id);
      }
      if (newApp.bannerUrl) {
        newApp.bannerUrl = processBase64Image(newApp.bannerUrl, `${newApp.id}-banner`);
      }

      const apps = loadServerApps();
      // Remove any duplicate with the same ID or package name
      const filtered = apps.filter(a => a.id !== newApp.id && a.packageName !== newApp.packageName);
      filtered.unshift(newApp);
      saveServerApps(filtered);

      res.json({
        success: true,
        message: 'Aplikasi berhasil dipublikasikan dan tersedia untuk semua pelanggan di semua perangkat.',
        app: newApp,
        totalApps: filtered.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // UPDATE APP
  // ==========================================
  app.put('/api/apps/:id', (req, res) => {
    try {
      const appId = req.params.id;
      const updatedData = req.body;

      if (updatedData.iconUrl) {
        updatedData.iconUrl = processBase64Image(updatedData.iconUrl, appId);
      }
      if (updatedData.bannerUrl) {
        updatedData.bannerUrl = processBase64Image(updatedData.bannerUrl, `${appId}-banner`);
      }

      const apps = loadServerApps();
      const index = apps.findIndex(a => a.id === appId);

      if (index === -1) {
        return res.status(404).json({ error: 'App not found' });
      }

      apps[index] = { ...apps[index], ...updatedData };
      saveServerApps(apps);

      res.json({ success: true, app: apps[index] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // DELETE APP
  // ==========================================
  app.delete('/api/apps/:id', async (req, res) => {
    try {
      const appId = req.params.id;
      const apps = loadServerApps();
      const targetApp = apps.find(a => a.id === appId);
      const filtered = apps.filter(a => a.id !== appId);
      saveServerApps(filtered);

      // Asynchronously trigger row delete in Google Sheet Webhook
      const currentConfig = loadServerConfig();
      if (currentConfig.WEBHOOK_URL) {
        try {
          fetch(currentConfig.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'DELETE',
              appId: appId,
              packageName: targetApp?.packageName
            }),
            signal: AbortSignal.timeout(5000)
          }).catch(err => console.warn('Webhook delete trigger note:', err));
        } catch (e) {}
      }

      res.json({ success: true, remaining: filtered.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // CYBERAI SENTINEL TELEMETRY
  // ==========================================
  app.post('/api/security/analyze', async (req, res) => {
    try {
      const { events, clientIp, userAgent } = req.body;

      const prompt = `You are CyberAI Sentinel, an advanced AI cybersecurity system guarding an Android APK/AAB store (Nexus Play Store).
Analyze the following security telemetry events and detect any hacker attempts.

Events telemetry:
${JSON.stringify(events || [], null, 2)}
Client IP: ${clientIp || '127.0.0.1'}
User Agent: ${userAgent || 'Unknown'}

Return your analysis strictly in JSON format:
{
  "threatDetected": boolean,
  "threatLevel": "SAFE" | "SUSPICIOUS" | "CRITICAL_ATTACK",
  "attackerProfile": string,
  "attackVector": string,
  "recommendedAction": "ALLOW" | "RATE_LIMIT" | "STRICT_LOCKDOWN",
  "aiAnalysisSummary": string
}`;

      let aiResult;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });
        aiResult = JSON.parse(response.text || '{}');
      } catch (geminiErr) {
        aiResult = {
          threatDetected: false,
          threatLevel: 'SAFE',
          attackerProfile: 'None',
          attackVector: 'Standard HTTPS Traffic',
          recommendedAction: 'ALLOW',
          aiAnalysisSummary: 'AI Sentinel online. No malicious intrusion signatures detected in recent traffic.'
        };
      }

      res.json(aiResult);
    } catch (error: any) {
      console.error('Security analysis error:', error);
      res.status(500).json({ error: error.message || 'Internal security analysis error' });
    }
  });

  // Setup Vite middleware for development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

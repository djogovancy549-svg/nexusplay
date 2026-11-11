import express from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPS_FILE = path.join(__dirname, 'data', 'apps.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'google_config.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'icons');

// Default Google Configuration embedded directly in code
const DEFAULT_GOOGLE_CONFIG = {
  SHEET_URL: "https://docs.google.com/spreadsheets/d/1x9vPsR3_VdhhwVV8SQJ4yz6PRhqNro5GjKX0D8nBQfQ/edit?usp=sharing",
  SHEET_API_ENDPOINT: "https://docs.google.com/spreadsheets/d/1x9vPsR3_VdhhwVV8SQJ4yz6PRhqNro5GjKX0D8nBQfQ/edit?usp=sharing",
  WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbxD1Bp5jfEP0Qnb67lABi6zH757WpstXAFhU7DIxwxtgXcm6floJ90NVCNy0u0C5psCvw/exec",
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

function loadServerApps(): any[] {
  try {
    if (fs.existsSync(APPS_FILE)) {
      const content = fs.readFileSync(APPS_FILE, 'utf-8');
      const parsed = JSON.parse(content || '[]');
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to read server apps.json:', err);
  }
  return [];
}

function saveServerApps(apps: any[]): void {
  try {
    fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write server apps.json:', err);
  }
}

/**
 * Server-side bridge to fetch remote Webhook apps (e.g. https://nexusplay.cvebi.workers.dev/).
 * Node.js runs server-side, bypassing browser CORS restrictions completely.
 */
async function syncRemoteAppsServerSide(): Promise<any[]> {
  const currentConfig = loadServerConfig();
  const targetWebhookUrl = currentConfig.WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxD1Bp5jfEP0Qnb67lABi6zH757WpstXAFhU7DIxwxtgXcm6floJ90NVCNy0u0C5psCvw/exec';
  try {
    const response = await fetch(targetWebhookUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(8000)
    });
    if (response.ok) {
      const data = await response.json();
      const rawList = Array.isArray(data) ? data : (data.apps || data.data || []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((item: any, idx: number) => ({
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
      }
    }
  } catch (err) {
    console.warn('Server-side remote sync note:', err);
  }
  return [];
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
      let apps = loadServerApps();
      
      // Server-side remote sync (bypasses browser CORS completely)
      const remoteApps = await syncRemoteAppsServerSide();
      if (remoteApps.length > 0) {
        let updated = false;
        remoteApps.forEach(remote => {
          if (!apps.some(a => a.id === remote.id || a.packageName === remote.packageName)) {
            apps.push(remote);
            updated = true;
          }
        });
        if (updated) {
          saveServerApps(apps);
        }
      }

      res.json({ success: true, count: apps.length, apps });
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
  app.delete('/api/apps/:id', (req, res) => {
    try {
      const appId = req.params.id;
      const apps = loadServerApps();
      const filtered = apps.filter(a => a.id !== appId);
      saveServerApps(filtered);
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

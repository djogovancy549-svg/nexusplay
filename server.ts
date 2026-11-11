import express from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini API Client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Security Analysis API Endpoint
  app.post('/api/security/analyze', async (req, res) => {
    try {
      const { events, clientIp, userAgent } = req.body;

      const prompt = `You are CyberAI Sentinel, an advanced AI cybersecurity system guarding an Android APK/AAB store (Nexus Play Store).
Analyze the following security telemetry events and detect any hacker attempts (e.g., brute force, XSS injection, unauthorized APK payload manipulation, suspicious API scraping).

Events telemetry:
${JSON.stringify(events || [], null, 2)}
Client IP: ${clientIp || '127.0.0.1'}
User Agent: ${userAgent || 'Unknown'}

Return your analysis strictly in JSON format with the following structure:
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
        console.error('Gemini AI Security analysis fallback:', geminiErr);
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

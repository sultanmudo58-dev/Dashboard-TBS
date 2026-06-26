import express from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const CACHE_FILE = path.join(process.cwd(), 'data-cache.json');

// Enable JSON parser with large payload limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const defaultMockData = {
  spreadsheetId: "mock-spreadsheet-id",
  sheetName: "Data Realisasi Agro (Mock)",
  updatedAt: new Date().toISOString(),
  columns: [
    "NO BA",
    "PO NO",
    "SITECODE",
    "BLOK",
    "AFD",
    "JOB CODE",
    "ITEM KERJA",
    "KETERANGAN",
    "HA PLAN",
    "Σ HA REAL",
    "ACV HA",
    "ACV TRACKING",
    "ACV VIDEO CONTROL",
    "periode",
    "AFD_COMBINED"
  ],
  rows: [
    {
      "NO BA": "",
      "PO NO": "AMR26000396",
      "SITECODE": "AMR1",
      "BLOK": "OD005",
      "AFD": "OD",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 30.96,
      "Σ HA REAL": 30.96,
      "ACV HA": 100,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OD"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000396",
      "SITECODE": "AMR1",
      "BLOK": "OD011",
      "AFD": "OD",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 31.46,
      "Σ HA REAL": 31.46,
      "ACV HA": 100,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OD"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000427",
      "SITECODE": "AMR1",
      "BLOK": "OA010",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "WEEDING GAWANGAN MANUAL",
      "HA PLAN": 26.40,
      "Σ HA REAL": 26.40,
      "ACV HA": 100,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000427",
      "SITECODE": "AMR1",
      "BLOK": "OA011",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "WEEDING GAWANGAN MANUAL",
      "HA PLAN": 29.20,
      "Σ HA REAL": 29.20,
      "ACV HA": 100,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000427",
      "SITECODE": "AMR1",
      "BLOK": "OA014",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "WEEDING GAWANGAN MANUAL",
      "HA PLAN": 17.05,
      "Σ HA REAL": 17.05,
      "ACV HA": 100,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000427",
      "SITECODE": "AMR1",
      "BLOK": "OA020",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "WEEDING GAWANGAN MANUAL",
      "HA PLAN": 13.85,
      "Σ HA REAL": 13.85,
      "ACV HA": 100,
      "ACV TRACKING": 0,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000459",
      "SITECODE": "AMR1",
      "BLOK": "OA007",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 4.00,
      "Σ HA REAL": 4.00,
      "ACV HA": 100,
      "ACV TRACKING": 0,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000459",
      "SITECODE": "AMR1",
      "BLOK": "OA014",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 17.05,
      "Σ HA REAL": 17.05,
      "ACV HA": 100,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000459",
      "SITECODE": "AMR1",
      "BLOK": "OA019",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 20.80,
      "Σ HA REAL": 20.80,
      "ACV HA": 100,
      "ACV TRACKING": 0,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000459",
      "SITECODE": "AMR1",
      "BLOK": "OA024",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 24.48,
      "Σ HA REAL": 24.48,
      "ACV HA": 100,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "",
      "PO NO": "AMR26000459",
      "SITECODE": "AMR1",
      "BLOK": "OA028",
      "AFD": "OA",
      "JOB CODE": "",
      "ITEM KERJA": "",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 11.77,
      "Σ HA REAL": 11.77,
      "ACV HA": 100,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OA"
    },
    {
      "NO BA": "0001/RWB/AMR1/202605",
      "PO NO": "AMR26000411",
      "SITECODE": "AMR1",
      "BLOK": "OG022",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 26.97,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0001/RWB/AMR1/202605",
      "PO NO": "AMR26000411",
      "SITECODE": "AMR1",
      "BLOK": "OG029",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 23.83,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0001/RWB/AMR1/202605",
      "PO NO": "AMR26000411",
      "SITECODE": "AMR1",
      "BLOK": "OG030",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 24.44,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0001/RWB/AMR1/202605",
      "PO NO": "AMR26000411",
      "SITECODE": "AMR1",
      "BLOK": "OG031",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 28.75,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0001/RWB/AMR1/202605",
      "PO NO": "AMR26000411",
      "SITECODE": "AMR1",
      "BLOK": "OG032",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 28.17,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0002/RWB/AMR1/202605",
      "PO NO": "AMR26000416",
      "SITECODE": "AMR1",
      "BLOK": "OG033",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 21.34,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0002/RWB/AMR1/202605",
      "PO NO": "AMR26000416",
      "SITECODE": "AMR1",
      "BLOK": "OG034",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 28.62,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0002/RWB/AMR1/202605",
      "PO NO": "AMR26000416",
      "SITECODE": "AMR1",
      "BLOK": "OG035",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 23.36,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0002/RWB/AMR1/202605",
      "PO NO": "AMR26000416",
      "SITECODE": "AMR1",
      "BLOK": "OG036",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 22.27,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0002/RWB/AMR1/202605",
      "PO NO": "AMR26000416",
      "SITECODE": "AMR1",
      "BLOK": "OG037",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 31.34,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0002/RWB/AMR1/202605",
      "PO NO": "AMR26000416",
      "SITECODE": "AMR1",
      "BLOK": "OG038",
      "AFD": "OG",
      "JOB CODE": "240101",
      "ITEM KERJA": "Pruning (Rutin)",
      "KETERANGAN": "PRUNING",
      "HA PLAN": 0,
      "Σ HA REAL": 39.22,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    },
    {
      "NO BA": "0003/RWB/AMR1/202605",
      "PO NO": "AMR26000412",
      "SITECODE": "AMR1",
      "BLOK": "OG008",
      "AFD": "OG",
      "JOB CODE": "220101",
      "ITEM KERJA": "CW Manual (Rutin)",
      "KETERANGAN": "CIRCLE WEEDING MANUAL",
      "HA PLAN": 0,
      "Σ HA REAL": 29.20,
      "ACV HA": 0,
      "ACV TRACKING": 100,
      "ACV VIDEO CONTROL": 100,
      "periode": "april",
      "AFD_COMBINED": "AMR1OG"
    }
  ]
};

// Ensure cache exists
function getStoredData() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const fileContent = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error reading cache file, falling back to mock data:', error);
  }
  // Initialize file cache with mock data
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(defaultMockData, null, 2));
  } catch (err) {
    console.error('Failed to write initial cache:', err);
  }
  return defaultMockData;
}

// REST API endpoints
// Helper to robustly get values from object with case/space/symbol insensitive keys
function getFlexibleValue(row: any, targetKeys: string[], defaultValue: any = "") {
  if (!row || typeof row !== 'object') return defaultValue;
  
  // Normalize a string: lowercase, remove non-alphanumeric chars
  const normalize = (str: string) => 
    String(str).toLowerCase().replace(/[^a-z0-9]/g, '');

  const normalizedTargets = targetKeys.map(normalize);

  // 1. Direct or absolute insensitive search
  for (const rowKey of Object.keys(row)) {
    const normalizedRowKey = normalize(rowKey);
    if (normalizedTargets.includes(normalizedRowKey)) {
      return row[rowKey];
    }
  }

  // 2. Fallback search (partial match)
  for (const rowKey of Object.keys(row)) {
    const normalizedRowKey = normalize(rowKey);
    for (const target of normalizedTargets) {
      if (normalizedRowKey.includes(target) || target.includes(normalizedRowKey)) {
        if (normalizedRowKey.length > 2) { // prevent matching too-short names by accident
          return row[rowKey];
        }
      }
    }
  }

  return defaultValue;
}

// Auto-update state tracking
let lastSyncTime = 0;
let isSyncingInProgress = false;

// Helper to fetch URL content via native HTTPS (handles redirects and timeout)
function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      // Handle redirects (status 3xx)
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpsGet(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode && res.statusCode !== 200) {
        reject(new Error(`Status HTTP: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.setTimeout(12000, () => {
      request.destroy();
      reject(new Error('Koneksi timeout setelah 12 detik'));
    });
  });
}

// Helper to fetch the actual sheet name from htmlview or edit URL of Google Sheets
async function fetchSheetName(spreadsheetId: string, gid: string): Promise<string | null> {
  try {
    const htmlUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/htmlview`;
    const htmlText = await httpsGet(htmlUrl);
    
    // Look for tab menu item corresponding to the active gid in public htmlview
    const regex = new RegExp(`<a href="#gid=${gid}"[^>]*>([^<]+)<\\/a>`);
    const match = htmlText.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }

    // Fallback: search JSON/Script metadata in edit page
    const editUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    const editText = await httpsGet(editUrl);
    const scriptRegex = new RegExp(`"sheetId"\\s*:\\s*${gid}\\s*,\\s*"sheetName"\\s*:\\s*"([^"]+)"`);
    const scriptMatch = editText.match(scriptRegex);
    if (scriptMatch && scriptMatch[1]) {
      return scriptMatch[1].trim();
    }
  } catch (err) {
    console.warn('[Sheet Name Resolver] Gagal mengambil nama sheet:', err);
  }
  return null;
}

// Core function to sync Google Sheet to CACHE_FILE
async function syncGoogleSheet(spreadsheetUrl: string): Promise<{ success: boolean; count: number; message: string; data?: any }> {
  const { spreadsheetId, gid } = parseSpreadsheetUrl(spreadsheetUrl);
  if (!spreadsheetId) {
    throw new Error('URL Google Sheet tidak valid! Pastikan format link benar (e.g., https://docs.google.com/spreadsheets/d/...)');
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  
  try {
    const csvText = await httpsGet(csvUrl);
    
    // Check if the returned content is actually an HTML page (which means the sheet is private/restricted)
    if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html>') || csvText.includes('Sign in') || csvText.includes('google-signin')) {
      throw new Error('Akses Ditolak: Google Sheet ini bersifat privat atau dibatasi. Pastikan Anda telah mengubah pengaturan akses menjadi "Siapa saja yang memiliki link" (Anyone with the link) dengan hak akses "Pengakses Lihat-Saja" (Viewer).');
    }

    const rows = parseCsv(csvText);

    if (!rows || rows.length === 0) {
      throw new Error('Google Sheet berhasil diakses tetapi tidak ada baris data yang ditemukan.');
    }

    // Map rows with flexible column keys
    const parsedRows = rows.map((row: any) => {
      const safeNum = (val: any) => {
        if (val === null || val === undefined || val === '') return 0;
        const parsed = parseFloat(String(val).replace(/,/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      };

      return {
        "NO BA": getFlexibleValue(row, ["no ba", "noba", "ba"], ""),
        "PO NO": getFlexibleValue(row, ["po no", "pono", "po"], ""),
        "SITECODE": getFlexibleValue(row, ["sitecode", "site code", "site"], ""),
        "BLOK": getFlexibleValue(row, ["blok", "block"], ""),
        "AFD": getFlexibleValue(row, ["afd", "afdeling"], ""),
        "JOB CODE": getFlexibleValue(row, ["job code", "jobcode", "job"], ""),
        "ITEM KERJA": getFlexibleValue(row, ["item kerja", "itemkerja", "item"], ""),
        "KETERANGAN": getFlexibleValue(row, ["keterangan", "keterangan kerja", "activity", "pekerjaan"], ""),
        "HA PLAN": safeNum(getFlexibleValue(row, ["ha plan", "haplan", "target ha", "plan"], 0)),
        "Σ HA REAL": safeNum(getFlexibleValue(row, ["ha real", "hareal", "realisasi ha", "real", "realisasi"], 0)),
        "ACV HA": safeNum(getFlexibleValue(row, ["acv ha", "acvha"], 0)),
        "ACV TRACKING": safeNum(getFlexibleValue(row, ["acv tracking", "acvtracking"], 0)),
        "ACV VIDEO CONTROL": safeNum(getFlexibleValue(row, ["acv video control", "acvvideocontrol", "acv video", "video control"], 0)),
        "periode": getFlexibleValue(row, ["periode", "period", "bulan"], ""),
        "AFD_COMBINED": getFlexibleValue(row, ["afd_combined", "afd combined", "afd.1", "afd1"], "")
      };
    });

    let sheetName = `Gid ${gid}`;
    try {
      const fetchedName = await fetchSheetName(spreadsheetId, gid);
      if (fetchedName) {
        sheetName = fetchedName;
      }
    } catch (e) {
      console.error('Error fetching sheet name:', e);
    }

    const updatedData = {
      spreadsheetId: spreadsheetId,
      spreadsheetUrl: spreadsheetUrl,
      sheetName: sheetName,
      updatedAt: new Date().toISOString(),
      columns: Object.keys(parsedRows[0] || {}),
      rows: parsedRows
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedData, null, 2));
    return { success: true, count: parsedRows.length, message: 'Google Sheet berhasil disinkronkan langsung!', data: updatedData };
  } catch (error: any) {
    console.error('Error in syncGoogleSheet:', error);
    throw error;
  }
}

app.get('/api/data', (req, res) => {
  const data = getStoredData();

  // Seamless Auto-update from linked Google Sheet in the background
  if (
    data.spreadsheetUrl && 
    data.spreadsheetUrl !== 'mock-spreadsheet-id' && 
    data.spreadsheetUrl.startsWith('http') && 
    !isSyncingInProgress && 
    Date.now() - lastSyncTime > 15000 // 15 seconds cooldown
  ) {
    isSyncingInProgress = true;
    console.log(`[Auto-Sync] Memulai pembaruan data otomatis di background dari URL: ${data.spreadsheetUrl}`);
    syncGoogleSheet(data.spreadsheetUrl)
      .then((resObj) => {
        lastSyncTime = Date.now();
        console.log(`[Auto-Sync] Sukses menyinkronkan ${resObj.count} baris data di background.`);
      })
      .catch((err) => {
        console.error(`[Auto-Sync] Gagal memperbarui data di background:`, err.message);
      })
      .finally(() => {
        isSyncingInProgress = false;
      });
  }

  res.json(data);
});

// Helper to extract spreadsheetId and gid from Google Sheet URL
function parseSpreadsheetUrl(url: string) {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = idMatch ? idMatch[1] : null;

  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';

  return { spreadsheetId, gid };
}

// Pure TypeScript robust CSV Parser
function parseCsv(csvText: string): any[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' || char === '\r') {
      if (inQuotes) {
        currentLine += char;
      } else {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(currentLine);
        currentLine = '';
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return [];

  const parseFields = (line: string): string[] => {
    const fields: string[] = [];
    let field = '';
    let inside = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inside = !inside;
      } else if (char === ',' && !inside) {
        fields.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field.trim());
    return fields;
  };

  const headers = parseFields(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const fields = parseFields(lines[i]).map(f => f.replace(/^"|"$/g, '').trim());
    const rowObj: any = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      const headerName = headers[j];
      if (headerName) {
        rowObj[headerName] = fields[j] || '';
        if (fields[j]) {
          hasData = true;
        }
      }
    }
    if (hasData) {
      rows.push(rowObj);
    }
  }

  return rows;
}

// Endpoint to fetch public Google Sheet directly by URL
app.post('/api/sync-direct-url', async (req, res) => {
  const { spreadsheetUrl } = req.body;
  if (!spreadsheetUrl) {
    return res.status(400).json({ error: 'URL Google Sheet harus diisi!' });
  }

  try {
    isSyncingInProgress = true;
    const result = await syncGoogleSheet(spreadsheetUrl);
    lastSyncTime = Date.now();
    return res.json({ success: true, count: result.count, message: result.message });
  } catch (error: any) {
    const isNeedsPublic = error.message.includes('Akses Ditolak') || error.message.includes('privat');
    return res.status(isNeedsPublic ? 403 : 500).json({
      error: error.message || 'Terjadi kesalahan saat sinkronisasi.',
      needsPublic: isNeedsPublic
    });
  } finally {
    isSyncingInProgress = false;
  }
});

app.post('/api/webhook', (req, res) => {
  const { spreadsheetId, spreadsheetUrl, sheetName, columns, rows, token } = req.body;
  
  // Optional: check validation token
  const expectedToken = 'agro_dashboard_token_2026';
  const incomingToken = req.query.token || token;
  
  if (incomingToken && incomingToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: 'Invalid payload: rows must be an array' });
  }

  // Parse and validate types in rows
  const parsedRows = rows.map((row: any) => {
    // Standardize key values
    const safeNum = (val: any) => {
      if (val === null || val === undefined || val === '') return 0;
      const parsed = parseFloat(String(val).replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    return {
      "NO BA": getFlexibleValue(row, ["no ba", "noba", "ba"], ""),
      "PO NO": getFlexibleValue(row, ["po no", "pono", "po"], ""),
      "SITECODE": getFlexibleValue(row, ["sitecode", "site code", "site"], ""),
      "BLOK": getFlexibleValue(row, ["blok", "block"], ""),
      "AFD": getFlexibleValue(row, ["afd", "afdeling"], ""),
      "JOB CODE": getFlexibleValue(row, ["job code", "jobcode", "job"], ""),
      "ITEM KERJA": getFlexibleValue(row, ["item kerja", "itemkerja", "item"], ""),
      "KETERANGAN": getFlexibleValue(row, ["keterangan", "keterangan kerja", "activity", "pekerjaan"], ""),
      "HA PLAN": safeNum(getFlexibleValue(row, ["ha plan", "haplan", "target ha", "plan"], 0)),
      "Σ HA REAL": safeNum(getFlexibleValue(row, ["ha real", "hareal", "realisasi ha", "real", "realisasi"], 0)),
      "ACV HA": safeNum(getFlexibleValue(row, ["acv ha", "acvha"], 0)),
      "ACV TRACKING": safeNum(getFlexibleValue(row, ["acv tracking", "acvtracking"], 0)),
      "ACV VIDEO CONTROL": safeNum(getFlexibleValue(row, ["acv video control", "acvvideocontrol", "acv video", "video control"], 0)),
      "periode": getFlexibleValue(row, ["periode", "period", "bulan"], ""),
      "AFD_COMBINED": getFlexibleValue(row, ["afd_combined", "afd combined", "afd.1", "afd1"], "")
    };
  });

  const updatedData = {
    spreadsheetId: spreadsheetId || "unknown",
    spreadsheetUrl: spreadsheetUrl || "",
    sheetName: sheetName || "Sheet1",
    updatedAt: new Date().toISOString(),
    columns: columns || Object.keys(parsedRows[0] || {}),
    rows: parsedRows
  };

  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedData, null, 2));
    console.log(`Successfully synced ${parsedRows.length} rows from sheet: ${sheetName}`);
    return res.json({ success: true, count: parsedRows.length, message: 'Data synchronized successfully' });
  } catch (error: any) {
    console.error('Error saving synchronized data:', error);
    return res.status(500).json({ error: 'Failed to write cache file', details: error.message });
  }
});

app.post('/api/reset', (req, res) => {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(defaultMockData, null, 2));
    return res.json({ success: true, message: 'Reverted to default mock data successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to reset cache', details: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

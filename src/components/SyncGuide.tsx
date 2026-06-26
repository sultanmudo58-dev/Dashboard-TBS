import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, ExternalLink, FileSpreadsheet, Clock, ArrowRight, ShieldCheck, RefreshCw, Link2, AlertCircle, CheckCircle } from 'lucide-react';

interface SyncGuideProps {
  sheetName?: string;
  updatedAt?: string;
  spreadsheetUrl?: string;
  onResetMockData: () => Promise<void>;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function SyncGuide({
  sheetName,
  updatedAt,
  spreadsheetUrl,
  onResetMockData,
  isLoading,
  onRefresh,
}: SyncGuideProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'guide' | 'code'>('direct');
  
  // Pre-populate with the user's Google Sheet URL
  const [spreadsheetUrlInput, setSpreadsheetUrlInput] = useState(
    spreadsheetUrl && spreadsheetUrl !== 'mock-spreadsheet-id'
      ? spreadsheetUrl
      : 'https://docs.google.com/spreadsheets/d/1PEvi6M9xx5yGBjQWAw7YWNdnGZ_YPy1UQabNNrs7KUw/edit?gid=0#gid=0'
  );
  const [isSyncingDirect, setIsSyncingDirect] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [needsPublic, setNeedsPublic] = useState(false);

  const webhookUrl = `${window.location.origin}/api/webhook?token=agro_dashboard_token_2026`;

  const appsScriptCode = `/**
 * Apps Script untuk Sinkronisasi Otomatis Google Sheet ke Dashboard Agro
 * 
 * Petunjuk Penggunaan Lengkap ada di tab "Panduan Integrasi" di Dashboard.
 */

// GANTI DENGAN URL WEBHOOK DASHBOARD ANDA
const DASHBOARD_URL = "${webhookUrl}";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Dashboard Agro')
    .addItem('Sinkronisasi Sekarang', 'syncDataToDashboard')
    .addToUi();
}

function syncDataToDashboard() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length < 2) {
    SpreadsheetApp.getUi().alert("Lembar kerja kosong atau tidak memiliki data yang cukup!");
    return;
  }
  
  // Baris pertama diasumsikan sebagai Header kolom
  const headers = values[0];
  const rows = [];
  
  for (let i = 1; i < values.length; i++) {
    const rowData = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      const headerName = headers[j].toString().trim();
      if (headerName) {
        rowData[headerName] = values[i][j];
        if (values[i][j] !== "") {
          hasData = true;
        }
      }
    }
    if (hasData) {
      rows.push(rowData);
    }
  }
  
  const payload = {
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
    spreadsheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    sheetName: sheet.getName(),
    columns: headers.filter(h => h.toString().trim() !== ""),
    rows: rows
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(DASHBOARD_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      Logger.log("Sinkronisasi berhasil: " + responseText);
      SpreadsheetApp.getActiveSpreadsheet().toast("Data berhasil disinkronkan ke Dashboard!", "Sukses (Dashboard)", 5);
    } else {
      Logger.log("Gagal sinkronisasi. Kode: " + responseCode + ", Response: " + responseText);
      SpreadsheetApp.getActiveSpreadsheet().toast("Gagal sinkronisasi ke Dashboard. Periksa log!", "Gagal", 10);
    }
  } catch (e) {
    Logger.log("Error saat sinkronisasi: " + e.toString());
    SpreadsheetApp.getActiveSpreadsheet().toast("Error sinkronisasi: " + e.toString(), "Error", 10);
  }
}
`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spreadsheetUrlInput.trim()) return;

    setIsSyncingDirect(true);
    setSyncError(null);
    setSyncSuccess(null);
    setNeedsPublic(false);

    try {
      const res = await fetch('/api/sync-direct-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spreadsheetUrl: spreadsheetUrlInput }),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (res.status === 403 && resData.needsPublic) {
          setNeedsPublic(true);
        }
        throw new Error(resData.error || 'Terjadi kesalahan saat sinkronisasi');
      }

      setSyncSuccess(resData.message || 'Google Sheet berhasil disinkronkan langsung!');
      await onRefresh();
    } catch (err: any) {
      setSyncError(err.message || 'Terjadi kesalahan eksternal');
    } finally {
      setIsSyncingDirect(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pb-5 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Integrasi Google Sheets
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Petunjuk konfigurasi satu kali untuk sinkronisasi otomatis dan real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetMockData}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200/80 rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Reset ke Mock Data
          </button>
          
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200/80 rounded-xl transition-all border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka Google Sheet Anda
            </a>
          )}
        </div>
      </div>

      {/* Sync Status Info */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200 mb-6 text-sm">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metode Sinkronisasi</div>
            <div className="text-slate-800 font-bold text-xs mt-0.5">Google Apps Script (Webhook POST)</div>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lembar Kerja Aktif</div>
            <div className="text-slate-800 font-bold text-xs mt-0.5 truncate max-w-[200px]" title={sheetName || "Default Mock Data"}>
              {sheetName || "Default Mock Data"}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Clock className="w-4.5 h-4.5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terakhir Diperbarui</div>
            <div className="text-slate-800 font-bold text-xs mt-0.5">
              {updatedAt ? new Date(updatedAt).toLocaleString('id-ID', { hour12: false }) : 'Belum pernah'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('direct')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-widest transition-colors relative shrink-0 ${
            activeTab === 'direct' ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Koneksi Link Langsung (Instan)
          {activeTab === 'direct' && (
            <motion.div layoutId="syncActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-widest transition-colors relative shrink-0 ${
            activeTab === 'guide' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Panduan Integrasi (On Edit Trigger)
          {activeTab === 'guide' && (
            <motion.div layoutId="syncActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`pb-2.5 text-xs font-bold uppercase tracking-widest transition-colors relative shrink-0 ${
            activeTab === 'code' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Kode Google Apps Script
          {activeTab === 'code' && (
            <motion.div layoutId="syncActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[300px]">
        {activeTab === 'direct' ? (
          <div className="space-y-6">
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex gap-3">
              <span className="text-indigo-600 font-bold shrink-0 text-base mt-0.5">🚀</span>
              <div className="text-xs text-indigo-900 leading-relaxed">
                <strong>Sinkronisasi Sekali di Awal &amp; Update Otomatis:</strong> Cukup tempelkan URL Google Sheet Anda di bawah ini untuk menghubungkannya sekali saja. Setelah terhubung, aplikasi akan secara otomatis mendeteksi perubahan dan memperbarui grafik &amp; KPI di dashboard Anda secara real-time setiap 15 detik tanpa perlu menekan tombol sinkronisasi lagi!
              </div>
            </div>

            <form onSubmit={handleDirectSync} className="space-y-4">
              <div>
                <label htmlFor="spreadsheet-url" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  URL Google Sheet Anda
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      id="spreadsheet-url"
                      value={spreadsheetUrlInput}
                      onChange={(e) => setSpreadsheetUrlInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                      className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 focus:bg-white transition-all font-bold"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSyncingDirect || !spreadsheetUrlInput}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {isSyncingDirect ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Menghubungkan...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Hubungkan &amp; Sinkronkan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <AnimatePresence mode="wait">
              {syncError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Gagal Menyinkronkan Google Sheet</p>
                      <p className="text-rose-700/90 mt-0.5 font-medium">{syncError}</p>
                    </div>
                  </div>

                  {needsPublic && (
                    <div className="bg-white/85 p-3.5 rounded-lg border border-rose-200/50 mt-2 space-y-2 text-slate-700 font-medium shadow-3xs">
                      <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        Cara Mengaktifkan Akses Google Sheet (Sangat Mudah):
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-600 leading-relaxed text-[11px]">
                        <li>Buka Google Sheet Anda.</li>
                        <li>Klik tombol <strong>Bagikan (Share)</strong> berwarna biru di pojok kanan atas.</li>
                        <li>Di bawah bagian <em>Akses Umum (General Access)</em>, ubah dari <strong>Dibatasi (Restricted)</strong> menjadi <strong>Siapa saja yang memiliki link (Anyone with the link)</strong>.</li>
                        <li>Pastikan perannya diset sebagai <strong>Pengakses Lihat-Saja (Viewer)</strong> (demi keamanan dokumen Anda).</li>
                        <li>Kembali ke sini dan klik tombol <strong>Hubungkan &amp; Sinkronkan</strong> lagi!</li>
                      </ol>
                      <p className="text-[10px] text-slate-500 leading-relaxed pt-1.5 border-t border-slate-100">
                        * Catatan: Jika Anda tidak ingin mengubah pengaturan berbagi menjadi publik, Anda dapat beralih ke tab <strong>Panduan Integrasi (On Edit Trigger)</strong> di atas untuk sinkronisasi privat menggunakan Google Apps Script secara aman!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {syncSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 shadow-3xs"
                >
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <p className="font-bold text-emerald-900">Koneksi Berhasil!</p>
                    <p className="text-emerald-700/90 mt-0.5 font-medium">{syncSuccess}</p>
                    <p className="text-[10px] text-emerald-600/70 mt-1 font-semibold">Semua KPI dan grafik di Dashboard telah diperbarui secara langsung.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Format Kolom Google Sheet Yang Didukung
              </h3>
              <p className="text-slate-500 text-[11px] leading-relaxed mb-3">
                Sistem pencocokan kami sangat fleksibel (tidak peka terhadap spasi/huruf besar-kecil). Pastikan baris pertama lembar kerja Anda berisi kolom-kolom berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">NO BA</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">No Berita Acara</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">PO NO</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">No Purchase Order</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">SITECODE / SITE</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kode Kebun Lapangan</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">BLOK / BLOCK</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kode Blok Lahan</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">AFD / AFDELING</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kode Divisi / Afdeling</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">KETERANGAN</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kegiatan (e.g. PRUNING)</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">HA PLAN &amp; Σ HA REAL</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Rencana &amp; Realisasi (HA)</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">ACV HA / TRACKING / VIDEO</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Mutu Realisasi (0 - 100%)</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">periode / bulan</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Periode Kerja (e.g. april)</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'guide' ? (
          <div className="space-y-4.5 text-slate-600 text-sm">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-base mt-0.5">💡</span>
              <p className="text-amber-800 text-xs leading-relaxed">
                <strong>Penting tentang Sinkronisasi Otomatis Google Sheets:</strong> Fungsi <code>onEdit</code> bawaan Google Sheets dibatasi dari mengakses internet (UrlFetchApp). Agar perubahan lembar kerja otomatis memicu sinkronisasi real-time, Anda <strong>wajib</strong> membuat <strong>Installable Trigger</strong> seperti yang dijelaskan di Langkah 4 di bawah ini.
              </p>
            </div>

            {/* Column Guide Block */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Dukungan Nama Kolom Fleksibel (Case &amp; Space Insensitive)
              </h3>
              <p className="text-slate-500 text-[11px] leading-relaxed mb-3">
                Sistem kami mencocokkan nama kolom di Google Sheet Anda secara fleksibel. Kolom dapat ditulis dalam huruf besar, huruf kecil, menggunakan spasi, maupun underscore. Pastikan baris pertama lembar kerja Anda memiliki kolom-kolom berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">NO BA</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">No Berita Acara</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">PO NO</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">No Purchase Order</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">SITECODE / SITE</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kode Kebun Lapangan</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">BLOK / BLOCK</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kode Blok Lahan</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">AFD / AFDELING</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kode Divisi / Afdeling</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">JOB CODE &amp; ITEM KERJA</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kode &amp; Jenis Pekerjaan</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">KETERANGAN</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Kegiatan Utama (e.g. PRUNING)</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">HA PLAN &amp; Σ HA REAL</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Rencana &amp; Realisasi Luas (Hektar)</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">ACV HA / TRACKING / VIDEO</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Mutu Realisasi (0 - 100%)</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-3xs flex flex-col justify-between">
                  <span className="font-mono font-bold text-indigo-700">periode / PERIODE</span>
                  <span className="text-slate-400 text-[10px] mt-0.5">Bulan Pekerjaan (e.g. april)</span>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Copy Webhook URL Dashboard Anda</h4>
                  <p className="text-slate-500 text-xs mt-1">Salin alamat di bawah ini untuk dimasukkan ke kode Apps Script nanti:</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      id="webhook-url-input"
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-lg font-mono w-full select-all focus:outline-hidden"
                    />
                    <button
                      onClick={() => copyToClipboard(webhookUrl, setCopiedUrl)}
                      className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUrl ? 'Tersalin' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Buka Apps Script di Google Sheet Anda</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Buka dokumen Google Sheet Anda, lalu klik menu <strong className="text-slate-700">Ekstensi &gt; Apps Script</strong> (atau Extensions &gt; Apps Script dalam bahasa Inggris).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Ganti Kode Bawaan</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Buka tab <strong>Kode Google Apps Script</strong> di atas, salin seluruh kodenya, hapus semua kode default di editor Google Apps Script Anda, lalu paste kode tersebut di sana. Klik ikon <strong>Simpan (Floppy Disk)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Buat Pemicu Otomatis (Installable Trigger)</h4>
                  <p className="text-slate-500 text-xs mt-1">Ini agar data otomatis disinkronkan setiap kali Anda melakukan pengeditan sel:</p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-slate-500">
                    <li>Di panel navigasi kiri editor Apps Script Anda, klik ikon jam pasir (<strong className="text-slate-700">Pemicu</strong> atau <strong className="text-slate-700">Triggers</strong>).</li>
                    <li>Klik tombol <strong className="text-slate-700">+ Tambah Pemicu (+ Add Trigger)</strong> di pojok kanan bawah.</li>
                    <li>Atur pengaturannya:
                      <ul className="list-circle pl-5 mt-1 space-y-0.5">
                        <li>Pilih fungsi yang dijalankan: <code>syncDataToDashboard</code></li>
                        <li>Pilih penerapan untuk dijalankan: <code>Utama (Head)</code></li>
                        <li>Pilih sumber peristiwa: <code>Dari spreadsheet (From spreadsheet)</code></li>
                        <li>Pilih jenis peristiwa: <code>Saat diedit (On edit)</code></li>
                      </ul>
                    </li>
                    <li>Klik <strong>Simpan</strong>.</li>
                    <li>Google akan memunculkan dialog pop-up otentikasi. Pilih akun Google Anda, klik <strong>Advanced (Lanjutan)</strong>, lalu klik <strong>Go to ... (Unsafe) / Buka ... (tidak aman)</strong>, dan berikan izin akses (klik <strong>Allow</strong>).</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Uji Coba Sinkronisasi Pertama!</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Segarkan Google Sheet Anda. Anda akan melihat menu baru di bagian atas bernama <strong className="text-indigo-700">"Dashboard Agro"</strong>. Klik menu tersebut dan pilih <strong className="text-indigo-700">"Sinkronisasi Sekarang"</strong>. Akan muncul notifikasi toast kecil di pojok kanan bawah Google Sheet Anda, dan data di dashboard ini akan terupdate secara real-time!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute right-3 top-3 z-10">
              <button
                onClick={() => copyToClipboard(appsScriptCode, setCopiedCode)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Tersalin' : 'Copy'}
              </button>
            </div>
            
            <div className="bg-slate-900 rounded-xl overflow-hidden p-4 border border-slate-800 shadow-inner">
              <pre className="text-xs text-slate-300 font-mono overflow-x-auto max-h-[400px] leading-relaxed select-all">
                <code>{appsScriptCode}</code>
              </pre>
            </div>
            <p className="text-xs text-slate-400 mt-2 italic text-right">
              Salin kode di atas secara utuh dan tempelkan ke Google Apps Script Editor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

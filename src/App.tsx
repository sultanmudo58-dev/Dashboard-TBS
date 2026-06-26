import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  TrendingUp,
  Layers,
  RefreshCw,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Sparkles,
  Award,
  Video,
  MapPin,
  CheckCircle,
  AlertCircle,
  Shield,
  User,
  Lock,
  Search,
  Filter,
  Link2,
  X,
  Check,
  ExternalLink,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SheetData } from './types';
import MetricCard from './components/MetricCard';
import DataTable from './components/DataTable';
import SyncGuide from './components/SyncGuide';
import PoDiagram from './components/PoDiagram';

export default function App() {
  const [data, setData] = useState<SheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'integration'>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'user'>(() => {
    return (localStorage.getItem('agro_user_role') as 'admin' | 'user') || 'user';
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // States for direct sync modal
  const [isDirectSyncModalOpen, setIsDirectSyncModalOpen] = useState(false);
  const [directSpreadsheetUrl, setDirectSpreadsheetUrl] = useState('');
  const [isSyncingDirect, setIsSyncingDirect] = useState(false);
  const [directSyncError, setDirectSyncError] = useState<string | null>(null);
  const [directSyncSuccess, setDirectSyncSuccess] = useState<string | null>(null);
  const [directNeedsPublic, setDirectNeedsPublic] = useState(false);

  // States for search and filters lifted up from DataTable
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAfd, setSelectedAfd] = useState('All');
  const [selectedKeterangan, setSelectedKeterangan] = useState('All');
  const [selectedPo, setSelectedPo] = useState('All');
  const [selectedSitecode, setSelectedSitecode] = useState('All');

  const handleRoleChange = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      if (userRole === 'admin') return;
      setPasswordInput('');
      setPasswordError('');
      setShowPasswordModal(true);
    } else {
      setUserRole('user');
      localStorage.setItem('agro_user_role', 'user');
      showToast('Hak akses diubah ke: User (Lihat-Saja)', 'success');
      if (activeView === 'integration') {
        setActiveView('dashboard');
      }
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setUserRole('admin');
      localStorage.setItem('agro_user_role', 'admin');
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      showToast('Berhasil masuk sebagai Administrator!', 'success');
    } else {
      setPasswordError('Password salah! Silakan coba lagi.');
    }
  };

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`Gagal memuat data dashboard: ${response.statusText}`);
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memuat data');
      showToast('Gagal menyinkronkan data dengan server', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh data silently every 15 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(true);
    showToast('Data dashboard berhasil diperbarui!', 'success');
  };

  const executeDirectSync = async (url: string) => {
    if (!url || !url.trim()) return;

    setIsSyncingDirect(true);
    setDirectSyncError(null);
    setDirectSyncSuccess(null);
    setDirectNeedsPublic(false);

    try {
      const res = await fetch('/api/sync-direct-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spreadsheetUrl: url }),
      });

      const resData = await res.json();

      if (!res.ok) {
        if (res.status === 403 && resData.needsPublic) {
          setDirectNeedsPublic(true);
        }
        throw new Error(resData.error || 'Terjadi kesalahan saat sinkronisasi');
      }

      setDirectSyncSuccess(resData.message || 'Google Sheet berhasil dihubungkan & disinkronkan!');
      showToast('Google Sheet berhasil dihubungkan & disinkronkan!', 'success');
      await fetchDashboardData(true);
      // Automatically close modal after a short delay
      setTimeout(() => {
        setIsDirectSyncModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setDirectSyncError(err.message || 'Terjadi kesalahan eksternal');
    } finally {
      setIsSyncingDirect(false);
    }
  };

  const handleDirectSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeDirectSync(directSpreadsheetUrl);
  };

  // Auto trigger direct sync on modal open if the user role is 'user'
  useEffect(() => {
    if (isDirectSyncModalOpen && userRole === 'user' && directSpreadsheetUrl) {
      executeDirectSync(directSpreadsheetUrl);
    }
  }, [isDirectSyncModalOpen, userRole, directSpreadsheetUrl]);

  const handleResetMockData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Gagal mereset ke mock data');
      }
      const result = await response.json();
      if (result.success) {
        showToast('Berhasil mereset ke data default (mock)!', 'success');
        await fetchDashboardData(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal melakukan reset data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const rows = data?.rows || [];

  // Extract dynamic filter options for the global search bar
  const afdOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      if (row.AFD) set.add(row.AFD);
    });
    return ['All', ...Array.from(set).sort()];
  }, [rows]);

  const keteranganOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      if (row.KETERANGAN) set.add(row.KETERANGAN);
    });
    return ['All', ...Array.from(set).sort()];
  }, [rows]);

  const sitecodeOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      if (row.SITECODE) set.add(row.SITECODE);
    });
    return ['All', ...Array.from(set).sort()];
  }, [rows]);

  const allPos = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      if (row['PO NO']) set.add(row['PO NO']);
    });
    return Array.from(set).sort();
  }, [rows]);

  // Filter rows dynamically based on the current search and select inputs from DataTable
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // PO Filter
      if (selectedPo !== 'All' && row['PO NO'] !== selectedPo) {
        return false;
      }
      // Sitecode Filter
      if (selectedSitecode !== 'All' && row.SITECODE !== selectedSitecode) {
        return false;
      }
      // AFD Filter
      if (selectedAfd !== 'All' && row.AFD !== selectedAfd) {
        return false;
      }
      // Keterangan Filter
      if (selectedKeterangan !== 'All' && row.KETERANGAN !== selectedKeterangan) {
        return false;
      }
      // General Search Term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const poMatch = (row['PO NO'] || '').toLowerCase().includes(query);
        const sitecodeMatch = (row['SITECODE'] || '').toLowerCase().includes(query);
        const blokMatch = (row['BLOK'] || '').toLowerCase().includes(query);
        const itemMatch = (row['ITEM KERJA'] || '').toLowerCase().includes(query);
        const ketMatch = (row['KETERANGAN'] || '').toLowerCase().includes(query);
        const baMatch = (row['NO BA'] || '').toLowerCase().includes(query);
        
        if (!poMatch && !sitecodeMatch && !blokMatch && !itemMatch && !ketMatch && !baMatch) {
          return false;
        }
      }
      return true;
    });
  }, [rows, selectedPo, selectedSitecode, selectedAfd, selectedKeterangan, searchTerm]);

  // Calculate dynamic KPIs from filteredRows
  const totalHaPlan = filteredRows.reduce((sum, row) => sum + (row['HA PLAN'] || 0), 0);
  const totalHaReal = filteredRows.reduce((sum, row) => sum + (row['Σ HA REAL'] || 0), 0);
  const totalBlocks = new Set(filteredRows.map(row => row.BLOK).filter(Boolean)).size;

  // Average ACV values
  const avgAcvHa = filteredRows.length ? filteredRows.reduce((sum, row) => sum + (row['ACV HA'] || 0), 0) / filteredRows.length : 0;
  const avgAcvTracking = filteredRows.length ? filteredRows.reduce((sum, row) => sum + (row['ACV TRACKING'] || 0), 0) / filteredRows.length : 0;
  const avgAcvVideo = filteredRows.length ? filteredRows.reduce((sum, row) => sum + (row['ACV VIDEO CONTROL'] || 0), 0) / filteredRows.length : 0;

  // Overall performance index (aggregate of metrics)
  const avgOverallAcv = (avgAcvHa + avgAcvTracking + avgAcvVideo) / 3;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased font-sans flex flex-col md:flex-row selection:bg-indigo-100">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full shadow-lg border border-slate-250 text-xs font-bold bg-white"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
            }}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="text-slate-800 uppercase tracking-wider font-bold">
              {toastMessage.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-350"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* PERSISTENT & COLLAPSIBLE SIDEBAR - SLEEK THEME */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex w-64 bg-slate-900 flex-col shrink-0 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 md:flex md:w-64' : '-translate-x-full md:hidden md:w-0'
        }`}
      >
        <div className="p-6 flex flex-col h-full sticky top-0 h-screen overflow-y-auto">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Sprout className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-black text-white tracking-widest uppercase block">TBS</span>
                <span className="text-[9px] font-bold text-slate-500 tracking-widest">Tracking Borong SIAM</span>
              </div>
            </div>
            
            {/* Close button inside sidebar on mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
              title="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <nav className="space-y-1.5 flex-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all text-xs font-bold uppercase tracking-wider ${
                activeView === 'dashboard'
                  ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/25 font-black'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>
            
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveView('integration')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all text-xs font-bold uppercase tracking-wider ${
                  activeView === 'integration'
                    ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/25 font-black'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Menu Admin (Sheet)</span>
              </button>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
            {/* ROLE SWITCHER */}
            <div className="p-4 bg-slate-850/60 rounded-xl border border-slate-800/80">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Hak Akses
              </p>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-md text-center transition-all ${
                    userRole === 'admin'
                      ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleRoleChange('user')}
                  className={`py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-md text-center transition-all ${
                    userRole === 'user'
                      ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  User
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Active Sheet</p>
              <p className="text-xs text-white font-bold truncate" title={data?.sheetName || "Default Mock Data"}>
                {data?.sheetName || "Default Mock Data"}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data?.spreadsheetId !== "mock-spreadsheet-id" ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'} animate-pulse`} />
                <span className={`text-[10px] uppercase tracking-widest font-bold ${data?.spreadsheetId !== "mock-spreadsheet-id" ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {data?.spreadsheetId !== "mock-spreadsheet-id" ? 'Synced' : 'Mock Data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Responsive Mobile Header / Top Nav */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Toggle Sidebar Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/60 flex items-center justify-center shadow-3xs"
                title={isSidebarOpen ? "Sembunyikan Menu" : "Tampilkan Menu"}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="md:hidden p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
                <Sprout className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  PT.GSIP-AMR
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-bold uppercase tracking-wider shrink-0">
                    Auto-Synchronized
                  </span>
                </h1>
                <p className="text-slate-500 text-xs mt-1 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  Monitoring Dashboard Tracking Borong
                </p>
              </div>
            </div>

            {/* Navigation and Refresh controls */}
            <div className="flex items-center gap-3 justify-end shrink-0">
              {/* Role Select in Header */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 hidden lg:inline">Akses:</span>
                <select
                  value={userRole}
                  onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'user')}
                  className="bg-transparent border-none text-[10px] font-extrabold uppercase tracking-wider text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="admin">🔑 Admin</option>
                  <option value="user">👤 User</option>
                </select>
              </div>

              {/* Mobile tabs container */}
              {userRole === 'admin' && (
                <div className="md:hidden bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeView === 'dashboard'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveView('integration')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeView === 'integration'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  const currentUrl = data?.spreadsheetUrl && data.spreadsheetUrl !== 'mock-spreadsheet-id'
                    ? data.spreadsheetUrl
                    : 'https://docs.google.com/spreadsheets/d/1PEvi6M9xx5yGBjQWAw7YWNdnGZ_YPy1UQabNNrs7KUw/edit?gid=0#gid=0';
                  setDirectSpreadsheetUrl(currentUrl);
                  setDirectSyncError(null);
                  setDirectSyncSuccess(null);
                  setDirectNeedsPublic(false);
                  setIsDirectSyncModalOpen(true);
                }}
                disabled={isLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 animate-bounce-short"
                title="Hubungkan & Syncron Data"
              >
                <Link2 className="w-4 h-4 text-white animate-pulse" />
                <span className="hidden sm:inline text-xs font-black uppercase tracking-wider text-white">Hubungkan & Syncron Data</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          
          {isLoading && !isRefreshing ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Memuat data realisasi lapangan...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 flex flex-col items-center justify-center max-w-xl mx-auto my-12 shadow-2xs">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Terjadi Kendala Koneksi</h3>
              <p className="text-xs text-rose-700 mt-2 leading-relaxed font-medium">{error}</p>
              <button
                onClick={() => fetchDashboardData()}
                className="mt-5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs uppercase tracking-wider"
              >
                Coba Hubungkan Kembali
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeView === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  
                  {/* Sync Header Info */}
                  {userRole === 'admin' && data?.spreadsheetId !== "mock-spreadsheet-id" && (
                    <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-100 rounded-lg shrink-0">
                          <CheckCircle className="w-4 h-4 text-indigo-700" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">
                            Google Sheet Terhubung &amp; Sinkronis!
                          </span>
                          <p className="text-slate-500 text-[10px] mt-0.5 font-semibold">
                            Sinkronisasi terakhir terdeteksi pada:{' '}
                            <span className="font-bold text-slate-700">
                              {new Date(data?.updatedAt || '').toLocaleString('id-ID')}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveView('integration')}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1.5 shrink-0 uppercase tracking-wider hover:underline"
                      >
                        Detail Koneksi <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}


                  {/* Pencarian dan Filter Utama */}
                  <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                          <Search className="w-4 h-4 text-indigo-600" />
                          PENCARIAN DATA TRACKING
                        </h2>
                        <p className="text-slate-500 text-[10px] mt-0.5 font-bold uppercase tracking-wider">
                          Filter data berdasarkan PO, Blok, AFD, atau Jenis Pekerjaan
                        </p>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full md:max-w-xs">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Search className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="Cari PO, Blok, Keterangan..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-750 pl-9.5 pr-3.5 py-2.5 border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-full transition-all placeholder:text-slate-450 font-medium"
                        />
                      </div>
                    </div>

                    {/* Filter Dropdowns Row */}
                    <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-150">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Filter className="w-3.5 h-3.5 text-indigo-650" />
                        FILTER Berdasarkan:
                      </div>

                      {/* Sitecode Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Sitecode:</span>
                        <select
                          value={selectedSitecode}
                          onChange={(e) => setSelectedSitecode(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-3 py-1.5 focus:outline-hidden cursor-pointer shadow-3xs hover:border-slate-300 transition-colors"
                        >
                          {sitecodeOptions.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt === 'All' ? 'Semua Site' : opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* AFD Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">AFD:</span>
                        <select
                          value={selectedAfd}
                          onChange={(e) => setSelectedAfd(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-3 py-1.5 focus:outline-hidden cursor-pointer shadow-3xs hover:border-slate-300 transition-colors"
                        >
                          {afdOptions.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt === 'All' ? 'Semua AFD' : `AFD ${opt}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Pekerjaan Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Pekerjaan:</span>
                        <select
                          value={selectedKeterangan}
                          onChange={(e) => setSelectedKeterangan(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 px-3 py-1.5 focus:outline-hidden cursor-pointer max-w-[200px] shadow-3xs hover:border-slate-300 transition-colors"
                        >
                          {keteranganOptions.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt === 'All' ? 'Semua Pekerjaan' : opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Diagram Segment */}
                  <section className="mb-6">
                    <PoDiagram
                      filteredRows={filteredRows}
                      selectedPo={selectedPo}
                      setSelectedPo={setSelectedPo}
                      allPos={allPos}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                    />
                  </section>

                  {/* Data Grid Table Segment */}
                  <section>
                    <DataTable
                      data={rows}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      selectedAfd={selectedAfd}
                      setSelectedAfd={setSelectedAfd}
                      selectedKeterangan={selectedKeterangan}
                      setSelectedKeterangan={setSelectedKeterangan}
                      selectedPo={selectedPo}
                      selectedSitecode={selectedSitecode}
                    />
                  </section>

                </motion.div>
              ) : (
                <motion.div
                  key="integration"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <SyncGuide
                    sheetName={data?.sheetName}
                    updatedAt={data?.updatedAt}
                    spreadsheetUrl={data?.spreadsheetUrl}
                    onResetMockData={handleResetMockData}
                    isLoading={isLoading}
                    onRefresh={() => fetchDashboardData(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>

        {/* Footer Branding / Information */}
        <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-bold uppercase tracking-wider text-[10px]">
            <p>Dashboard Monitoring Tracking Borong &copy; 2026. Created By Hputra</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5"><FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" /> Sourced from Google Sheet</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-indigo-650" /> Real-time Trigger Sync</span>
            </div>
          </div>
        </footer>

      </div>

      {/* PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                
                <h3 className="text-center font-extrabold text-slate-800 text-base uppercase tracking-wider">
                  Verifikasi Admin
                </h3>
                <p className="text-center text-xs text-slate-500 mt-1 mb-5">
                  Masukkan password untuk mengakses fitur konfigurasi dan sinkronisasi Google Sheet.
                </p>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan password admin..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                      autoFocus
                    />
                    {passwordError && (
                      <p className="text-rose-600 text-[11px] font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {passwordError}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all uppercase tracking-wider"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm uppercase tracking-wider"
                    >
                      Masuk
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {isDirectSyncModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSyncingDirect) setIsDirectSyncModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDirectSyncModalOpen(false)}
                disabled={isSyncingDirect}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors z-10 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-8">
                {/* Header Icon & Title */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                    <Link2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-wider">
                      Hubungkan &amp; Sinkronisasi Google Sheet
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hubungkan spreadsheet Anda langsung ke dashboard sistem pelacakan data borong.
                    </p>
                  </div>
                </div>

                {/* Info Alert Box */}
                <div className="bg-indigo-50/60 border border-indigo-100/80 p-4 rounded-2xl flex gap-3.5 mb-6">
                  <span className="text-indigo-600 font-bold text-lg shrink-0 mt-0.5">🚀</span>
                  <div className="text-xs text-indigo-950 leading-relaxed font-medium">
                    {userRole === 'user' ? (
                      <>
                        <strong>Sinkronisasi Instan:</strong> Dashboard sedang menyinkronkan data langsung dengan Google Sheet untuk menyajikan informasi real-time terbaru!
                      </>
                    ) : (
                      <>
                        <strong>Sinkronisasi Instan &amp; Update Otomatis:</strong> Masukkan URL Google Sheet Anda di bawah. Dashboard akan secara otomatis mendeteksi perubahan data dan memperbarui grafik &amp; KPI di dashboard Anda secara real-time setiap 15 detik!
                      </>
                    )}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleDirectSyncSubmit} className="space-y-5">
                  {userRole === 'user' ? (
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-3xs">
                      {isSyncingDirect ? (
                        <div className="relative flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                          <Link2 className="w-5 h-5 text-indigo-600 absolute animate-pulse" />
                        </div>
                      ) : directSyncSuccess ? (
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          {isSyncingDirect ? 'Sedang Menyinkronkan Data...' : directSyncSuccess ? 'Sinkronisasi Berhasil!' : 'Sinkronisasi Terkendala'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider leading-relaxed">
                          {isSyncingDirect 
                            ? 'Menghubungkan langsung ke Google Sheet terdaftar dan mengunduh data...' 
                            : directSyncSuccess 
                              ? 'Data dashboard Anda kini telah diperbarui ke versi terbaru!' 
                              : 'Gagal mengambil data terbaru. Periksa koneksi internet Anda.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="direct-spreadsheet-url" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                        URL Google Sheet Anda
                      </label>
                      <div className="relative">
                        <FileSpreadsheet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-indigo-600" />
                        <input
                          type="url"
                          id="direct-spreadsheet-url"
                          required
                          value={directSpreadsheetUrl}
                          onChange={(e) => setDirectSpreadsheetUrl(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                          className="pl-11 pr-4 py-3 w-full bg-slate-50 border-2 border-slate-200/80 text-slate-800 rounded-2xl text-xs font-mono focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-bold shadow-2xs"
                          disabled={isSyncingDirect}
                        />
                      </div>
                    </div>
                  )}

                  {/* Feedback Status */}
                  <AnimatePresence mode="wait">
                    {directSyncError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs font-bold flex gap-2.5 items-start"
                      >
                        <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p>{directSyncError}</p>
                          {directNeedsPublic && (
                            <p className="mt-1 text-[11px] text-rose-700 font-medium normal-case leading-relaxed">
                              Mohon pastikan izin akses Google Sheet diatur sebagai: <strong>&quot;Siapa saja yang memiliki link&quot;</strong> sebagai <strong>Pengakses Lihat-Saja (Viewer)</strong> agar sistem dashboard dapat membaca data.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {directSyncSuccess && userRole !== 'user' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-bold flex gap-2.5 items-center"
                      >
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                        <span>{directSyncSuccess}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    {userRole === 'user' ? (
                      <button
                        type="button"
                        onClick={() => setIsDirectSyncModalOpen(false)}
                        disabled={isSyncingDirect}
                        className="flex-1 py-3 text-xs font-extrabold text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-all uppercase tracking-wider disabled:opacity-50"
                      >
                        {isSyncingDirect ? 'Mohon Tunggu...' : 'Tutup'}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsDirectSyncModalOpen(false)}
                          disabled={isSyncingDirect}
                          className="flex-1 py-3 text-xs font-extrabold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-2 border-slate-200 rounded-2xl transition-all uppercase tracking-wider disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSyncingDirect || !directSpreadsheetUrl.trim()}
                          className="flex-1 py-3 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-2xl transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                          {isSyncingDirect ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Menghubungkan...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Mulai Sinkronisasi
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

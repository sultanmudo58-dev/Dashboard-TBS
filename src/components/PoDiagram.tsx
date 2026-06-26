import React, { useMemo, useState, useRef, useEffect } from 'react';
import { RowData } from '../types';
import { ChevronDown, Search, X } from 'lucide-react';

interface PoDiagramProps {
  filteredRows: RowData[];
  selectedPo: string;
  setSelectedPo: (po: string) => void;
  allPos: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function PoDiagram({
  filteredRows,
  selectedPo,
  setSelectedPo,
  allPos,
  searchTerm,
  setSearchTerm,
}: PoDiagramProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside detector
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter list based on search query
  const filteredPos = useMemo(() => {
    if (!searchTerm) return allPos;
    return allPos.filter((po) =>
      po.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPos, searchTerm]);

  // 1. Get the most active PO from the filtered list (most frequent)
  const activePo = useMemo(() => {
    if (selectedPo && selectedPo !== 'All') {
      return selectedPo;
    }

    if (filteredRows.length === 0) return 'TIDAK ADA PO';
    const counts: Record<string, number> = {};
    let maxPo = '';
    let maxCount = 0;
    
    filteredRows.forEach((row) => {
      const po = row['PO NO'] || '';
      if (!po) return;
      counts[po] = (counts[po] || 0) + 1;
      if (counts[po] > maxCount) {
        maxCount = counts[po];
        maxPo = po;
      }
    });

    return maxPo || filteredRows[0]['PO NO'] || 'TIDAK ADA PO';
  }, [filteredRows, selectedPo]);

  // 2. Filter rows that belong to this active PO
  const poRows = useMemo(() => {
    if (activePo === 'TIDAK ADA PO') return [];
    return filteredRows.filter((row) => row['PO NO'] === activePo);
  }, [filteredRows, activePo]);

  // 3. Calculations
  const activeBlocksCount = useMemo(() => {
    const uniqueBlocks = new Set(poRows.map((row) => row.BLOK).filter(Boolean));
    return uniqueBlocks.size;
  }, [poRows]);

  const totalHaPlan = useMemo(() => {
    return poRows.reduce((sum, r) => sum + (r['HA PLAN'] || 0), 0);
  }, [poRows]);

  const totalHaReal = useMemo(() => {
    return poRows.reduce((sum, r) => sum + (r['Σ HA REAL'] || 0), 0);
  }, [poRows]);

  // Average overall ACV (HA ACV)
  const avgAcvHa = useMemo(() => {
    if (poRows.length === 0) return 0;
    const total = poRows.reduce((sum, r) => sum + (r['ACV HA'] || 0), 0);
    return total / poRows.length;
  }, [poRows]);

  // Average Tracking ACV
  const avgAcvTracking = useMemo(() => {
    if (poRows.length === 0) return 0;
    const total = poRows.reduce((sum, r) => sum + (r['ACV TRACKING'] || 0), 0);
    return total / poRows.length;
  }, [poRows]);

  // Average Video Control ACV (Viona)
  const avgAcvVideo = useMemo(() => {
    if (poRows.length === 0) return 0;
    const total = poRows.reduce((sum, r) => sum + (r['ACV VIDEO CONTROL'] || 0), 0);
    return total / poRows.length;
  }, [poRows]);

  // SVG Progress circle specifications (slightly smaller to fit three side-by-side beautifully)
  const radius = 36;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  const getStrokeOffset = (value: number) => {
    const percentage = Math.min(100, Math.max(0, value));
    return circumference - (percentage / 100) * circumference;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* PO Search input with Autocomplete Suggestions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:max-w-xl">
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-indigo-600 text-white p-2 rounded-xl">
              <Search className="w-4 h-4" />
            </span>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              PENCARIAN PO:
            </span>
          </div>
          <div ref={containerRef} className="relative w-full sm:w-96 z-30">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </span>
            <input
              type="text"
              placeholder="cari PO"
              value={searchTerm}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              className="bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-750 pl-9.5 pr-10 py-2.5 border-2 border-indigo-600 rounded-2xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-full transition-all placeholder:text-slate-450 font-black uppercase tracking-wider shadow-2xs"
            />
            {/* Toggle Arrow or Clear Button */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPo('All');
                    setSearchTerm('');
                    setIsDropdownOpen(false);
                  }}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ChevronDown className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Dropdown list popup */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 py-1.5 font-sans divide-y divide-slate-50 animate-in fade-in slide-in-from-top-1 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPo('All');
                    setSearchTerm('');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-between transition-colors ${
                    selectedPo === 'All' ? 'text-indigo-700 bg-indigo-50/75 font-black' : 'text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  <span>🔍 SEMUA NOMOR PO ({allPos.length})</span>
                  {selectedPo === 'All' && <span className="text-[10px] text-indigo-600 font-extrabold">AKTIF</span>}
                </button>

                {filteredPos.length === 0 ? (
                  <div className="px-4 py-3.5 text-xs text-slate-400 font-extrabold uppercase tracking-wider text-center">
                    Tidak ada PO yang cocok
                  </div>
                ) : (
                  filteredPos.map((po, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPo(po);
                        setSearchTerm(po);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-colors ${
                        selectedPo === po ? 'text-indigo-700 bg-indigo-50/75 font-black' : 'text-slate-700 hover:bg-slate-50/70'
                      }`}
                    >
                      <span className="truncate">📦 PO: {po}</span>
                      {selectedPo === po && <span className="text-[10px] text-indigo-600 font-extrabold">AKTIF</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Block status badge */}
        <div className="inline-flex items-center self-start sm:self-auto bg-indigo-50/60 border border-indigo-100 rounded-full px-4 py-2">
          <span className="text-[10px] font-black text-indigo-750 uppercase tracking-widest">
            JUMLAH BLOK PO : {activeBlocksCount}
          </span>
        </div>
      </div>

      {/* Unique list of Work Items under Active PO positioned below search */}
      {poRows.length > 0 && activePo !== 'TIDAK ADA PO' && (
        <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              DETAIL ITEM PEKERJAAN PO: <span className="font-mono text-indigo-700 text-xs font-black">{activePo}</span>
            </span>
          </div>

          {(() => {
            const seen = new Set<string>();
            const list: { itemKerja: string; keterangan: string; jobCode?: string }[] = [];
            
            poRows.forEach((row) => {
              const key = `${row['ITEM KERJA'] || ''}||${row['KETERANGAN'] || ''}`;
              if (!seen.has(key)) {
                seen.add(key);
                list.push({
                  itemKerja: row['ITEM KERJA'] || '',
                  keterangan: row['KETERANGAN'] || '',
                  jobCode: row['JOB CODE'],
                });
              }
            });

            if (list.length === 0) {
              return (
                <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider py-2">
                  Tidak ada deskripsi pekerjaan terdaftar.
                </p>
              );
            }

            return (
              <div className="divide-y divide-slate-100">
                {list.map((item, idx) => (
                  <div key={idx} className={`py-3.5 flex flex-col gap-1.5 ${idx === 0 ? 'pt-0' : ''} ${idx === list.length - 1 ? 'pb-0' : ''}`}>
                    <div className="font-extrabold text-slate-900 text-sm md:text-base leading-relaxed">
                      {item.keterangan || '-'}
                    </div>
                    {item.itemKerja && (
                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        {item.jobCode && (
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] font-black text-indigo-600 shadow-3xs">
                            {item.jobCode}
                          </span>
                        )}
                        <span className="font-bold uppercase tracking-wide text-[11px] text-slate-450">{item.itemKerja}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Grid containing Stats and Three Radial Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-2">
        
        {/* Left Side: Realisasi Hektar & PLAN HEKTAR */}
        <div className="lg:col-span-4 space-y-6 text-center lg:text-left bg-slate-50/40 p-5 rounded-2xl border border-slate-100">
          {/* Realisasi */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Realisasi Hektar:
            </p>
            <p className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mt-1">
              {totalHaReal.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-slate-400 font-bold text-base md:text-lg">HA</span>
            </p>
          </div>

          {/* Target */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              PLAN HEKTAR:
            </p>
            <p className="text-xl md:text-2xl font-bold text-slate-700 tracking-tight mt-0.5">
              {totalHaPlan.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-slate-450 font-semibold text-xs md:text-sm">HA</span>
            </p>
          </div>
        </div>

        {/* Right Side: Three Radial Progress indicators */}
        <div className="lg:col-span-8">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 text-center lg:text-left">
            DIAGRAM PERSENTASE PENCAPAIAN ACV
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* 1. TRACKING ACV DIAL */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs flex flex-col items-center text-center space-y-3 hover:border-indigo-150 transition-colors">
              <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-indigo-50 fill-transparent"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-indigo-600 fill-transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={getStrokeOffset(avgAcvTracking)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-slate-850 tracking-tight leading-none">
                    {avgAcvTracking.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-indigo-50/70 border border-indigo-100/50 rounded-lg py-1 px-3 w-full">
                <span className="text-[10px] font-black text-indigo-750 uppercase tracking-wider block">
                  TRACKING ACV
                </span>
              </div>
            </div>

            {/* 2. HEKTAR / HA ACV DIAL */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs flex flex-col items-center text-center space-y-3 hover:border-purple-150 transition-colors">
              <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-purple-50 fill-transparent"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-purple-600 fill-transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={getStrokeOffset(avgAcvHa)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-slate-850 tracking-tight leading-none">
                    {avgAcvHa.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-purple-50/70 border border-purple-100/50 rounded-lg py-1 px-3 w-full">
                <span className="text-[10px] font-black text-purple-750 uppercase tracking-wider block">
                  HEKTAR ACV
                </span>
              </div>
            </div>

            {/* 3. VIONA ACV DIAL */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs flex flex-col items-center text-center space-y-3 hover:border-rose-150 transition-colors">
              <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-rose-50 fill-transparent"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-rose-600 fill-transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={getStrokeOffset(avgAcvVideo)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-slate-850 tracking-tight leading-none">
                    {avgAcvVideo.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-rose-50/70 border border-rose-100/50 rounded-lg py-1 px-3 w-full">
                <span className="text-[10px] font-black text-rose-750 uppercase tracking-wider block">
                  VIONA ACV
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}


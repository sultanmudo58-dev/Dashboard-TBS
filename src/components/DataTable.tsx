import React, { useState, useMemo, useEffect } from 'react';
import { RowData } from '../types';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

interface DataTableProps {
  data: RowData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedAfd: string;
  setSelectedAfd: (afd: string) => void;
  selectedKeterangan: string;
  setSelectedKeterangan: (ket: string) => void;
  selectedPo: string;
  selectedSitecode: string;
}

type SortField = 'PO NO' | 'SITECODE' | 'BLOK' | 'AFD' | 'HA PLAN' | 'Σ HA REAL' | 'ACV HA' | 'ACV TRACKING' | 'ACV VIDEO CONTROL';
type SortOrder = 'asc' | 'desc';

export default function DataTable({
  data,
  searchTerm,
  setSearchTerm,
  selectedAfd,
  setSelectedAfd,
  selectedKeterangan,
  setSelectedKeterangan,
  selectedPo,
  selectedSitecode,
}: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('PO NO');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAfd, selectedKeterangan, selectedPo, selectedSitecode]);

  // 1. Extract dynamic filter options
  const afdOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      if (row.AFD) set.add(row.AFD);
    });
    return ['All', ...Array.from(set).sort()];
  }, [data]);

  const keteranganOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((row) => {
      if (row.KETERANGAN) set.add(row.KETERANGAN);
    });
    return ['All', ...Array.from(set).sort()];
  }, [data]);

  // 2. Filter data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
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
  }, [data, selectedAfd, selectedKeterangan, searchTerm, selectedPo, selectedSitecode]);

  // 3. Sort data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle undefined/null
      if (valA === undefined || valA === null) valA = typeof valB === 'number' ? 0 : '';
      if (valB === undefined || valB === null) valB = typeof valA === 'number' ? 0 : '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      } else {
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }
    });
    return sorted;
  }, [filteredData, sortField, sortOrder]);

  // 4. Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));

  // 5. Calculate totals for filtered rows (sortedData)
  const totalHaPlan = useMemo(() => {
    return sortedData.reduce((sum, row) => sum + (row['HA PLAN'] || 0), 0);
  }, [sortedData]);

  const totalHaReal = useMemo(() => {
    return sortedData.reduce((sum, row) => sum + (row['Σ HA REAL'] || 0), 0);
  }, [sortedData]);

  const avgAcvHa = useMemo(() => {
    if (!sortedData.length) return 0;
    const total = sortedData.reduce((sum, row) => sum + (row['ACV HA'] || 0), 0);
    return Math.round(total / sortedData.length);
  }, [sortedData]);

  const avgAcvTracking = useMemo(() => {
    if (!sortedData.length) return 0;
    const total = sortedData.reduce((sum, row) => sum + (row['ACV TRACKING'] || 0), 0);
    return Math.round(total / sortedData.length);
  }, [sortedData]);

  const avgAcvVideoControl = useMemo(() => {
    if (!sortedData.length) return 0;
    const total = sortedData.reduce((sum, row) => sum + (row['ACV VIDEO CONTROL'] || 0), 0);
    return Math.round(total / sortedData.length);
  }, [sortedData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getAcvBadge = (value: number) => {
    if (value === 100) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 shadow-3xs font-mono">
          100%
        </span>
      );
    } else if (value > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 border border-amber-150 shadow-3xs font-mono">
          {value}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-150 shadow-3xs font-mono">
          0%
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600" />
              TABEL DATA TRACKING BORONG
            </h3>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Menampilkan {filteredData.length} dari {data.length} total data
            </p>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none uppercase tracking-wider">
              <th className="p-3.5 font-bold">No BA</th>
              <th className="p-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('PO NO')}>
                <div className="flex items-center gap-1">
                  PO Number
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('SITECODE')}>
                <div className="flex items-center gap-1">
                  Site Code
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('BLOK')}>
                <div className="flex items-center gap-1">
                  Blok
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('AFD')}>
                <div className="flex items-center gap-1">
                  AFD
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold">Item Kerja / Keterangan</th>
              <th className="p-3.5 font-bold text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('HA PLAN')}>
                <div className="flex items-center justify-end gap-1">
                  HA Plan
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('Σ HA REAL')}>
                <div className="flex items-center justify-end gap-1">
                  HA Real
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('ACV HA')}>
                <div className="flex items-center justify-center gap-1">
                  ACV HA
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('ACV TRACKING')}>
                <div className="flex items-center justify-center gap-1">
                  ACV TRACKING
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('ACV VIDEO CONTROL')}>
                <div className="flex items-center justify-center gap-1">
                  ACV Video
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3.5 font-bold text-center">Periode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-8 text-center text-slate-400 italic font-medium">
                  Tidak ada baris data yang cocok dengan kriteria pencarian atau filter.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors border-b border-slate-5 border-slate-100">
                  <td className="p-3.5 max-w-[140px] truncate font-mono text-[10px]" title={row['NO BA']}>
                    {row['NO BA'] || <span className="text-slate-300">-</span>}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700 font-mono">{row['PO NO']}</td>
                  <td className="p-3.5 font-mono text-slate-750 font-semibold">
                    {row['SITECODE'] || <span className="text-slate-300">-</span>}
                  </td>
                  <td className="p-3.5 font-mono font-medium">{row['BLOK']}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md font-semibold font-mono">
                      {row['AFD']}
                    </span>
                  </td>
                  <td className="p-3.5 max-w-[200px] truncate">
                    <div className="font-semibold text-slate-700 truncate">{row['KETERANGAN']}</div>
                    {row['ITEM KERJA'] && (
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {row['JOB CODE'] && <span className="font-mono bg-slate-50 px-1 py-0.2 rounded border border-slate-100 mr-1">{row['JOB CODE']}</span>}
                        {row['ITEM KERJA']}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 text-right font-semibold text-slate-500 font-mono">
                    {row['HA PLAN'] > 0 ? row['HA PLAN'].toFixed(2) : '-'}
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-800 font-mono">
                    {row['Σ HA REAL'] > 0 ? row['Σ HA REAL'].toFixed(2) : '-'}
                  </td>
                  <td className="p-3.5 text-center">{getAcvBadge(row['ACV HA'])}</td>
                  <td className="p-3.5 text-center">{getAcvBadge(row['ACV TRACKING'])}</td>
                  <td className="p-3.5 text-center">{getAcvBadge(row['ACV VIDEO CONTROL'])}</td>
                  <td className="p-3.5 text-center">
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                      {row['periode']}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {sortedData.length > 0 && (
            <tfoot className="bg-slate-100/90 border-t-2 border-slate-200 text-slate-800 font-bold font-mono text-xs">
              <tr>
                <td colSpan={6} className="p-3.5 text-left font-black text-slate-700 font-sans tracking-wide">
                  TOTAL (DARI {sortedData.length} BARIS YANG DI-FILTER)
                </td>
                <td className="p-3.5 text-right text-slate-600 font-extrabold">
                  {totalHaPlan > 0 ? totalHaPlan.toFixed(2) : '-'}
                </td>
                <td className="p-3.5 text-right text-slate-900 font-black">
                  {totalHaReal > 0 ? totalHaReal.toFixed(2) : '-'}
                </td>
                <td className="p-3.5 text-center">
                  {getAcvBadge(avgAcvHa)}
                </td>
                <td className="p-3.5 text-center">
                  {getAcvBadge(avgAcvTracking)}
                </td>
                <td className="p-3.5 text-center">
                  {getAcvBadge(avgAcvVideoControl)}
                </td>
                <td className="p-3.5 text-center font-sans text-[10px] text-slate-400">
                  -
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination Bar */}
      {sortedData.length > 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Baris per halaman:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg text-slate-700 px-1.5 py-1 focus:outline-hidden cursor-pointer font-bold"
            >
              {[5, 10, 25, 50, 100].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span>
              Menampilkan <strong>{Math.min(sortedData.length, (currentPage - 1) * rowsPerPage + 1)}</strong> -{' '}
              <strong>{Math.min(sortedData.length, currentPage * rowsPerPage)}</strong> dari{' '}
              <strong>{sortedData.length}</strong> baris
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-700 font-bold px-1 text-xs">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white cursor-pointer transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

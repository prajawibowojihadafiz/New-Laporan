import React, { useState, useMemo } from 'react';
import { Calendar, Trash2, X, AlertTriangle, RefreshCw, Layers, Wallet, CheckCircle2 } from 'lucide-react';
import { DayReportData, calculateTotalPrints, calculateTotalIncome, formatRupiah, formatDateIndonesian } from '../utils/reportLogic';

interface ResetRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportsMap: Record<string, DayReportData>;
  onConfirmResetRange: (startDate: string, endDate: string) => Promise<void> | void;
  isResetting?: boolean;
}

export const ResetRangeModal: React.FC<ResetRangeModalProps> = ({
  isOpen,
  onClose,
  reportsMap,
  onConfirmResetRange,
  isResetting = false,
}) => {
  const todayKey = new Date().toISOString().split('T')[0];

  // Default: 7 days ago to today
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(todayKey);

  // Calculate affected records within selected range
  const affectedSummary = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) {
      return { count: 0, totalOrders: 0, totalIncome: 0, dates: [] };
    }

    const dates: string[] = [];
    let totalOrders = 0;
    let totalIncome = 0;

    Object.entries(reportsMap).forEach(([dateKey, report]) => {
      if (dateKey >= startDate && dateKey <= endDate && report) {
        const ordersCount = calculateTotalPrints(report.orders || []);
        const incomeCount = calculateTotalIncome(report.incomes || []);
        if (ordersCount > 0 || incomeCount > 0 || (report.photos && report.photos.length > 0)) {
          dates.push(dateKey);
          totalOrders += ordersCount;
          totalIncome += incomeCount;
        }
      }
    });

    return {
      count: dates.length,
      totalOrders,
      totalIncome,
      dates,
    };
  }, [reportsMap, startDate, endDate]);

  if (!isOpen) return null;

  const isValidRange = Boolean(startDate && endDate && startDate <= endDate);

  // Quick Range Presets
  const handleApplyPreset = (preset: 'today' | 'last7' | 'month' | 'last30') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    setEndDate(todayStr);

    if (preset === 'today') {
      setStartDate(todayStr);
    } else if (preset === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
    } else if (preset === 'month') {
      const firstDay = `${todayStr.substring(0, 7)}-01`;
      setStartDate(firstDay);
    } else if (preset === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
    }
  };

  const handleConfirm = () => {
    if (!isValidRange || isResetting) return;
    onConfirmResetRange(startDate, endDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-maroon-card rounded-3xl shadow-2xl border border-rose-500/35 p-6 animate-in zoom-in-95 text-rose-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-rose-500/20 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#20040b] border border-rose-500/35 flex items-center justify-center text-rose-300 shadow-lg shadow-rose-950/60">
              <Calendar className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider rounded-md bg-rose-950 text-rose-300 border border-rose-500/40">
                Pembersihan Data Berkala
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">Reset Sesuai Rentang Tanggal</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-rose-400/80 hover:text-white hover:bg-rose-950/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          <p className="text-xs text-rose-200/80 leading-relaxed">
            Pilih tanggal mulai dan tanggal selesai. Seluruh data orderan, pemasukan, foto, dan checklist dalam rentang tersebut akan direset bersih, sedangkan tanggal lain di luar rentang akan tetap aman.
          </p>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-rose-300/70 uppercase tracking-wider mb-1.5">
              Pilihan Cepat Rentang:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('today')}
                className="px-2.5 py-1.5 bg-[#1b0308] hover:bg-rose-950 border border-rose-500/25 rounded-xl text-xs font-bold text-rose-200 transition cursor-pointer text-center"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('last7')}
                className="px-2.5 py-1.5 bg-[#1b0308] hover:bg-rose-950 border border-rose-500/25 rounded-xl text-xs font-bold text-rose-200 transition cursor-pointer text-center"
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('month')}
                className="px-2.5 py-1.5 bg-[#1b0308] hover:bg-rose-950 border border-rose-500/25 rounded-xl text-xs font-bold text-rose-200 transition cursor-pointer text-center"
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('last30')}
                className="px-2.5 py-1.5 bg-[#1b0308] hover:bg-rose-950 border border-rose-500/25 rounded-xl text-xs font-bold text-rose-200 transition cursor-pointer text-center"
              >
                30 Hari Terakhir
              </button>
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-[#170308]/90 border border-rose-500/25 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-rose-200 uppercase tracking-wider mb-1">
                Dari Tanggal:
              </label>
              <input
                type="date"
                value={startDate}
                max={endDate || todayKey}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#100205] border border-rose-500/35 rounded-xl text-white text-xs font-bold focus:border-rose-400 focus:outline-none"
              />
              <p className="text-[10px] text-rose-400/60 mt-1 truncate">
                {startDate ? formatDateIndonesian(startDate) : '-'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-200 uppercase tracking-wider mb-1">
                Sampai Tanggal:
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={todayKey}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#100205] border border-rose-500/35 rounded-xl text-white text-xs font-bold focus:border-rose-400 focus:outline-none"
              />
              <p className="text-[10px] text-rose-400/60 mt-1 truncate">
                {endDate ? formatDateIndonesian(endDate) : '-'}
              </p>
            </div>
          </div>

          {!isValidRange && (
            <p className="text-xs text-amber-400 font-bold bg-amber-950/60 p-2.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Tanggal mulai tidak boleh melebihi tanggal selesai.</span>
            </p>
          )}

          {/* Impact Summary Preview Card */}
          {isValidRange && (
            <div className="p-3.5 bg-[#1b0308]/90 border border-rose-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>📊</span> Ringkasan Data yang Akan Direset:
                </span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-600/40">
                  {affectedSummary.count} Hari Berisi Data
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-[#120205] border border-rose-500/20 rounded-xl flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-rose-300/60 block">Total Order Dihapus</span>
                    <strong className="text-sm text-white font-black">{affectedSummary.totalOrders} order</strong>
                  </div>
                </div>

                <div className="p-2 bg-[#120205] border border-rose-500/20 rounded-xl flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-rose-300/60 block">Pemasukan Dihapus</span>
                    <strong className="text-sm text-emerald-400 font-black">{formatRupiah(affectedSummary.totalIncome)}</strong>
                  </div>
                </div>
              </div>

              {affectedSummary.count === 0 ? (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Rentang tanggal ini sudah kosong/bersih dari transaksi.</span>
                </div>
              ) : (
                <p className="text-[11px] text-rose-300/70 pt-1">
                  Hanya tanggal {formatDateIndonesian(startDate)} s.d. {formatDateIndonesian(endDate)} yang akan dibersihkan, data tanggal lainnya tetap aman tersimpan.
                </p>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-red-200/90">
              Penghapusan berlaku dua arah (memori perangkat & database cloud Firebase). Setelah direset, rentang tanggal tersebut menjadi kosong bersih tanpa data dummy otomatis.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-rose-500/20 flex items-center justify-end gap-2.5 mt-2">
          <button
            type="button"
            disabled={isResetting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-rose-500/25 text-rose-200 font-semibold text-xs hover:bg-rose-950/60 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!isValidRange || isResetting}
            onClick={handleConfirm}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer ${
              isValidRange && !isResetting
                ? 'bg-gradient-to-r from-red-700 via-rose-700 to-red-600 text-white hover:from-red-600 hover:to-rose-600 border border-red-400/40 shadow-red-950/50'
                : 'bg-rose-950/40 text-rose-400/40 border border-rose-900/30 cursor-not-allowed'
            }`}
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Mereset Rentang Tanggal...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Tanggal Terpilih</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

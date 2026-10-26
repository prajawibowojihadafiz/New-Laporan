import React from 'react';
import { Layers, Printer, Wallet, AlertTriangle, CheckCircle2, Camera } from 'lucide-react';
import { formatRupiah } from '../utils/reportLogic';

interface StatsBarProps {
  totalOrders: number;
  totalFoto?: number;
  totalAdditional?: number;
  totalPrints: number;
  totalIncome: number;
  hasIssues: boolean;
  issuesCount: number;
  lowStockCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalOrders,
  totalFoto = 0,
  totalAdditional = 0,
  totalPrints,
  totalIncome,
  hasIssues,
  issuesCount,
  lowStockCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
      {/* 1. Total Orders with 2-Category Calculation Breakdown */}
      <div className="glass-maroon-card p-4 rounded-3xl border border-rose-500/25 shadow-xl shadow-black/40 flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#1b0308] border border-rose-500/25 text-rose-300 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
          <Layers className="w-5 h-5 text-rose-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-rose-300/60 uppercase tracking-wider">Total Orderan</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-white">{totalOrders}</span>
            <span className="text-xs font-semibold text-rose-300/60">Order</span>
          </div>
          {/* Sub-keterangan rincian kalkulasi: Foto Sesi Utuh: A | Additional Print: B */}
          <div className="mt-1.5 text-[10.5px] font-medium text-rose-200/90 bg-[#160206]/90 px-2.5 py-1 rounded-xl border border-rose-500/20 leading-tight">
            <span>Foto Sesi Utuh: <strong className="text-rose-300 font-bold">{totalFoto}</strong></span>
            <span className="text-rose-500/40 mx-1">|</span>
            <span>Additional Print: <strong className="text-indigo-300 font-bold">{totalAdditional}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Total Prints / Biji */}
      <div className="glass-maroon-card p-4 rounded-3xl border border-rose-500/25 shadow-xl shadow-black/40 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#1b0308] border border-rose-500/25 text-rose-300 flex items-center justify-center shrink-0 shadow-inner">
          <Printer className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-rose-300/60 uppercase tracking-wider">Total Biji / Print</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-rose-400">{totalPrints}</span>
            <span className="text-xs font-semibold text-rose-300/60">lembar</span>
          </div>
          <p className="text-[10px] text-rose-300/60 font-medium mt-1">
            Akumulasi semua cetakan foto
          </p>
        </div>
      </div>

      {/* 3. Total Income */}
      <div className="glass-maroon-card p-3.5 sm:p-4 rounded-3xl border border-rose-500/25 shadow-xl shadow-black/40 flex items-center gap-3">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1b0308] border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
          <Wallet className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-bold text-rose-300/60 uppercase tracking-wider">Total Pemasukan</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg lg:text-xl font-black text-emerald-400 tracking-tight whitespace-nowrap">
              {formatRupiah(totalIncome)}
            </span>
          </div>
          <p className="text-[10px] text-rose-300/60 font-medium mt-1">
            Tunai & QRIS terkumpul
          </p>
        </div>
      </div>

      {/* 4. Operational Status */}
      <div className="glass-maroon-card p-4 rounded-3xl border border-rose-500/25 shadow-xl shadow-black/40 flex items-center gap-3.5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            hasIssues
              ? 'bg-amber-950/70 border-amber-500/40 text-amber-400'
              : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400'
          }`}
        >
          {hasIssues ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-[11px] font-bold text-rose-300/60 uppercase tracking-wider">Kondisi Booth</p>
          <div className="mt-0.5">
            {hasIssues ? (
              <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded-lg inline-block">
                {issuesCount > 0 ? `${issuesCount} Kendala` : ''}
                {issuesCount > 0 && lowStockCount > 0 ? ' • ' : ''}
                {lowStockCount > 0 ? `${lowStockCount} Stok Kurang` : ''}
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded-lg inline-block">
                Semua Normal
              </span>
            )}
          </div>
          <p className="text-[10px] text-rose-300/60 font-medium mt-1">
            Hardware & stok bahan
          </p>
        </div>
      </div>
    </div>
  );
};

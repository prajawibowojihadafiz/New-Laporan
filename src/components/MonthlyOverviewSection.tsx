import React from 'react';
import {
  Calendar,
  DollarSign,
  Printer,
  ShoppingBag,
  Award,
  ChevronLeft,
  ChevronRight,
  FileDown,
  ArrowUpRight,
} from 'lucide-react';
import {
  MonthlyReportSummary,
  formatRupiah,
} from '../utils/reportLogic';
import { SalesTrendChart } from './SalesTrendChart';

interface MonthlyOverviewSectionProps {
  summary: MonthlyReportSummary;
  selectedMonth: string;
  onChangeMonth: (newMonth: string) => void;
  onSelectDate: (dateKey: string) => void;
  onExportMonthlyPdf: () => void;
  isGeneratingPdf?: boolean;
}

export const MonthlyOverviewSection: React.FC<MonthlyOverviewSectionProps> = ({
  summary,
  selectedMonth,
  onChangeMonth,
  onSelectDate,
  onExportMonthlyPdf,
  isGeneratingPdf = false,
}) => {
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${newY}-${newM}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Month Selector & Export Action */}
      <div className="glass-maroon-card rounded-3xl border border-rose-500/25 p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📅</span> Laporan & Tren Bulanan
          </h2>
          <p className="text-xs text-rose-300/60">
            Pencatatan pendapatan, antrian, dan analisis performa per bulan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Stepper */}
          <div className="flex items-center bg-[#150206]/90 border border-rose-500/25 rounded-2xl p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-rose-950/80 text-rose-300 rounded-lg transition cursor-pointer"
              title="Bulan sebelumnya"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => e.target.value && onChangeMonth(e.target.value)}
              className="px-2.5 py-1 text-xs font-bold text-rose-100 bg-transparent focus:outline-none cursor-pointer"
            />

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-rose-950/80 text-rose-300 rounded-lg transition cursor-pointer"
              title="Bulan berikutnya"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onExportMonthlyPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 active:from-rose-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-rose-950/60 border border-rose-400/30 transition cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Unduh PDF Bulanan & Grafik'}</span>
          </button>
        </div>
      </div>

      {/* 4 Monthly KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Income */}
        <div className="glass-maroon-card p-4 rounded-3xl border border-rose-500/25 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-300/60 uppercase tracking-wider">
              Total Pemasukan
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1b0308] border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatRupiah(summary.totalIncome)}
          </p>
          <p className="text-[11px] text-rose-300/60 mt-0.5">Periode {summary.monthName}</p>
        </div>

        {/* Total Prints */}
        <div className="glass-maroon-card p-4 rounded-3xl border border-rose-500/25 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-300/60 uppercase tracking-wider">
              Total Biji (Print)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400">
            {summary.totalPrints} print
          </p>
          <p className="text-[11px] text-rose-300/60 mt-0.5">{summary.totalOrders} total transaksi</p>
        </div>

        {/* Average Daily */}
        <div className="glass-maroon-card p-4 rounded-3xl border border-rose-500/25 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-300/60 uppercase tracking-wider">
              Rata-rata / Hari
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {formatRupiah(summary.averageDailyIncome)}
          </p>
          <p className="text-[11px] text-rose-300/60 mt-0.5">Hari aktif operasional</p>
        </div>

        {/* Best Performing Day */}
        <div className="glass-maroon-card p-4 rounded-3xl border border-rose-500/25 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-300/60 uppercase tracking-wider">
              Hari Tertinggi
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1b0308] border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-black text-amber-300 truncate">
            {summary.highestDay ? summary.highestDay.dayLabel : '-'}
          </p>
          <p className="text-[11px] text-amber-400/80 font-semibold mt-0.5 truncate">
            {summary.highestDay ? `${formatRupiah(summary.highestDay.income)} (${summary.highestDay.prints} print)` : 'Belum ada'}
          </p>
        </div>
      </div>

      {/* Main Interactive Sales Trend Chart */}
      <SalesTrendChart days={summary.days} monthName={summary.monthName} />

      {/* 2-Column: Payment Breakdown & Daily Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payment Breakdown */}
        <div className="glass-maroon-card rounded-3xl border border-rose-500/25 p-5 shadow-xl flex flex-col">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span>💳</span> Metode Pembayaran
          </h3>
          <p className="text-xs text-rose-300/60 mb-4">Proporsi transaksi {summary.monthName}</p>

          <div className="space-y-3 flex-1">
            {summary.paymentBreakdown.length === 0 ? (
              <p className="text-xs text-rose-300/50 py-6 text-center">Belum ada catatan pembayaran bulan ini.</p>
            ) : (
              summary.paymentBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-200">{item.source}</span>
                    <span className="font-bold text-white">
                      {formatRupiah(item.amount)}{' '}
                      <span className="text-rose-400/60 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#150206] border border-rose-500/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div className="lg:col-span-2 glass-maroon-card rounded-3xl border border-rose-500/25 p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📋</span> Rincian Penjualan Harian ({summary.days.length} Hari)
              </h3>
              <p className="text-xs text-rose-300/60">Klik baris tanggal untuk membuka detail laporan hari tersebut</p>
            </div>
            <span className="text-xs font-bold text-rose-300 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-700/40">
              {summary.monthName}
            </span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#140206]/90 text-rose-300/70 sticky top-0 border-b border-rose-500/20">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Tanggal</th>
                  <th className="py-2.5 px-3 font-bold">Hari</th>
                  <th className="py-2.5 px-3 text-center font-bold">Order</th>
                  <th className="py-2.5 px-3 text-center font-bold">Biji (Print)</th>
                  <th className="py-2.5 px-3 text-right font-bold">Pemasukan</th>
                  <th className="py-2.5 px-3 text-center font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-500/15">
                {summary.days.map((d) => (
                  <tr
                    key={d.date}
                    onClick={() => onSelectDate(d.date)}
                    className="hover:bg-rose-950/40 transition cursor-pointer group"
                  >
                    <td className="py-2 px-3 font-bold text-white">{d.dayLabel}</td>
                    <td className="py-2 px-3 text-rose-300/70">{d.dayOfWeek}</td>
                    <td className="py-2 px-3 text-center font-semibold text-rose-200">{d.ordersCount}</td>
                    <td className="py-2 px-3 text-center font-black text-rose-400">{d.totalPrints}</td>
                    <td className="py-2 px-3 text-right font-black text-emerald-400">
                      {d.totalIncome > 0 ? formatRupiah(d.totalIncome) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-300 font-bold group-hover:text-rose-200 group-hover:underline">
                        Lihat <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

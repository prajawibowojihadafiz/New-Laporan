import React from 'react';
import {
  MonthlyReportSummary,
  Settings,
  formatRupiah,
} from '../utils/reportLogic';
import { SalesTrendChart } from './SalesTrendChart';

interface PdfMonthlyReportTemplateProps {
  summary: MonthlyReportSummary;
  settings: Settings;
  dateStr: string;
}

export const PdfMonthlyReportTemplate = React.forwardRef<
  HTMLDivElement,
  PdfMonthlyReportTemplateProps
>(({ summary, settings, dateStr }, ref) => {
  return (
    <div
      ref={ref}
      id="pdf-monthly-report-document"
      className="bg-white text-slate-900 p-8 max-w-[850px] mx-auto text-xs font-sans print:p-4"
      style={{ width: '850px' }}
    >
      {/* Document Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-6">
        <div className="flex items-center gap-3.5">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-14 h-14 object-contain rounded-xl border border-slate-300 p-1 bg-white"
            />
          ) : (
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-black">
              📊
            </div>
          )}
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              {settings.boothName}
            </h1>
            <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
              Laporan Rekapitulasi & Analisis Penjualan Bulanan
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Periode Laporan
          </p>
          <p className="text-sm font-extrabold text-slate-900">{summary.monthName}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Dicetak: {dateStr}</p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Total Pemasukan
          </p>
          <p className="text-base font-black text-emerald-800 mt-0.5">
            {formatRupiah(summary.totalIncome)}
          </p>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
            Total Biji (Print)
          </p>
          <p className="text-base font-black text-indigo-800 mt-0.5">
            {summary.totalPrints} Print
          </p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            Rata-rata / Hari
          </p>
          <p className="text-base font-black text-blue-800 mt-0.5">
            {formatRupiah(summary.averageDailyIncome)}
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Hari Penjualan Puncak
          </p>
          <p className="text-sm font-black text-amber-900 mt-0.5 truncate">
            {summary.highestDay ? summary.highestDay.dayLabel : '-'}
          </p>
        </div>
      </div>

      {/* GRAFIK NAIK TURUN PENJUALAN BULANAN (CRITICAL REQUIREMENT) */}
      <div className="border border-slate-200 rounded-xl p-4 mb-6 bg-white shadow-none">
        <p className="font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
          <span>📈</span> Grafik Tren Naik Turun Penjualan ({summary.monthName})
        </p>
        <SalesTrendChart
          days={summary.days}
          monthName={summary.monthName}
          isPrintMode={true}
        />
      </div>

      {/* 2-Column: Daily Sales Table & Payment Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Daily Breakdown Table */}
        <div className="col-span-2 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-slate-800 flex justify-between items-center">
            <span>Rincian Penjualan Harian ({summary.days.length} Hari)</span>
            <span className="text-[11px] font-extrabold text-emerald-700">
              {formatRupiah(summary.totalIncome)}
            </span>
          </div>
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-1 px-2.5 font-semibold">Tgl</th>
                <th className="py-1 px-2 font-semibold">Hari</th>
                <th className="py-1 px-2 text-center font-semibold">Order</th>
                <th className="py-1 px-2 text-center font-semibold">Print</th>
                <th className="py-1 px-2.5 text-right font-semibold">Pemasukan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.days.map((d) => (
                <tr key={d.date}>
                  <td className="py-1 px-2.5 font-bold text-slate-800">{d.dayLabel}</td>
                  <td className="py-1 px-2 text-slate-500">{d.dayOfWeek}</td>
                  <td className="py-1 px-2 text-center text-slate-700">{d.ordersCount}</td>
                  <td className="py-1 px-2 text-center font-semibold text-indigo-700">{d.totalPrints}</td>
                  <td className="py-1 px-2.5 text-right font-bold text-emerald-700">
                    {d.totalIncome > 0 ? formatRupiah(d.totalIncome) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Breakdown */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex flex-col">
          <p className="font-bold text-slate-800 mb-2 pb-1 border-b border-slate-200">
            💳 Breakdown Pembayaran
          </p>
          <div className="space-y-2 text-[10px]">
            {summary.paymentBreakdown.map((item, idx) => (
              <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{item.source}</span>
                  <span className="text-emerald-700">{formatRupiah(item.amount)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-right text-[9px] text-slate-400 mt-0.5">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signature Block */}
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center">
        <div>
          <p className="text-xs text-slate-400 mb-12">Petugas / Kasir Pembuat Laporan</p>
          <p className="font-bold text-slate-900 underline">{settings.attendantName}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{settings.boothName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-12">Mengetahui (Owner / Manajemen)</p>
          <p className="font-bold text-slate-900 underline">Owner Photobooth</p>
          <p className="text-[10px] text-slate-400 mt-0.5">+{settings.ownerPhone}</p>
        </div>
      </div>
    </div>
  );
});

PdfMonthlyReportTemplate.displayName = 'PdfMonthlyReportTemplate';

import React from 'react';
import {
  Order,
  Income,
  Issue,
  PurchaseItem,
  BoothCondition,
  StockCondition,
  Settings,
  PhotoItem,
  CustomFrameQueueItem,
  calculateTotalPrints,
  calculateTotalIncome,
  formatRupiah,
  BOOTH_LABELS,
  STOCK_LABELS,
} from '../utils/reportLogic';

interface PdfReportTemplateProps {
  dateStr: string;
  settings: Settings;
  orders: Order[];
  incomes: Income[];
  issues: Issue[];
  purchases: PurchaseItem[];
  photos: PhotoItem[];
  notes: string;
  boothCondition: BoothCondition;
  stockCondition: StockCondition;
  customFrames?: CustomFrameQueueItem[];
}

export const PdfReportTemplate = React.forwardRef<HTMLDivElement, PdfReportTemplateProps>(
  (
    {
      dateStr,
      settings,
      orders,
      incomes,
      issues,
      purchases,
      photos,
      notes,
      boothCondition,
      stockCondition,
      customFrames = [],
    },
    ref
  ) => {
    const totalPrints = calculateTotalPrints(orders);
    const totalIncome = calculateTotalIncome(incomes);

    return (
      <div
        ref={ref}
        id="pdf-report-document"
        className="bg-white text-slate-900 p-8 max-w-[850px] mx-auto text-xs font-sans print:p-4"
        style={{ width: '850px' }}
      >
        {/* Header Document */}
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
                📸
              </div>
            )}
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {settings.boothName}
              </h1>
              <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                Laporan Harian Operasional Photobooth
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tanggal Laporan</p>
            <p className="text-sm font-extrabold text-slate-900">{dateStr}</p>
            <p className="text-xs text-slate-600 mt-0.5">Kasir: <strong className="text-slate-900">{settings.attendantName}</strong></p>
          </div>
        </div>

        {/* 3 Key Metric Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{orders.length} Order</p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Total Biji / Print</p>
            <p className="text-lg font-black text-indigo-700 mt-0.5">{totalPrints} Print</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Pemasukan</p>
            <p className="text-lg font-black text-emerald-700 mt-0.5">{formatRupiah(totalIncome)}</p>
          </div>
        </div>

        {/* 2-Column: Orderan & Pemasukan */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Orderan Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-slate-800 flex justify-between items-center">
              <span>Daftar Orderan ({orders.length})</span>
              <span className="text-[11px] font-extrabold text-indigo-700">{totalPrints} Print</span>
            </div>
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-1.5 px-3 font-semibold">No</th>
                  <th className="py-1.5 px-3 font-semibold">Nama Klien / Order</th>
                  <th className="py-1.5 px-3 text-right font-semibold">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-center text-slate-400">Tidak ada orderan</td>
                  </tr>
                ) : (
                  orders.map((ord, idx) => (
                    <tr key={ord.id}>
                      <td className="py-1.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-800">{ord.clientName}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-900">{ord.prints}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pemasukan Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-100 font-bold text-emerald-900 flex justify-between items-center">
              <span>Rincian Pemasukan</span>
              <span className="text-[11px] font-extrabold text-emerald-700">{formatRupiah(totalIncome)}</span>
            </div>
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-1.5 px-3 font-semibold">No</th>
                  <th className="py-1.5 px-3 font-semibold">Metode / Sumber</th>
                  <th className="py-1.5 px-3 text-right font-semibold">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-center text-slate-400">Tidak ada catatan pemasukan</td>
                  </tr>
                ) : (
                  incomes.map((inc, idx) => (
                    <tr key={inc.id}>
                      <td className="py-1.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-800">{inc.source}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-emerald-700">{formatRupiah(inc.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Antrian Custom Frame (jika ada) */}
        {customFrames.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <div className="bg-pink-50 px-3 py-2 border-b border-pink-100 font-bold text-pink-900 flex justify-between items-center">
              <span>Antrian Custom Frame ({customFrames.length})</span>
              <span className="text-[10px] font-bold text-pink-700">
                {customFrames.filter((c) => c.status !== 'Selesai').length} dalam proses
              </span>
            </div>
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-1.5 px-3 font-semibold">No</th>
                  <th className="py-1.5 px-3 font-semibold">Klien / Event</th>
                  <th className="py-1.5 px-3 font-semibold">Tema Desain</th>
                  <th className="py-1.5 px-3 font-semibold">Catatan Khusus</th>
                  <th className="py-1.5 px-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customFrames.map((frame, idx) => (
                  <tr key={frame.id}>
                    <td className="py-1.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-1.5 px-3 font-bold text-slate-900">{frame.clientName}</td>
                    <td className="py-1.5 px-3 text-pink-700 font-semibold">{frame.theme}</td>
                    <td className="py-1.5 px-3 text-slate-500">{frame.notes || '-'}</td>
                    <td className="py-1.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                        {frame.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Checklist Operasional & Stok */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Booth Checklist */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <p className="font-bold text-slate-800 mb-2 pb-1 border-b border-slate-200">
              🛠️ Kondisi Perangkat Booth
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {(Object.keys(boothCondition) as (keyof BoothCondition)[]).map((key) => {
                const isOk = boothCondition[key] === 'OK';
                return (
                  <div key={key} className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-700">{BOOTH_LABELS[key]}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {boothCondition[key]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stock Checklist */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <p className="font-bold text-slate-800 mb-2 pb-1 border-b border-slate-200">
              📦 Stok Tinta & Perlengkapan
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {(Object.keys(stockCondition) as (keyof StockCondition)[]).map((key) => {
                const isOk = stockCondition[key] === 'OK';
                return (
                  <div key={key} className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-lg">
                    <span className="text-slate-700 truncate pr-1">{STOCK_LABELS[key].label}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] shrink-0 ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {stockCondition[key]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kendala & Barang Belanja */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-slate-200 rounded-xl p-3">
            <p className="font-bold text-amber-900 mb-2">⚠️ Kendala Hari Ini:</p>
            {issues.length === 0 ? (
              <p className="text-slate-400 italic">Tidak ada kendala operasional.</p>
            ) : (
              <ul className="space-y-1">
                {issues.map((i, idx) => (
                  <li key={i.id} className="text-slate-700 flex items-start gap-1.5">
                    <span className="text-slate-400">{idx + 1}.</span>
                    <span>{i.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl p-3">
            <p className="font-bold text-rose-900 mb-2">🛒 Barang yang Harus Dibeli:</p>
            {purchases.length === 0 ? (
              <p className="text-slate-400 italic">Stok aman tercukupi.</p>
            ) : (
              <ul className="space-y-1">
                {purchases.map((p, idx) => (
                  <li key={p.id} className="text-slate-700 flex items-start justify-between gap-1.5">
                    <span>{idx + 1}. {p.name}</span>
                    <strong className="text-slate-900 shrink-0">({p.quantity})</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Catatan Kegiatan */}
        {notes && (
          <div className="border border-slate-200 rounded-xl p-3 mb-6 bg-slate-50/40">
            <p className="font-bold text-slate-900 mb-1">📝 Catatan Kegiatan Hari Ini:</p>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
          </div>
        )}

        {/* Foto Kegiatan Thumbnails in PDF */}
        {photos.length > 0 && (
          <div className="mb-6">
            <p className="font-bold text-slate-900 mb-2">📷 Dokumentasi Foto Kegiatan ({photos.length}):</p>
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(0, 8).map((photo) => (
                <div key={photo.id} className="border border-slate-200 rounded-lg overflow-hidden aspect-video bg-slate-100">
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tanda Tangan / Signature Block */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center">
          <div>
            <p className="text-xs text-slate-400 mb-12">Petugas / Kasir Jaga</p>
            <p className="font-bold text-slate-900 underline">{settings.attendantName}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{settings.boothName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-12">Mengetahui (Owner / Supervisor)</p>
            <p className="font-bold text-slate-900 underline">Owner Photobooth</p>
            <p className="text-[10px] text-slate-400 mt-0.5">+{settings.ownerPhone}</p>
          </div>
        </div>
      </div>
    );
  }
);

PdfReportTemplate.displayName = 'PdfReportTemplate';

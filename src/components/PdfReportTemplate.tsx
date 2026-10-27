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
  calculateTotalFoto,
  calculateTotalAdditionalPrint,
  getOrderCategory,
  getOrderQty,
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
    const totalFoto = calculateTotalFoto(orders);
    const totalAdditional = calculateTotalAdditionalPrint(orders);
    const totalPrints = calculateTotalPrints(orders);
    const totalIncome = calculateTotalIncome(incomes);

    return (
      <div
        ref={ref}
        id="pdf-report-document"
        className="bg-white text-slate-900 p-8 mx-auto text-xs font-sans print-container print:p-2"
        style={{
          width: '800px',
          minWidth: '800px',
          maxWidth: '800px',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Header Document */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-5">
          <div className="flex items-center gap-3.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                crossOrigin={settings.logoUrl.startsWith('data:') ? undefined : 'anonymous'}
                className="w-14 h-14 object-contain rounded-xl border border-slate-300 p-1 bg-white shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl font-black shrink-0">
                📸
              </div>
            )}
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {settings.boothName}
              </h1>
              <p className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">
                Laporan Harian Operasional Photobooth
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Tanggal Laporan
            </p>
            <p className="text-sm font-extrabold text-slate-900">{dateStr}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Kasir: <strong className="text-slate-900 font-bold">{settings.attendantName}</strong>
            </p>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div
          className="mb-5"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '10px',
          }}
        >
          <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Total Foto (Sesi)
            </p>
            <p className="text-base font-black text-slate-900 mt-0.5">{totalFoto} Sesi</p>
          </div>
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">
              Additional Print
            </p>
            <p className="text-base font-black text-indigo-900 mt-0.5">{totalAdditional} Print</p>
          </div>
          <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-[9px] font-bold text-purple-700 uppercase tracking-wider">
              Total Orderan (Semua Foto)
            </p>
            <p className="text-base font-black text-purple-900 mt-0.5">{totalPrints} Order</p>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
              Total Pemasukan
            </p>
            <p className="text-base font-black text-emerald-900 mt-0.5">
              {formatRupiah(totalIncome)}
            </p>
          </div>
        </div>

        {/* 2-Column: Orderan & Pemasukan (Solid HTML Tables) */}
        <div
          className="mb-5"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
          }}
        >
          {/* Orderan Solid Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden flex flex-col bg-white">
            <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 font-bold text-slate-800 flex justify-between items-center text-[11px]">
              <span>Rincian Orderan ({totalPrints} Foto)</span>
              <span className="text-[10px] font-extrabold text-indigo-700">
                {totalFoto} Foto • {totalAdditional} Add
              </span>
            </div>
            <table className="w-full table-fixed text-left text-[11px] border-collapse">
              <colgroup>
                <col style={{ width: '32px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '60px' }} />
              </colgroup>
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr className="page-break-inside-avoid no-break">
                  <th className="py-1.5 px-2.5 font-semibold border-r border-slate-200">No</th>
                  <th className="py-1.5 px-2.5 font-semibold border-r border-slate-200">Kategori / Keterangan</th>
                  <th className="py-1.5 px-2.5 text-right font-semibold">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr className="page-break-inside-avoid no-break">
                    <td colSpan={3} className="py-3 px-3 text-center text-slate-400 italic">
                      Tidak ada orderan
                    </td>
                  </tr>
                ) : (
                  orders.map((ord, idx) => {
                    const cat = getOrderCategory(ord);
                    const qty = getOrderQty(ord);
                    const isAdditional = cat === 'Additional Print';
                    return (
                      <tr key={ord.id} className="page-break-inside-avoid no-break hover:bg-slate-50/50">
                        <td className="py-1.5 px-2.5 text-slate-400 border-r border-slate-100 text-[10px]">{idx + 1}</td>
                        <td className="py-1.5 px-2.5 border-r border-slate-100">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mr-1.5 ${
                              isAdditional
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {cat}
                          </span>
                          {ord.clientName && ord.clientName !== cat && (
                            <span className="text-slate-700 font-medium text-[10px]">
                              {ord.clientName}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                          {qty}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pemasukan Solid Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden flex flex-col bg-white">
            <div className="bg-emerald-50 px-3 py-2 border-b border-emerald-200 font-bold text-emerald-900 flex justify-between items-center text-[11px]">
              <span>Rincian Pemasukan</span>
              <span className="text-[11px] font-extrabold text-emerald-800">
                {formatRupiah(totalIncome)}
              </span>
            </div>
            <table className="w-full table-fixed text-left text-[11px] border-collapse">
              <colgroup>
                <col style={{ width: '38px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '110px' }} />
              </colgroup>
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr className="page-break-inside-avoid no-break">
                  <th className="py-1.5 px-3 font-semibold border-r border-slate-200">No</th>
                  <th className="py-1.5 px-3 font-semibold border-r border-slate-200">Metode / Sumber</th>
                  <th className="py-1.5 px-3 text-right font-semibold">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.length === 0 ? (
                  <tr className="page-break-inside-avoid no-break">
                    <td colSpan={3} className="py-3 px-3 text-center text-slate-400 italic">
                      Tidak ada catatan pemasukan
                    </td>
                  </tr>
                ) : (
                  incomes.map((inc, idx) => (
                    <tr key={inc.id} className="page-break-inside-avoid no-break hover:bg-slate-50/50">
                      <td className="py-1.5 px-3 text-slate-400 border-r border-slate-100">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-800 truncate border-r border-slate-100">
                        {inc.source}
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-emerald-700">
                        {formatRupiah(inc.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Antrian Custom Frame (Solid Table jika ada) */}
        {customFrames.length > 0 && (
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-5 bg-white">
            <div className="bg-pink-50 px-3 py-2 border-b border-pink-200 font-bold text-pink-900 flex justify-between items-center text-[11px]">
              <span>Antrian Custom Frame ({customFrames.length})</span>
              <span className="text-[10px] font-bold text-pink-700">
                {customFrames.filter((c) => c.status !== 'Selesai').length} dalam proses
              </span>
            </div>
            <table className="w-full table-fixed text-left text-[11px] border-collapse">
              <colgroup>
                <col style={{ width: '32px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '85px' }} />
              </colgroup>
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr className="page-break-inside-avoid no-break">
                  <th className="py-1.5 px-3 font-semibold border-r border-slate-200">No</th>
                  <th className="py-1.5 px-3 font-semibold border-r border-slate-200">Klien / Event</th>
                  <th className="py-1.5 px-3 font-semibold border-r border-slate-200">Tema</th>
                  <th className="py-1.5 px-3 font-semibold border-r border-slate-200">Catatan Khusus</th>
                  <th className="py-1.5 px-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customFrames.map((frame, idx) => (
                  <tr key={frame.id} className="page-break-inside-avoid no-break hover:bg-slate-50/50">
                    <td className="py-1.5 px-3 text-slate-400 border-r border-slate-100">{idx + 1}</td>
                    <td className="py-1.5 px-3 font-bold text-slate-900 truncate border-r border-slate-100">
                      {frame.clientName}
                    </td>
                    <td className="py-1.5 px-3 text-pink-700 font-semibold truncate border-r border-slate-100">
                      {frame.theme}
                    </td>
                    <td className="py-1.5 px-3 text-slate-500 truncate border-r border-slate-100">
                      {frame.notes || '-'}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-300">
                        {frame.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Checklist Operasional & Stok (Solid HTML Tables) */}
        <div
          className="mb-5"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
          }}
        >
          {/* Tabel Kondisi Perangkat Booth */}
          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 font-bold text-slate-800 text-[11px] flex justify-between items-center">
              <span>🛠️ Kondisi Perangkat Booth</span>
              <span className="text-[10px] text-slate-500 font-normal">Checklist Fisik</span>
            </div>
            <table className="w-full table-fixed text-left text-[11px] border-collapse">
              <colgroup>
                <col style={{ width: '30px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '80px' }} />
              </colgroup>
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr className="page-break-inside-avoid no-break">
                  <th className="py-1 px-2.5 font-semibold border-r border-slate-200">No</th>
                  <th className="py-1 px-2.5 font-semibold border-r border-slate-200">Komponen</th>
                  <th className="py-1 px-2.5 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(boothCondition) as (keyof BoothCondition)[]).map((key, idx) => {
                  const isOk = boothCondition[key] === 'OK';
                  return (
                    <tr key={key} className="page-break-inside-avoid no-break hover:bg-slate-50/50">
                      <td className="py-1 px-2.5 text-slate-400 border-r border-slate-100">{idx + 1}</td>
                      <td className="py-1 px-2.5 text-slate-800 font-medium border-r border-slate-100">
                        {BOOTH_LABELS[key]}
                      </td>
                      <td className="py-1 px-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                            isOk
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {boothCondition[key]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tabel Stok Tinta & Perlengkapan */}
          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 font-bold text-slate-800 text-[11px] flex justify-between items-center">
              <span>📦 Stok Tinta & Perlengkapan</span>
              <span className="text-[10px] text-slate-500 font-normal">Status Ketersediaan</span>
            </div>
            <table className="w-full table-fixed text-left text-[11px] border-collapse">
              <colgroup>
                <col style={{ width: '30px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '80px' }} />
              </colgroup>
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr className="page-break-inside-avoid no-break">
                  <th className="py-1 px-2.5 font-semibold border-r border-slate-200">No</th>
                  <th className="py-1 px-2.5 font-semibold border-r border-slate-200">Item</th>
                  <th className="py-1 px-2.5 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(stockCondition) as (keyof StockCondition)[]).map((key, idx) => {
                  const isOk = stockCondition[key] === 'OK';
                  return (
                    <tr key={key} className="page-break-inside-avoid no-break hover:bg-slate-50/50">
                      <td className="py-1 px-2.5 text-slate-400 border-r border-slate-100">{idx + 1}</td>
                      <td className="py-1 px-2.5 text-slate-800 font-medium truncate border-r border-slate-100">
                        {STOCK_LABELS[key].label}
                      </td>
                      <td className="py-1 px-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                            isOk
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {stockCondition[key]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kendala & Barang Belanja (Solid HTML Tables) */}
        <div
          className="mb-5"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
          }}
        >
          {/* Tabel Kendala */}
          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
            <div className="bg-amber-50 px-3 py-2 border-b border-amber-200 font-bold text-amber-900 text-[11px] flex justify-between items-center">
              <span>⚠️ Kendala Hari Ini</span>
              <span className="text-[10px] text-amber-700 font-medium">({issues.length} Catatan)</span>
            </div>
            <table className="w-full table-fixed text-left text-[11px] border-collapse">
              <colgroup>
                <col style={{ width: '30px' }} />
                <col style={{ width: 'auto' }} />
              </colgroup>
              <tbody className="divide-y divide-slate-100">
                {issues.length === 0 ? (
                  <tr className="page-break-inside-avoid no-break">
                    <td colSpan={2} className="py-3 px-3 text-center text-slate-400 italic">
                      Tidak ada kendala operasional (Aman & Lancar).
                    </td>
                  </tr>
                ) : (
                  issues.map((i, idx) => (
                    <tr key={i.id} className="page-break-inside-avoid no-break hover:bg-slate-50/50">
                      <td className="py-1.5 px-2.5 text-slate-400 font-bold border-r border-slate-100 align-top">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-700 leading-snug">{i.text}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tabel Kebutuhan Belanja */}
          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
            <div className="bg-rose-50 px-3 py-2 border-b border-rose-200 font-bold text-rose-900 text-[11px] flex justify-between items-center">
              <span>🛒 Barang yang Harus Dibeli</span>
              <span className="text-[10px] text-rose-700 font-medium">({purchases.length} Item)</span>
            </div>
            <table className="w-full table-fixed text-left text-[11px] border-collapse">
              <colgroup>
                <col style={{ width: '30px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '80px' }} />
              </colgroup>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr className="page-break-inside-avoid no-break">
                    <td colSpan={3} className="py-3 px-3 text-center text-slate-400 italic">
                      Stok aman tercukupi, tidak ada kebutuhan beli.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p, idx) => (
                    <tr key={p.id} className="page-break-inside-avoid no-break hover:bg-slate-50/50">
                      <td className="py-1.5 px-2.5 text-slate-400 font-bold border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-700 truncate border-r border-slate-100">
                        {p.name}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                        ({p.quantity})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Catatan Kegiatan */}
        {notes && (
          <div className="border border-slate-300 rounded-xl p-3 mb-5 bg-slate-50/70">
            <p className="font-bold text-slate-900 mb-1 text-[11px]">📝 Catatan Kegiatan Hari Ini:</p>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px]">{notes}</p>
          </div>
        )}

        {/* TABEL DOKUMENTASI FOTO KEGIATAN (RESPONSIF GRID KHUSUS BANYAK FOTO) */}
        <div className="tabel-foto-kegiatan foto-kegiatan-container card-block border border-slate-300 rounded-xl overflow-hidden mb-5 bg-white">
          <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-300 font-extrabold text-slate-800 flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1.5">
              <span>📷</span> TABEL DOKUMENTASI FOTO KEGIATAN ({photos.length} Foto)
            </span>
            <span className="text-[10px] font-semibold text-slate-500">
              Grid Kompak ({photos.length} item) • Ringan & Rapi
            </span>
          </div>

          {photos.length === 0 ? (
            <div className="py-6 px-4 text-center text-slate-400 italic text-xs">
              Belum ada dokumentasi foto kegiatan yang dilampirkan untuk tanggal ini.
            </div>
          ) : (
            <div
              className="foto-grid p-3.5"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '8px',
              }}
            >
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="foto-kegiatan-card card-block border border-slate-300 rounded-lg p-1.5 bg-slate-50/80 flex flex-col items-center"
                  style={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Photo container constrained to max-width 130px, max-height 100px */}
                  <div
                    style={{
                      width: '100%',
                      height: '92px',
                      overflow: 'hidden',
                      borderRadius: '6px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="foto-kegiatan-img"
                      style={{
                        width: '100%',
                        height: '92px',
                        maxWidth: '130px',
                        maxHeight: '100px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        display: 'block',
                        margin: '0 auto',
                      }}
                    />
                  </div>
                  {/* Neatly positioned caption below photo without obscuring image */}
                  <div className="w-full mt-1.5 flex items-center justify-between text-[9px] gap-1">
                    <span className="font-bold text-slate-800 truncate" title={photo.name}>
                      #{idx + 1} {photo.name}
                    </span>
                    <span className="text-slate-500 font-semibold shrink-0 bg-white px-1 py-0.5 rounded border border-slate-200 text-[8px]">
                      {photo.timestamp || dateStr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tanda Tangan / Signature Block */}
        <div
          className="signature-block card-block card pt-6 border-t border-slate-300 text-center"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '32px',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        >
          <div>
            <p className="text-xs text-slate-400 mb-12">Petugas / Kasir Jaga</p>
            <p className="font-bold text-slate-900 underline">{settings.attendantName}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{settings.boothName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-12">Mengetahui (Owner / Supervisor)</p>
            <p className="font-bold text-slate-900 underline">Owner Photobooth</p>
            <p className="text-[10px] text-slate-500 mt-0.5">+{settings.ownerPhone}</p>
          </div>
        </div>
      </div>
    );
  }
);

PdfReportTemplate.displayName = 'PdfReportTemplate';

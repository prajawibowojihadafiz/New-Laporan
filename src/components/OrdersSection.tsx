import React, { useState } from 'react';
import { Tag, Plus, Trash2, Camera, Printer, Layers, Sparkles } from 'lucide-react';
import {
  Order,
  OrderCategory,
  calculateTotalPrints,
  calculateTotalFoto,
  calculateTotalAdditionalPrint,
  getOrderCategory,
  getOrderQty,
} from '../utils/reportLogic';

interface OrdersSectionProps {
  orders: Order[];
  onAddOrder: (category: OrderCategory, qty: number) => void;
  onRemoveOrder: (id: string) => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  onAddOrder,
  onRemoveOrder,
}) => {
  const [category, setCategory] = useState<OrderCategory>('Foto');
  const [qty, setQty] = useState<number | ''>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numQty = Number(qty);
    if (!numQty || numQty <= 0) return;

    onAddOrder(category, numQty);
    setQty(1);
  };

  const totalFoto = calculateTotalFoto(orders);
  const totalAdditional = calculateTotalAdditionalPrint(orders);
  const totalKeseluruhan = calculateTotalPrints(orders);

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-300 flex items-center justify-center shadow-inner">
            <Tag className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Orderan Hari Ini</h2>
            <p className="text-xs text-rose-300/60">Pencatatan 2 Kategori: Foto & Additional Print</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 text-rose-300 font-extrabold text-xs rounded-full border border-rose-700/40">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>Total Orderan: {totalKeseluruhan} Foto</span>
          </span>
        </div>
      </div>

      {/* 3 Summary Recap Badges (Total Foto, Total Additional Print, Total Keseluruhan) */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Total Foto */}
        <div className="p-2.5 rounded-2xl bg-[#1b0308]/85 border border-rose-500/30 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-0.5">
            <Camera className="w-3 h-3 text-rose-400" />
            <span>Total Foto</span>
          </div>
          <span className="text-xl font-black text-white">{totalFoto}</span>
          <span className="text-[9px] text-rose-300/70 font-semibold">Sesi Utuh</span>
        </div>

        {/* Total Additional Print */}
        <div className="p-2.5 rounded-2xl bg-[#1b0308]/85 border border-indigo-500/30 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-0.5">
            <Printer className="w-3 h-3 text-indigo-400" />
            <span>Additional</span>
          </div>
          <span className="text-xl font-black text-indigo-200">{totalAdditional}</span>
          <span className="text-[9px] text-indigo-300/70 font-semibold">Cetak Tambahan</span>
        </div>

        {/* Total Keseluruhan */}
        <div className="p-2.5 rounded-2xl bg-[#1b0308]/85 border border-emerald-500/30 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Total Semua</span>
          </div>
          <span className="text-xl font-black text-emerald-300">{totalKeseluruhan}</span>
          <span className="text-[9px] text-emerald-300/70 font-semibold">Akumulasi Cetak</span>
        </div>
      </div>

      {/* Input Form with 2 Primary Categories Only */}
      <form onSubmit={handleSubmit} className="space-y-3.5 mb-4 p-3.5 bg-[#140206]/70 rounded-2xl border border-rose-500/20">
        {/* Pilihan 2 Kategori Utama */}
        <div>
          <label className="block text-[11px] font-bold text-rose-300/80 uppercase tracking-wider mb-1.5">
            Pilihan Kategori
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCategory('Foto')}
              className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                category === 'Foto'
                  ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white border-rose-400/60 shadow-md shadow-rose-950/60 ring-2 ring-rose-500/30'
                  : 'bg-[#1b0308]/90 text-rose-300/70 border-rose-500/20 hover:bg-rose-950/60'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-sm">
                <Camera className="w-4 h-4 text-rose-300" />
                <span>Foto</span>
              </div>
              <span className="text-[10px] opacity-80 font-normal">Sesi Photobooth Utuh</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('Additional Print')}
              className={`p-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                category === 'Additional Print'
                  ? 'bg-gradient-to-r from-indigo-700 to-indigo-600 text-white border-indigo-400/60 shadow-md shadow-indigo-950/60 ring-2 ring-indigo-500/30'
                  : 'bg-[#1b0308]/90 text-rose-300/70 border-rose-500/20 hover:bg-rose-950/60'
              }`}
            >
              <div className="flex items-center gap-1.5 font-black text-sm">
                <Printer className="w-4 h-4 text-indigo-300" />
                <span>Additional Print</span>
              </div>
              <span className="text-[10px] opacity-80 font-normal">Cetak Tambahan / Ulang</span>
            </button>
          </div>
        </div>

        {/* Input Jumlah (Qty / Berapa Orderan) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="order-qty-input" className="block text-[11px] font-bold text-rose-300/80 uppercase tracking-wider">
              Jumlah (Qty / Berapa Orderan)
            </label>
            <span className="text-[10px] text-rose-400/60 font-semibold">Kategori: {category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQty((prev) => Math.max(1, (Number(prev) || 1) - 1))}
              className="w-10 h-10 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-200 font-black text-base hover:bg-rose-950 transition cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Kurangi jumlah"
            >
              -
            </button>

            <input
              id="order-qty-input"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
              placeholder="1"
              className="flex-1 px-3 py-2 text-base glass-maroon-input rounded-xl text-white font-black transition text-center shadow-inner"
              required
            />

            <button
              type="button"
              onClick={() => setQty((prev) => (Number(prev) || 0) + 1)}
              className="w-10 h-10 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-200 font-black text-base hover:bg-rose-950 transition cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-[11px] text-rose-300/60 font-medium mr-1">Preset Qty:</span>
            {[1, 2, 4, 6, 10, 20].map((presetVal) => (
              <button
                key={presetVal}
                type="button"
                onClick={() => setQty(presetVal)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer border ${
                  qty === presetVal
                    ? 'bg-rose-700 text-white border-rose-400 shadow-sm'
                    : 'bg-[#1b0308]/80 hover:bg-rose-950/80 border-rose-500/20 text-rose-300'
                }`}
              >
                +{presetVal}
              </button>
            ))}
          </div>
        </div>

        {/* Tombol Tambah Orderan */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 active:from-rose-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-950/50 border border-rose-400/30 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Orderan ({category})</span>
        </button>
      </form>

      {/* Orders List / Rekap Tersimpan */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between text-xs text-rose-300/60 font-semibold mb-2 px-1">
          <span>Daftar Orderan Masuk ({totalKeseluruhan} foto • {orders.length} entri)</span>
          <span>Jumlah Order</span>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-rose-300/50 text-xs border border-dashed border-rose-500/20 rounded-2xl bg-[#160206]/50">
              Belum ada orderan yang dicatat hari ini.
            </div>
          ) : (
            orders.map((ord, idx) => {
              const cat = getOrderCategory(ord);
              const orderQty = getOrderQty(ord);
              const isAdditional = cat === 'Additional Print';

              return (
                <div
                  key={ord.id}
                  className="flex items-center justify-between p-3 bg-[#1b0308]/70 hover:bg-[#25050e]/80 border border-rose-500/20 rounded-2xl transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#2a050e] border border-rose-500/30 text-rose-300 text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-lg border ${
                            isAdditional
                              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50'
                              : 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                          }`}
                        >
                          {cat}
                        </span>
                        <span className="text-[11px] text-rose-200/80 font-medium">
                          {isAdditional ? 'Cetak Tambahan' : 'Sesi Photobooth'}
                        </span>
                      </div>
                      {ord.time && (
                        <p className="text-[10px] text-rose-300/60 font-medium mt-0.5">Waktu: {ord.time}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="px-3 py-1 bg-rose-950/90 text-rose-300 font-black text-xs rounded-xl border border-rose-700/40">
                      {orderQty} order
                    </span>
                    <button
                      onClick={() => onRemoveOrder(ord.id)}
                      className="p-1.5 text-rose-400/50 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                      title="Hapus order ini"
                      aria-label="Hapus order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

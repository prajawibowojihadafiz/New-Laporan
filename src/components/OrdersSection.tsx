import React, { useState } from 'react';
import { Tag, Plus, Trash2, Printer } from 'lucide-react';
import { Order, calculateTotalPrints } from '../utils/reportLogic';

interface OrdersSectionProps {
  orders: Order[];
  onAddOrder: (clientName: string, prints: number) => void;
  onRemoveOrder: (id: string) => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  onAddOrder,
  onRemoveOrder,
}) => {
  const [clientName, setClientName] = useState('');
  const [prints, setPrints] = useState<number | ''>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !prints || Number(prints) <= 0) return;
    onAddOrder(clientName.trim(), Number(prints));
    setClientName('');
    setPrints(2);
  };

  const totalPrints = calculateTotalPrints(orders);

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
            <p className="text-xs text-rose-300/60">Pencatatan klien & jumlah cetak foto</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 text-rose-300 font-extrabold text-xs rounded-full border border-rose-700/40">
            <Printer className="w-3.5 h-3.5 text-rose-400" />
            <span>Total: {totalPrints} Print</span>
          </span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label htmlFor="client-name" className="block text-[11px] font-bold text-rose-300/70 uppercase tracking-wider mb-1">
              Nama Order / Klien
            </label>
            <input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Contoh: Sarah & Dion / Wedding Rani"
              className="w-full px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 font-medium transition"
              required
            />
          </div>

          <div>
            <label htmlFor="print-count" className="block text-[11px] font-bold text-rose-300/70 uppercase tracking-wider mb-1">
              Biji (Print)
            </label>
            <input
              id="print-count"
              type="number"
              min="1"
              value={prints}
              onChange={(e) => setPrints(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="2"
              className="w-full px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white font-bold transition text-center"
              required
            />
          </div>
        </div>

        {/* Quick Print Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-rose-300/60 font-medium mr-1">Cepat:</span>
          {[2, 4, 6, 10, 20, 50].map((qty) => (
            <button
              key={qty}
              type="button"
              onClick={() => setPrints(qty)}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-lg transition cursor-pointer border ${
                prints === qty
                  ? 'bg-rose-700 text-white border-rose-500 shadow-sm'
                  : 'bg-[#1a0308]/80 hover:bg-rose-950/80 border-rose-500/20 text-rose-300'
              }`}
            >
              +{qty}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 active:from-rose-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-950/50 border border-rose-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Orderan</span>
        </button>
      </form>

      {/* Orders List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between text-xs text-rose-300/60 font-semibold mb-2 px-1">
          <span>Daftar Order ({orders.length})</span>
          <span>Jumlah Biji</span>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-rose-300/50 text-xs border border-dashed border-rose-500/20 rounded-2xl bg-[#160206]/50">
              Belum ada orderan yang dicatat hari ini.
            </div>
          ) : (
            orders.map((ord, idx) => (
              <div
                key={ord.id}
                className="flex items-center justify-between p-3 bg-[#1b0308]/70 hover:bg-[#25050e]/80 border border-rose-500/20 rounded-2xl transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-[#2a050e] border border-rose-500/30 text-rose-300 text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{ord.clientName}</p>
                    {ord.time && <p className="text-[10px] text-rose-300/60 font-medium">{ord.time}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="px-2.5 py-1 bg-rose-950/90 text-rose-300 font-black text-xs rounded-xl border border-rose-700/40">
                    {ord.prints} print
                  </span>
                  <button
                    onClick={() => onRemoveOrder(ord.id)}
                    className="p-1.5 text-rose-400/50 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                    title={`Hapus order ${ord.clientName}`}
                    aria-label={`Hapus order ${ord.clientName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

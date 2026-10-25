import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { PurchaseItem } from '../utils/reportLogic';

interface PurchasesSectionProps {
  purchases: PurchaseItem[];
  onAddPurchase: (name: string, quantity: string) => void;
  onRemovePurchase: (id: string) => void;
}

export const PurchasesSection: React.FC<PurchasesSectionProps> = ({
  purchases,
  onAddPurchase,
  onRemovePurchase,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quantity.trim()) return;
    onAddPurchase(name.trim(), quantity.trim());
    setName('');
    setQuantity('');
  };

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-300 flex items-center justify-center shadow-inner">
            <ShoppingBag className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Barang yang Harus Dibeli</h2>
            <p className="text-xs text-rose-300/60">Restock konsumabel & perlengkapan</p>
          </div>
        </div>
        <div>
          <span
            className={`px-3 py-1 font-extrabold text-xs rounded-full border ${
              purchases.length > 0
                ? 'bg-rose-950/80 text-rose-300 border-rose-600/40'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
            }`}
          >
            {purchases.length > 0 ? `${purchases.length} Item Belanja` : 'Stok Aman'}
          </span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Barang (mis: Lakban / Kertas)"
              className="w-full px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 transition"
              required
            />
          </div>

          <div>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Jumlah (2 Roll / 1 Pcs)"
              className="w-full px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 transition text-center"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 active:from-rose-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-950/50 border border-rose-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang Belanja</span>
        </button>
      </form>

      {/* Purchases List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
          {purchases.length === 0 ? (
            <div className="py-6 text-center text-emerald-300 bg-emerald-950/40 border border-emerald-600/30 rounded-2xl flex flex-col items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-xs font-bold">Semua stok perlengkapan masih aman tercukupi.</p>
            </div>
          ) : (
            purchases.map((item) => {
              const isAuto = Boolean(item.autoSource);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs sm:text-sm transition ${
                    isAuto
                      ? 'bg-rose-950/70 border-rose-500/35'
                      : 'bg-[#1b0308]/70 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <span className="mt-0.5 shrink-0">{isAuto ? '📦' : '🛒'}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-white break-words">{item.name}</p>
                      {isAuto && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                          Otomatis dari Stok Kurang
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="px-2.5 py-1 bg-rose-950/90 text-rose-300 font-bold text-xs rounded-xl border border-rose-700/40 shadow-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onRemovePurchase(item.id)}
                      className="p-1.5 text-rose-400/50 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                      title={`Hapus ${item.name}`}
                      aria-label={`Hapus ${item.name}`}
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

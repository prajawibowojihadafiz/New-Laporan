import React from 'react';
import { Droplet, FileText, Package, Check, AlertOctagon } from 'lucide-react';
import { StockCondition, StatusOKKurang } from '../utils/reportLogic';

interface StockChecklistProps {
  condition: StockCondition;
  onToggle: (key: keyof StockCondition, status: StatusOKKurang) => void;
}

interface InkItemConfig {
  key: keyof StockCondition;
  label: string;
  name: string;
  badgeBg: string;
}

const INK_ITEMS: InkItemConfig[] = [
  { key: 'bk', label: 'BK', name: 'Black', badgeBg: 'bg-black text-white border border-slate-700' },
  { key: 'c', label: 'C', name: 'Cyan', badgeBg: 'bg-cyan-500 text-black font-black' },
  { key: 'y', label: 'Y', name: 'Yellow', badgeBg: 'bg-amber-400 text-black font-black' },
  { key: 'm', label: 'M', name: 'Magenta', badgeBg: 'bg-pink-600 text-white font-black' },
  { key: 'lc', label: 'LC', name: 'Lt. Cyan', badgeBg: 'bg-sky-400 text-black font-black' },
  { key: 'lm', label: 'LM', name: 'Lt. Magenta', badgeBg: 'bg-pink-400 text-black font-black' },
];

const MAIN_SUPPLIES: {
  key: keyof StockCondition;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'paper', label: 'Kertas Foto', desc: 'Glossy / Luster 4R & strip', icon: FileText },
  { key: 'inkBox', label: 'Box Tinta (Maintenance)', desc: 'Waste ink tank / pad printer', icon: Package },
];

export const StockChecklist: React.FC<StockChecklistProps> = ({
  condition,
  onToggle,
}) => {
  const lowCount = Object.values(condition).filter((val) => val === 'Kurang').length;

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>📦</span> Stok & Perlengkapan
          </h2>
          <p className="text-xs text-rose-300/60">Tinta printer & perlengkapan konsumabel</p>
        </div>
        <div>
          {lowCount > 0 ? (
            <span className="px-3 py-1 bg-amber-950/80 text-amber-300 font-extrabold text-xs rounded-full border border-amber-600/40">
              {lowCount} Stok Kurang
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 font-extrabold text-xs rounded-full border border-emerald-600/40">
              Semua Cukup
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 px-3.5 py-2.5 bg-[#1b0308]/80 border border-rose-500/20 rounded-2xl text-[11px] text-rose-200/80 flex items-center gap-2">
        <span className="text-rose-400 font-bold text-sm">💡</span>
        <span>
          Menekan tombol <strong>[Kurang]</strong> otomatis menambahkan item ke <strong>Barang yang Harus Dibeli</strong>.
        </span>
      </div>

      {/* Sub-header 1: Tinta Printer */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Droplet className="w-3.5 h-3.5 text-rose-400" />
          <h3 className="text-xs font-bold text-rose-300/80 uppercase tracking-wider">
            1. Tinta Printer (6 Warna)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INK_ITEMS.map(({ key, label, name, badgeBg }) => {
            const isOk = condition[key] === 'OK';
            return (
              <div
                key={key}
                className={`p-2.5 rounded-2xl border transition ${
                  isOk
                    ? 'bg-[#1b0308]/60 border-rose-500/20'
                    : 'bg-amber-950/70 border-amber-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] ${badgeBg}`}>
                      {label}
                    </span>
                    <span className="text-xs font-bold text-white">{name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => onToggle(key, 'OK')}
                    className={`py-1 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-0.5 cursor-pointer border ${
                      isOk
                        ? 'bg-emerald-700 text-white border-emerald-500 shadow-xs'
                        : 'bg-[#180308]/80 hover:bg-rose-950/80 border-rose-500/20 text-rose-300/70'
                    }`}
                    aria-label={`Tinta ${label} OK`}
                  >
                    <Check className="w-3 h-3" />
                    <span>OK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggle(key, 'Kurang')}
                    className={`py-1 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-0.5 cursor-pointer border ${
                      !isOk
                        ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
                        : 'bg-[#180308]/80 hover:bg-amber-950/80 border-rose-500/20 text-rose-300/70'
                    }`}
                    aria-label={`Tinta ${label} Kurang`}
                  >
                    <AlertOctagon className="w-3 h-3" />
                    <span>Kurang</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-header 2: Perlengkapan Utama */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Package className="w-3.5 h-3.5 text-rose-400" />
          <h3 className="text-xs font-bold text-rose-300/80 uppercase tracking-wider">
            2. Perlengkapan Utama
          </h3>
        </div>

        <div className="space-y-2">
          {MAIN_SUPPLIES.map(({ key, label, desc, icon: SupplyIcon }) => {
            const isOk = condition[key] === 'OK';
            return (
              <div
                key={key}
                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                  isOk
                    ? 'bg-[#1b0308]/60 border-rose-500/20'
                    : 'bg-amber-950/70 border-amber-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isOk ? 'bg-[#25050e] border-rose-500/25 text-rose-300' : 'bg-amber-900 border-amber-500 text-amber-200'
                    }`}
                  >
                    <SupplyIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">{label}</span>
                    <p className="text-[11px] text-rose-300/60">{desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggle(key, 'OK')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                      isOk
                        ? 'bg-emerald-700 text-white border-emerald-500 shadow-sm'
                        : 'bg-[#180308]/80 hover:bg-rose-950/80 border-rose-500/20 text-rose-300/70'
                    }`}
                    aria-label={`${label} OK`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>OK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggle(key, 'Kurang')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                      !isOk
                        ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                        : 'bg-[#180308]/80 hover:bg-amber-950/80 border-rose-500/20 text-rose-300/70'
                    }`}
                    aria-label={`${label} Kurang`}
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Kurang</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

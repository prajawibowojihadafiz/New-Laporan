import React from 'react';
import { Camera, Sun, Monitor, Printer, Sparkles, Check, AlertCircle } from 'lucide-react';
import { BoothCondition, StatusOKMasalah } from '../utils/reportLogic';

interface BoothChecklistProps {
  condition: BoothCondition;
  onToggle: (key: keyof BoothCondition, status: StatusOKMasalah) => void;
}

const BOOTH_ITEMS: {
  key: keyof BoothCondition;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'camera', label: 'Kamera', desc: 'Fokus, baterai / AC power, lensa bersih', icon: Camera },
  { key: 'ringLight', label: 'Lampu Ring / Lighting', desc: 'Tingkat terang & adaptor stabil', icon: Sun },
  { key: 'screen', label: 'Layar / Monitor', desc: 'Touchscreen responsif & tampilan jernih', icon: Monitor },
  { key: 'printer', label: 'Printer Booth', desc: 'Roller lancar, tidak paper jam / garis', icon: Printer },
  { key: 'cleanliness', label: 'Kebersihan Booth', desc: 'Area booth, meja props, & kabel rapi', icon: Sparkles },
];

export const BoothChecklist: React.FC<BoothChecklistProps> = ({
  condition,
  onToggle,
}) => {
  const issuesCount = Object.values(condition).filter((val) => val === 'Masalah').length;

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🛠️</span> Cek Kondisi Booth
          </h2>
          <p className="text-xs text-rose-300/60">Pengecekan perangkat sebelum & saat operasional</p>
        </div>
        <div>
          {issuesCount > 0 ? (
            <span className="px-3 py-1 bg-rose-950/80 text-rose-300 font-extrabold text-xs rounded-full border border-rose-600/40">
              {issuesCount} Masalah
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 font-extrabold text-xs rounded-full border border-emerald-600/40">
              Semua OK
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 px-3.5 py-2.5 bg-[#1b0308]/80 border border-rose-500/20 rounded-2xl text-[11px] text-rose-200/80 flex items-center gap-2">
        <span className="text-amber-400 font-bold text-sm">💡</span>
        <span>
          Menekan tombol <strong>[Masalah]</strong> otomatis mencatat item ke daftar <strong>Kendala Hari Ini</strong>.
        </span>
      </div>

      <div className="space-y-2.5">
        {BOOTH_ITEMS.map(({ key, label, desc, icon: IconComponent }) => {
          const isOk = condition[key] === 'OK';
          return (
            <div
              key={key}
              className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                isOk
                  ? 'bg-[#1b0308]/60 border-rose-500/20'
                  : 'bg-rose-950/70 border-rose-500/40 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isOk
                      ? 'bg-[#25050e] border-rose-500/25 text-rose-300'
                      : 'bg-rose-900 border-rose-400 text-rose-100'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{label}</span>
                    {!isOk && (
                      <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded">
                        Ada Masalah
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-rose-300/60">{desc}</p>
                </div>
              </div>

              {/* Status Selector Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => onToggle(key, 'OK')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
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
                  onClick={() => onToggle(key, 'Masalah')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                    !isOk
                      ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                      : 'bg-[#180308]/80 hover:bg-rose-950/80 border-rose-500/20 text-rose-300/70'
                  }`}
                  aria-label={`${label} Masalah`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Masalah</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { AlertOctagon, Trash2, X, RefreshCw, Database } from 'lucide-react';

interface ResetAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResetAll: (options: { resetSettings: boolean }) => void;
  isResetting?: boolean;
}

export const ResetAllModal: React.FC<ResetAllModalProps> = ({
  isOpen,
  onClose,
  onConfirmResetAll,
  isResetting = false,
}) => {
  const [resetSettings, setResetSettings] = useState(false);
  const [confirmKeyword, setConfirmKeyword] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmKeyword.trim().toUpperCase() === 'RESET';

  const handleConfirm = () => {
    if (!isConfirmed) return;
    onConfirmResetAll({ resetSettings });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-maroon-card rounded-3xl shadow-2xl border border-rose-500/35 p-6 animate-in zoom-in-95 text-rose-100">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/90 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/60">
              <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-red-950 text-red-300 border border-red-500/40">
                Tindakan Berbahaya
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">Reset Semua Data?</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-rose-400/80 hover:text-white hover:bg-rose-950/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Content */}
        <div className="p-3.5 bg-[#180308]/90 border border-rose-500/25 rounded-2xl text-xs space-y-2 mb-4">
          <p className="font-bold text-rose-200">
            Perhatian: Tindakan ini akan menghapus permanen:
          </p>
          <ul className="list-disc list-inside space-y-1 text-rose-300/80 text-[11px] leading-relaxed">
            <li>Seluruh daftar orderan transaksi di <strong className="text-white">SEMUA tanggal</strong>.</li>
            <li>Seluruh rincian pemasukan uang kas & QRIS.</li>
            <li>Antrean custom frame, kendala operasional, dan checklist stok.</li>
            <li>Data di penyimpanan browser HP/Laptop <strong className="text-rose-300">serta cloud Firebase Realtime</strong>.</li>
          </ul>
        </div>

        {/* Option: Reset Settings Checkbox */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#140207] border border-rose-500/20 mb-4 cursor-pointer hover:bg-rose-950/30 transition">
          <input
            type="checkbox"
            checked={resetSettings}
            onChange={(e) => setResetSettings(e.target.checked)}
            className="mt-0.5 accent-rose-600 rounded cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-bold text-white block">Reset juga pengaturan booth & nama kasir</span>
            <span className="text-[11px] text-rose-300/60 block mt-0.5">
              Mengembalikan nama outlet, operator, nomor WA, dan logo ke pengaturan bawaan.
            </span>
          </div>
        </label>

        {/* Security confirmation input */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-rose-300/80 mb-1.5">
            Ketik kata <span className="font-black text-red-400 tracking-wider">RESET</span> untuk konfirmasi:
          </label>
          <input
            type="text"
            value={confirmKeyword}
            onChange={(e) => setConfirmKeyword(e.target.value)}
            placeholder="RESET"
            className="w-full px-3.5 py-2.5 text-center text-sm tracking-widest uppercase glass-maroon-input rounded-xl text-white font-black placeholder:text-rose-400/30 border-rose-500/40 focus:border-red-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isResetting}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-rose-500/25 text-rose-200 font-semibold text-xs hover:bg-rose-950/60 transition cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!isConfirmed || isResetting}
            onClick={handleConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer ${
              isConfirmed && !isResetting
                ? 'bg-gradient-to-r from-red-700 via-rose-700 to-red-600 text-white hover:from-red-600 hover:to-rose-600 border border-red-400/40 shadow-red-950/50'
                : 'bg-rose-950/40 text-rose-400/40 border border-rose-900/30 cursor-not-allowed'
            }`}
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Seluruh Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

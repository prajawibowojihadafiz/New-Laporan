import React, { useEffect } from 'react';
import { LogOut, X, ShieldCheck } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  username: string;
  boothName: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  username,
  boothName,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0103]/85 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="relative w-full max-w-sm glass-maroon-card rounded-3xl shadow-2xl border border-rose-500/30 p-6 overflow-hidden animate-in zoom-in-95 duration-150 text-rose-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-rose-300/60 hover:text-rose-100 p-1.5 rounded-xl hover:bg-rose-950/60 transition cursor-pointer"
          aria-label="Tutup dialog konfirmasi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Icon */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
            <LogOut className="w-7 h-7" />
          </div>

          <h3 id="logout-modal-title" className="text-lg font-black text-white">
            Keluar dari Sistem?
          </h3>
          <p className="text-xs text-rose-300/70 mt-1 max-w-xs leading-relaxed">
            Sesi aktif Anda akan diakhiri. Anda perlu memasukkan ID & Password untuk masuk kembali.
          </p>

          {/* User Session Info Card */}
          <div className="w-full mt-4 p-3.5 bg-[#170308]/90 rounded-2xl border border-rose-500/25 text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-rose-300/60 font-medium">Pengguna:</span>
              <span className="font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                {username}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-rose-300/60 font-medium">Booth:</span>
              <span className="font-semibold text-rose-200 truncate max-w-[170px]">
                {boothName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-rose-500/25 text-rose-200 font-semibold text-xs hover:bg-rose-950/60 transition cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            type="button"
            id="confirm-logout-button"
            data-testid="confirm-logout-button"
            onClick={onConfirmLogout}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 active:from-rose-800 text-white font-bold text-xs shadow-lg shadow-rose-950/50 border border-rose-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <LogOut className="w-4 h-4" />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

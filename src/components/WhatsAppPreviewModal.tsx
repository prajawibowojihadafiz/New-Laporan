import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone } from 'lucide-react';
import { sanitizePhoneNumber } from '../utils/reportLogic';

interface WhatsAppPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
  ownerPhone: string;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  isOpen,
  onClose,
  messageText,
  ownerPhone,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanPhone = sanitizePhoneNumber(ownerPhone);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0a0103]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="glass-maroon-card rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-500/30 flex flex-col max-h-[90vh] text-rose-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Kirim Ringkasan WhatsApp</h3>
              <p className="text-xs text-rose-300/60">Pratinjau pesan otomatis untuk Owner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-300/60 hover:text-white rounded-xl hover:bg-rose-950/60 transition cursor-pointer"
            aria-label="Tutup modal pratinjau WhatsApp"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Phone info */}
        <div className="mb-3.5 p-3.5 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-200">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Nomor Tujuan Owner:</span>
            <strong className="font-mono font-bold text-emerald-300">+{cleanPhone}</strong>
          </div>
          <span className="text-[10px] bg-emerald-900/80 text-emerald-300 font-black px-2.5 py-0.5 rounded-full border border-emerald-600/40">
            WA Direct
          </span>
        </div>

        {/* Message Preview Box */}
        <div className="flex-1 overflow-hidden flex flex-col mb-4">
          <label className="block text-xs font-bold text-rose-300/80 uppercase tracking-wider mb-1.5">
            Teks Pesan Terformat:
          </label>
          <div className="flex-1 overflow-y-auto p-4 bg-[#140206] text-rose-100 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-rose-500/20 selection:bg-rose-600 selection:text-white shadow-inner">
            {messageText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-rose-500/20">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 bg-[#1b0308] hover:bg-rose-950/80 border border-rose-500/25 text-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-rose-300 hover:text-white rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 active:from-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Buka WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

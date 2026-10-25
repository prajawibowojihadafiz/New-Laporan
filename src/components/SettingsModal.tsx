import React, { useState } from 'react';
import { X, Store, User, Phone, Check, RefreshCw, Download, Copy, Settings as SettingsIcon, Trash2, Cloud, Database, AlertTriangle } from 'lucide-react';
import { Settings, sanitizePhoneNumber } from '../utils/reportLogic';
import { generateSingleFileHtml } from '../utils/singleFileHtmlGenerator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (newSettings: Settings) => void;
  onResetDay: () => void;
  onResetAllData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDay,
  onResetAllData,
}) => {
  const [boothName, setBoothName] = useState(settings.boothName);
  const [attendantName, setAttendantName] = useState(settings.attendantName);
  const [ownerPhone, setOwnerPhone] = useState(settings.ownerPhone);
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || '');
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      boothName: boothName.trim() || 'Photobooth',
      attendantName: attendantName.trim() || 'Kasir',
      ownerPhone: sanitizePhoneNumber(ownerPhone) || '6281234567890',
      logoUrl: logoUrl.trim() || undefined,
    });
    onClose();
  };

  const handleDownloadSingleFile = () => {
    const htmlCode = generateSingleFileHtml({ boothName, attendantName, ownerPhone, logoUrl });
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-harian-photobooth-standalone.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySingleFile = async () => {
    const htmlCode = generateSingleFileHtml({ boothName, attendantName, ownerPhone, logoUrl });
    await navigator.clipboard.writeText(htmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0103]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="glass-maroon-card rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-500/30 flex flex-col max-h-[90vh] text-rose-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1b0308] border border-rose-500/30 text-rose-300 flex items-center justify-center shadow-inner">
              <SettingsIcon className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Pengaturan Photobooth</h3>
              <p className="text-xs text-rose-300/60">Konfigurasi booth, kasir, & nomor WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-300/60 hover:text-white rounded-xl hover:bg-rose-950/60 transition cursor-pointer"
            aria-label="Tutup modal pengaturan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Logo Photobooth Feature */}
          <div className="p-3.5 bg-[#170308]/90 border border-rose-500/25 rounded-2xl">
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Logo Brand Photobooth</span>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-[11px] text-rose-400 hover:text-rose-200 font-bold cursor-pointer"
                >
                  Hapus Logo
                </button>
              )}
            </label>

            <div className="flex items-center gap-3.5 mb-2.5">
              <div className="w-14 h-14 rounded-2xl border border-rose-500/30 bg-[#25050e] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl text-rose-400/40">📸</span>
                )}
              </div>

              <div className="flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-bold rounded-xl border border-rose-500/30 cursor-pointer transition">
                  <span>📁 Unggah Logo Anda</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-rose-300/60 mt-1">
                  Mendukung PNG transparan, JPG, atau WebP. Tampil di Header & PDF.
                </p>
              </div>
            </div>

            {/* Preset Logos */}
            <div className="pt-2 border-t border-rose-500/20 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-rose-300/60 font-semibold">Preset Logo:</span>
              <button
                type="button"
                onClick={() =>
                  setLogoUrl(
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23e11d48"/><circle cx="50" cy="50" r="26" fill="%23ffffff"/><circle cx="50" cy="50" r="18" fill="%23e11d48"/><rect x="62" y="24" width="12" height="8" rx="2" fill="%23fbbf24"/></svg>'
                  )
                }
                className="px-2 py-0.5 text-[10px] bg-[#1f040b] border border-rose-500/25 rounded-lg font-bold text-rose-200 hover:bg-rose-950/80 cursor-pointer"
              >
                Snap Studio
              </button>
              <button
                type="button"
                onClick={() =>
                  setLogoUrl(
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="20" fill="%23be123c"/><path d="M25 40 L50 20 L75 40 L75 80 L25 80 Z" fill="%23ffffff"/><circle cx="50" cy="55" r="12" fill="%23be123c"/></svg>'
                  )
                }
                className="px-2 py-0.5 text-[10px] bg-[#1f040b] border border-rose-500/25 rounded-lg font-bold text-rose-200 hover:bg-rose-950/80 cursor-pointer"
              >
                Pink Booth
              </button>
              <button
                type="button"
                onClick={() =>
                  setLogoUrl(
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="16" fill="%23881337"/><circle cx="50" cy="50" r="30" stroke="%23fda4af" stroke-width="6" fill="none"/><text x="50" y="58" font-size="24" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="%23ffffff">PB</text></svg>'
                  )
                }
                className="px-2 py-0.5 text-[10px] bg-[#1f040b] border border-rose-500/25 rounded-lg font-bold text-rose-200 hover:bg-rose-950/80 cursor-pointer"
              >
                Dark Monogram
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-300/80 uppercase tracking-wider mb-1.5">
              Nama Photobooth / Cabang
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400">
                <Store className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={boothName}
                onChange={(e) => setBoothName(e.target.value)}
                placeholder="Contoh: SnapVibe Photobooth - Mall Kota Kasablanka"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm glass-maroon-input rounded-xl text-white font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-300/80 uppercase tracking-wider mb-1.5">
              Nama Kasir / Attendant Jaga
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={attendantName}
                onChange={(e) => setAttendantName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm glass-maroon-input rounded-xl text-white font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-300/80 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp Owner (Tujuan Laporan)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Contoh: 081234567890 atau 6281234567890"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm glass-maroon-input rounded-xl text-white font-semibold"
                required
              />
            </div>
            <p className="text-[11px] text-rose-300/60 mt-1">
              Bisa diawali 08 atau 62. Sistem otomatis mengaitkannya ke format tautan WhatsApp.
            </p>
          </div>

          {/* Standalone Single File HTML Export Banner */}
          <div className="p-3.5 bg-[#170308]/90 border border-rose-500/25 rounded-2xl">
            <p className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
              <span>📄</span> Single File HTML Standalone
            </p>
            <p className="text-[11px] text-rose-300/70 mb-2.5 leading-relaxed">
              Unduh atau salin satu berkas file .html tunggal yang dapat langsung dibuka offline di browser tanpa server.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSingleFile}
                className="px-3 py-1.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File .html</span>
              </button>
              <button
                type="button"
                onClick={handleCopySingleFile}
                className="px-3 py-1.5 bg-[#1f040b] border border-rose-500/25 hover:bg-rose-950/80 text-rose-200 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHtml ? 'Tersalin!' : 'Salin Kode HTML'}</span>
              </button>
            </div>
          </div>

          {/* Firebase Realtime Cloud Sync Info */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Firebase Realtime Sync Aktif
                </p>
                <p className="text-[11px] text-emerald-200/70">
                  Data order & pemasukan otomatis sinkron antara HP Kasir dan Laptop Owner.
                </p>
              </div>
            </div>
          </div>

          {/* Reset Day Data */}
          <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Mulai Hari Baru?</p>
              <p className="text-[11px] text-rose-300/60">Bersihkan data order & pemasukan tanggal aktif</p>
            </div>
            <button
              type="button"
              onClick={onResetDay}
              className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Hari Ini</span>
            </button>
          </div>

          {/* Zona Bahaya: Reset Semua Data */}
          {onResetAllData && (
            <div className="p-3 bg-red-950/40 border border-red-500/35 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  Zona Bahaya: Reset Seluruh Data
                </p>
                <p className="text-[11px] text-red-300/70">
                  Hapus total riwayat orderan, pemasukan, dan laporan semua tanggal.
                </p>
              </div>
              <button
                type="button"
                onClick={onResetAllData}
                className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 border border-red-400/40 rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Semua Data</span>
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-rose-500/20 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-rose-300 hover:text-white rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-950/60 border border-rose-400/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

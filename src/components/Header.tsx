import React from 'react';
import {
  Camera,
  FileDown,
  Send,
  Settings as SettingsIcon,
  Calendar,
  Store,
  User,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  LogOut,
  Sparkles,
  Cloud,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { Settings } from '../utils/reportLogic';

interface HeaderProps {
  dateStr: string;
  selectedDate: string; // YYYY-MM-DD
  onChangeDate: (newDate: string) => void;
  viewMode: 'daily' | 'monthly';
  onToggleViewMode: (mode: 'daily' | 'monthly') => void;
  settings: Settings;
  onOpenSettings: () => void;
  onExportPdf: () => void;
  onSharePdf: () => void;
  onOpenWhatsAppModal: () => void;
  isGeneratingPdf?: boolean;
  isSharingPdf?: boolean;
  loggedInUser?: string;
  onLogout?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'offline';
  onResyncFirebase?: () => void;
  isResyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dateStr,
  selectedDate,
  onChangeDate,
  viewMode,
  onToggleViewMode,
  settings,
  onOpenSettings,
  onExportPdf,
  onSharePdf,
  onOpenWhatsAppModal,
  isGeneratingPdf = false,
  isSharingPdf = false,
  loggedInUser = 'Meraya.id',
  onLogout,
  syncStatus = 'synced',
  onResyncFirebase,
  isResyncing = false,
}) => {
  const handlePrevDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() - 1);
    const newY = cur.getFullYear();
    const newM = String(cur.getMonth() + 1).padStart(2, '0');
    const newD = String(cur.getDate()).padStart(2, '0');
    onChangeDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + 1);
    const newY = cur.getFullYear();
    const newM = String(cur.getMonth() + 1).padStart(2, '0');
    const newD = String(cur.getDate()).padStart(2, '0');
    onChangeDate(`${newY}-${newM}-${newD}`);
  };

  const handleToday = () => {
    const now = new Date();
    const newY = now.getFullYear();
    const newM = String(now.getMonth() + 1).padStart(2, '0');
    const newD = String(now.getDate()).padStart(2, '0');
    onChangeDate(`${newY}-${newM}-${newD}`);
  };

  return (
    <header className="glass-maroon-card rounded-3xl p-4 sm:p-5 mb-5 shadow-2xl border border-rose-500/25 transition-all">
      {/* Top Bar: Brand, Identity Chips, & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Identity */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={`Logo ${settings.boothName}`}
                className="w-12 h-12 object-contain rounded-2xl border border-rose-400/30 bg-[#1e0309] p-1.5 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-800 via-rose-700 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 border border-rose-400/30 shrink-0">
                <Camera className="w-6 h-6 text-rose-100" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {settings.boothName}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700/40">
                  <Sparkles className="w-2.5 h-2.5 text-rose-400" /> Station Active
                </span>
              </div>
              <p className="text-xs text-rose-300/70">
                Sistem Laporan Photobooth Harian & Analisis Bulanan
              </p>
            </div>
          </div>

          {/* Metadata Chips */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-rose-200/80 font-medium">
            <span className="inline-flex items-center gap-1.5 bg-[#1b0308]/80 text-rose-200 px-2.5 py-1 rounded-xl font-semibold border border-rose-500/25">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              {dateStr}
            </span>
            <span className="text-rose-500/40 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 bg-[#1b0308]/80 text-rose-200 px-2.5 py-1 rounded-xl border border-rose-500/25">
              <User className="w-3.5 h-3.5 text-rose-400" />
              <span>Kasir: <strong className="text-white font-semibold">{settings.attendantName}</strong></span>
            </span>
            <span className="text-rose-500/40 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 bg-rose-950/60 text-rose-300 px-2.5 py-1 rounded-xl border border-rose-700/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Akun: {loggedInUser}</span>
            </span>
            <span className="text-rose-500/40 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={onResyncFirebase}
              disabled={isResyncing}
              title="Klik untuk singkronkan ulang seluruh database Firebase sekarang"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold cursor-pointer transition hover:opacity-90 active:scale-95 ${
                syncStatus === 'synced'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                  : syncStatus === 'syncing' || isResyncing
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-700/40 hover:bg-rose-900/60'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResyncing || syncStatus === 'syncing' ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
              <span className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' && !isResyncing
                  ? 'bg-emerald-400 animate-pulse'
                  : syncStatus === 'syncing' || isResyncing
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-rose-400'
              }`} />
              <span>{isResyncing || syncStatus === 'syncing' ? 'Sinkron Firebase...' : syncStatus === 'offline' ? 'Offline (Klik Singkron)' : 'Firebase Realtime'}</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Manual Resync Database Button */}
          {onResyncFirebase && (
            <button
              type="button"
              onClick={onResyncFirebase}
              disabled={isResyncing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 hover:text-white text-xs sm:text-sm font-semibold rounded-xl border border-emerald-500/40 shadow-md shadow-emerald-950/50 transition cursor-pointer active:scale-95 disabled:opacity-50"
              title="Singkronkan ulang seluruh data laporan & pengaturan ke Firebase Firestore"
              aria-label="Singkronkan Ulang Firebase"
            >
              <RefreshCw className={`w-4 h-4 ${isResyncing ? 'animate-spin text-emerald-400' : 'text-emerald-300'}`} />
              <span className="hidden sm:inline">{isResyncing ? 'Menyinkronkan...' : 'Singkronkan Database'}</span>
            </button>
          )}

          {/* Bagikan PDF Button (Primary action for mobile/HP) */}
          <button
            onClick={onSharePdf}
            disabled={isSharingPdf || isGeneratingPdf}
            className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500 hover:from-rose-600 hover:to-rose-400 active:from-rose-800 disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-rose-950/60 border border-rose-400/30 transition cursor-pointer active:scale-95"
            title={viewMode === 'daily' ? 'Bagikan Berkas PDF Laporan Harian (WhatsApp / Aplikasi HP)' : 'Bagikan Berkas PDF Laporan Bulanan'}
            aria-label="Bagikan Dokumen PDF"
          >
            <Share2 className={`w-4 h-4 text-rose-100 ${isSharingPdf ? 'animate-pulse' : ''}`} />
            <span>
              {isSharingPdf
                ? 'Membagikan...'
                : viewMode === 'daily'
                ? 'Bagikan PDF'
                : 'Bagikan Rekap PDF'}
            </span>
          </button>

          {/* Unduh PDF Button */}
          <button
            onClick={onExportPdf}
            disabled={isGeneratingPdf || isSharingPdf}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#1b0308]/90 hover:bg-[#2c050f] active:bg-[#150206] disabled:opacity-50 text-rose-200 hover:text-white text-xs sm:text-sm font-semibold rounded-xl border border-rose-500/30 transition cursor-pointer"
            title={viewMode === 'daily' ? 'Unduh Berkas PDF Harian ke Penyimpanan' : 'Unduh Berkas PDF Bulanan'}
            aria-label="Unduh Dokumen PDF"
          >
            <FileDown className="w-4 h-4 text-rose-300" />
            <span className="hidden sm:inline">
              {isGeneratingPdf ? 'Mengunduh...' : 'Unduh PDF'}
            </span>
          </button>

          {/* Send WhatsApp (Daily mode) */}
          {viewMode === 'daily' && (
            <button
              onClick={onOpenWhatsAppModal}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 hover:text-white text-xs sm:text-sm font-bold rounded-xl shadow-md border border-emerald-500/30 transition cursor-pointer"
              title="Kirim ringkasan laporan ke WhatsApp Owner"
              aria-label="Kirim ke WhatsApp"
            >
              <Send className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Kirim WA</span>
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#1b0308]/90 hover:bg-[#28050e] text-rose-200 text-xs sm:text-sm font-semibold rounded-xl border border-rose-500/25 transition cursor-pointer"
            title="Atur data booth, logo, kasir, dan nomor owner"
            aria-label="Pengaturan Photobooth"
          >
            <SettingsIcon className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>

          {/* Lock App / Logout */}
          {onLogout && (
            <button
              id="logout-button"
              data-testid="logout-button"
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 text-xs sm:text-sm font-semibold rounded-xl border border-rose-500/30 transition cursor-pointer"
              title="Kunci Aplikasi / Keluar Akun (Lock App)"
              aria-label="Keluar / Lock App"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Keluar / Lock App</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar: Mode Toggle & Date Picker */}
      <div className="mt-4 pt-3.5 border-t border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Daily vs Monthly Mode Toggle */}
        <div className="flex items-center bg-[#150206]/90 p-1 rounded-2xl border border-rose-500/25 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onToggleViewMode('daily')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-md shadow-rose-950/60 border border-rose-400/40'
                : 'text-rose-300/70 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Laporan Harian</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleViewMode('monthly')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'monthly'
                ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-md shadow-rose-950/60 border border-rose-400/40'
                : 'text-rose-300/70 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Rekap & Tren Bulanan</span>
          </button>
        </div>

        {/* Date Selector in Daily mode */}
        {viewMode === 'daily' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-rose-300/60 uppercase tracking-wider hidden sm:inline">
              Pilih Tanggal:
            </span>
            <div className="flex items-center bg-[#150206]/90 border border-rose-500/25 rounded-2xl p-1">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-rose-900/40 text-rose-300 rounded-lg transition cursor-pointer"
                title="Hari sebelumnya"
                aria-label="Hari sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onChangeDate(e.target.value)}
                className="px-2 py-0.5 text-xs font-bold text-rose-100 bg-transparent focus:outline-none cursor-pointer"
              />

              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 hover:bg-rose-900/40 text-rose-300 rounded-lg transition cursor-pointer"
                title="Hari berikutnya"
                aria-label="Hari berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/30 text-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Hari Ini
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Palette, Plus, Trash2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import {
  CustomFrameQueueItem,
  CustomFrameStatus,
  CUSTOM_FRAME_STATUS_CONFIG,
} from '../utils/reportLogic';

interface CustomFrameQueueSectionProps {
  queue: CustomFrameQueueItem[];
  onAddQueueItem: (clientName: string, theme: string, notes?: string) => void;
  onUpdateStatus: (id: string, status: CustomFrameStatus) => void;
  onRemoveQueueItem: (id: string) => void;
}

const COMMON_THEMES = [
  'Wedding Pastel Floral',
  'Y2K Cyberpunk Pink',
  'Black & Gold Elegant',
  'Birthday Neon Vibrant',
  'Vintage Newspaper',
  'Minimalist Monochrome',
];

export const CustomFrameQueueSection: React.FC<CustomFrameQueueSectionProps> = ({
  queue,
  onAddQueueItem,
  onUpdateStatus,
  onRemoveQueueItem,
}) => {
  const [clientName, setClientName] = useState('');
  const [theme, setTheme] = useState('');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !theme.trim()) return;
    onAddQueueItem(clientName.trim(), theme.trim(), notes.trim() || undefined);
    setClientName('');
    setTheme('');
    setNotes('');
  };

  const activeCount = queue.filter((item) => item.status !== 'Selesai').length;
  const filteredList = queue.filter((item) => {
    if (filter === 'active') return item.status !== 'Selesai';
    if (filter === 'done') return item.status === 'Selesai';
    return true;
  });

  const nextStatusMap: Record<CustomFrameStatus, CustomFrameStatus> = {
    Antri: 'Proses Desain',
    'Proses Desain': 'Siap Cetak',
    'Siap Cetak': 'Selesai',
    Selesai: 'Antri',
  };

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full mt-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-300 flex items-center justify-center shadow-inner">
            <Palette className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Antrian Custom Frame</h2>
            <p className="text-xs text-rose-300/60">Request tema, desain khusus strip, atau overlay klien</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 font-extrabold text-xs rounded-full border ${
              activeCount > 0
                ? 'bg-rose-950/80 text-rose-300 border-rose-600/40'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
            }`}
          >
            {activeCount > 0 ? `${activeCount} Sedang Diproses` : 'Semua Selesai'}
          </span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label htmlFor="custom-client-name" className="block text-[11px] font-bold text-rose-300/70 uppercase tracking-wider mb-1">
              Nama Klien / Acara
            </label>
            <input
              id="custom-client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Contoh: Sweet 17th Jessica / Klien VIP"
              className="w-full px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 transition"
              required
            />
          </div>

          <div>
            <label htmlFor="custom-theme-name" className="block text-[11px] font-bold text-rose-300/70 uppercase tracking-wider mb-1">
              Tema / Konsep Desain
            </label>
            <input
              id="custom-theme-name"
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Contoh: Y2K Pink Ribbon / Gold Gatsby"
              className="w-full px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 transition font-medium"
              required
            />
          </div>
        </div>

        {/* Quick Theme suggestions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-rose-300/60 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            Tema Populer:
          </span>
          {COMMON_THEMES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTheme(item)}
              className="px-2 py-0.5 text-[11px] font-bold bg-[#1b0308]/80 hover:bg-rose-950/80 border border-rose-500/20 text-rose-200 rounded-lg transition cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="custom-frame-notes" className="block text-[11px] font-bold text-rose-300/70 uppercase tracking-wider mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            id="custom-frame-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Tambah logo perusahaan di pojok kanan bawah, font Serif"
            className="w-full px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-rose-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-950/50 border border-rose-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Antrian Custom Frame</span>
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pb-2 mb-2 text-xs">
        <div className="flex items-center gap-1 bg-[#150206]/80 border border-rose-500/25 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-rose-300/70 hover:text-white'
            }`}
          >
            Semua ({queue.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filter === 'active'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-rose-300/70 hover:text-white'
            }`}
          >
            Proses ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('done')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filter === 'done'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-rose-300/70 hover:text-white'
            }`}
          >
            Selesai ({queue.length - activeCount})
          </button>
        </div>
      </div>

      {/* List of Custom Frame Items */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
          {filteredList.length === 0 ? (
            <div className="py-7 text-center text-rose-300/50 text-xs border border-dashed border-rose-500/20 rounded-2xl bg-[#160206]/50 flex flex-col items-center justify-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-rose-400/40" />
              <span>Tidak ada antrian custom frame pada filter ini.</span>
            </div>
          ) : (
            filteredList.map((item) => {
              const config = CUSTOM_FRAME_STATUS_CONFIG[item.status];
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    item.status === 'Selesai'
                      ? 'bg-[#180308]/60 border-rose-500/20 opacity-80'
                      : 'bg-[#1e040b]/80 border-rose-500/25 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">{item.clientName}</span>
                        {item.time && (
                          <span className="text-[10px] text-rose-300/60 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-rose-300 mt-0.5 flex items-center gap-1">
                        <span>🎨</span>
                        <span>{item.theme}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(item.id, nextStatusMap[item.status])}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${config.bgClass} ${config.textClass} ${config.borderClass} hover:opacity-85`}
                        title="Klik untuk mengubah status pengerjaan"
                        aria-label={`Ubah status ${item.clientName}`}
                      >
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveQueueItem(item.id)}
                        className="p-1.5 text-rose-400/50 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                        title={`Hapus antrian ${item.clientName}`}
                        aria-label={`Hapus antrian ${item.clientName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="text-[11px] bg-[#140206]/80 text-rose-200/80 px-2.5 py-1.5 rounded-xl border border-rose-500/20 mt-1.5">
                      <span className="font-bold text-rose-300/70">Catatan: </span>
                      {item.notes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

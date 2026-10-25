import React from 'react';
import { FileEdit, Sparkles } from 'lucide-react';

interface NotesSectionProps {
  notes: string;
  onChangeNotes: (val: string) => void;
}

const QUICK_TAGS = [
  'Event ramai pengunjung lancar',
  'Pengunjung puas dengan template foto',
  'Antrean tertib, tidak ada delay cetak',
  'Perlu tambahan properti / aksesoris baru',
  'Area venue cukup panas, kipas booth membantu',
];

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onChangeNotes,
}) => {
  const handleAddQuickTag = (tag: string) => {
    if (!notes.trim()) {
      onChangeNotes(tag);
    } else {
      onChangeNotes(`${notes.trim()}\n- ${tag}`);
    }
  };

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-300 flex items-center justify-center shadow-inner">
            <FileEdit className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Catatan Kegiatan Hari Ini</h2>
            <p className="text-xs text-rose-300/60">Rangkuman umum, brief acara, atau evaluasi shift</p>
          </div>
        </div>
      </div>

      {/* Quick Suggestions / Chips */}
      <div className="mb-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-bold text-rose-300/60 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-rose-400" />
          Ide Catatan:
        </span>
        {QUICK_TAGS.map((tag, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAddQuickTag(tag)}
            className="text-[11px] font-bold bg-[#1b0308]/80 hover:bg-rose-950/80 border border-rose-500/20 text-rose-200 px-2.5 py-0.5 rounded-lg transition cursor-pointer"
          >
            + {tag}
          </button>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={(e) => onChangeNotes(e.target.value)}
        rows={5}
        placeholder="Tuliskan catatan umum operasional hari ini, kondisi cuaca venue, respons klien/pengunjung, atau serah terima shift..."
        className="w-full flex-1 p-3.5 text-sm glass-maroon-input rounded-2xl text-white placeholder:text-rose-400/30 transition resize-none leading-relaxed"
      />
    </section>
  );
};

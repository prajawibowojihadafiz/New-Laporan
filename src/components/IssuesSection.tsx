import React, { useState } from 'react';
import { AlertTriangle, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Issue } from '../utils/reportLogic';

interface IssuesSectionProps {
  issues: Issue[];
  onAddIssue: (text: string) => void;
  onRemoveIssue: (id: string) => void;
}

export const IssuesSection: React.FC<IssuesSectionProps> = ({
  issues,
  onAddIssue,
  onRemoveIssue,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddIssue(inputText.trim());
    setInputText('');
  };

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Kendala Hari Ini</h2>
            <p className="text-xs text-rose-300/60">Masalah teknis, perangkat, atau lokasi</p>
          </div>
        </div>
        <div>
          <span
            className={`px-3 py-1 font-extrabold text-xs rounded-full border ${
              issues.length > 0
                ? 'bg-amber-950/80 text-amber-300 border-amber-600/40'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
            }`}
          >
            {issues.length > 0 ? `${issues.length} Kendala` : 'Aman'}
          </span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis 1 kalimat kendala (misal: kertas sempat macet jam 14.00)..."
          className="flex-1 px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 transition"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 active:from-amber-800 text-white font-bold text-sm rounded-xl shadow-md border border-amber-400/30 transition flex items-center gap-1 shrink-0 cursor-pointer"
          title="Tambah kendala"
          aria-label="Tambah kendala"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </form>

      {/* Issues List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
          {issues.length === 0 ? (
            <div className="py-6 text-center text-emerald-300 bg-emerald-950/40 border border-emerald-600/30 rounded-2xl flex flex-col items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <p className="text-xs font-bold">Alhamdulillah, tidak ada kendala operasional hari ini.</p>
            </div>
          ) : (
            issues.map((iss) => {
              const isAuto = Boolean(iss.autoSource);
              return (
                <div
                  key={iss.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs sm:text-sm transition ${
                    isAuto
                      ? 'bg-rose-950/70 border-rose-500/35'
                      : 'bg-amber-950/70 border-amber-500/35'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <span className="mt-0.5 shrink-0">
                      {isAuto ? '⚙️' : '⚠️'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-white break-words">{iss.text}</p>
                      {isAuto && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                          Otomatis dari Checklist Booth
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveIssue(iss.id)}
                    className="p-1.5 text-rose-400/50 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition shrink-0 cursor-pointer"
                    title="Hapus kendala"
                    aria-label={`Hapus kendala ${iss.text}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

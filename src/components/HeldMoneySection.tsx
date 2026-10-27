import React, { useState } from 'react';
import { Hourglass, Plus, Trash2, CheckCircle2, Clock, Check, AlertCircle } from 'lucide-react';
import {
  HeldMoneyItem,
  formatRupiah,
  parseRupiahInput,
  calculatePendingHeldMoney,
  calculateTotalHeldMoney,
} from '../utils/reportLogic';

interface HeldMoneySectionProps {
  heldMoneys: HeldMoneyItem[];
  onAddHeldMoney: (amount: number, reason: string) => void;
  onToggleStatus: (id: string) => void;
  onRemoveHeldMoney: (id: string) => void;
}

const QUICK_AMOUNTS = [25000, 50000, 75000, 100000, 150000];

const COMMON_REASONS = [
  'QRIS Pending',
  'Transfer Pending',
  'EDC Belum Cair',
  'Selisih Kasir',
  'Kembalian Tertahan',
];

export const HeldMoneySection: React.FC<HeldMoneySectionProps> = ({
  heldMoneys,
  onAddHeldMoney,
  onToggleStatus,
  onRemoveHeldMoney,
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingTotal = calculatePendingHeldMoney(heldMoneys);
  const totalHeld = calculateTotalHeldMoney(heldMoneys);
  const pendingCount = heldMoneys.filter((h) => h.status !== 'Selesai').length;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const rawVal = e.target.value;
    const num = parseRupiahInput(rawVal);
    if (num === 0 && rawVal === '') {
      setAmountInput('');
    } else {
      setAmountInput(num.toLocaleString('id-ID'));
    }
  };

  const handleSelectQuickAmount = (amount: number) => {
    setErrorMessage(null);
    setAmountInput(amount.toLocaleString('id-ID'));
  };

  const handleSelectReason = (r: string) => {
    setReason(r);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseRupiahInput(amountInput);

    if (amount <= 0) {
      setErrorMessage('Silakan isi nominal uang tertahan terlebih dahulu.');
      return;
    }

    const finalReason = reason.trim() || 'Uang Tertahan (Pending Mutasi/Kas)';
    onAddHeldMoney(amount, finalReason);

    setAmountInput('');
    setReason('');
    setErrorMessage(null);
  };

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-amber-500/25 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-amber-500/35 text-amber-400 flex items-center justify-center shadow-inner">
            <Hourglass className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Uang Tertahan
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </h2>
            <p className="text-xs text-rose-300/60">Pending QRIS/EDC, transfer belum masuk, atau selisih kas</p>
          </div>
        </div>
        <div>
          <span
            className={`px-3 py-1 font-extrabold text-xs rounded-full border ${
              pendingCount > 0
                ? 'bg-amber-950/80 text-amber-300 border-amber-600/50 shadow-sm'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
            }`}
          >
            {pendingCount > 0 ? `${formatRupiah(pendingTotal)} (${pendingCount} Tertahan)` : 'Tidak Ada'}
          </span>
        </div>
      </div>

      {/* Form Input Uang Tertahan */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4 bg-[#140206]/80 p-3.5 rounded-2xl border border-rose-500/20">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Input Nominal */}
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-rose-300/80 mb-1">
              Nominal Uang
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-rose-300/60 pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountInput}
                onChange={handleAmountChange}
                placeholder="50.000"
                className="w-full pl-9 pr-3 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 font-semibold focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Input Keterangan / Alasan */}
          <div className="sm:col-span-7">
            <label className="block text-[11px] font-bold text-rose-300/80 mb-1">
              Keterangan / Alasan
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: QRIS BCA belum masuk mutasi..."
              className="w-full px-3 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 transition"
            />
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-rose-400/70 font-semibold mr-1">Nominal Cepat:</span>
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleSelectQuickAmount(amt)}
              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-[#24040b] text-amber-200 border border-amber-500/30 hover:bg-amber-950/80 hover:border-amber-400 active:scale-95 transition cursor-pointer"
            >
              +{amt / 1000}rb
            </button>
          ))}
        </div>

        {/* Quick Reason Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-rose-400/70 font-semibold mr-1">Alasan Cepat:</span>
          {COMMON_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleSelectReason(r)}
              className={`px-2 py-0.5 text-[10px] rounded-lg border transition cursor-pointer active:scale-95 ${
                reason === r
                  ? 'bg-amber-600 text-slate-950 font-extrabold border-amber-400'
                  : 'bg-[#1b0308] text-rose-200 border-rose-500/25 hover:border-rose-400/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Error Notification if any */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border border-amber-300/50 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Catat Uang Tertahan</span>
          </button>
        </div>
      </form>

      {/* Daftar Uang Tertahan */}
      <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
        {heldMoneys.length === 0 ? (
          <div className="py-5 text-center text-emerald-300 bg-emerald-950/30 border border-emerald-600/30 rounded-2xl flex flex-col items-center justify-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-xs font-bold">Semua kas & mutasi pembayaran lancar (tidak ada uang tertahan).</p>
          </div>
        ) : (
          heldMoneys.map((item) => {
            const isResolved = item.status === 'Selesai';
            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2.5 ${
                  isResolved
                    ? 'bg-emerald-950/30 border-emerald-600/30 text-emerald-200'
                    : 'bg-[#1e0309] border-amber-500/35 text-white'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isResolved
                        ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isResolved ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-extrabold ${
                          isResolved ? 'line-through text-slate-400' : 'text-amber-300'
                        }`}
                      >
                        {formatRupiah(item.amount)}
                      </span>
                      {item.time && (
                        <span className="text-[10px] text-rose-300/60 bg-[#160206] px-1.5 py-0.5 rounded border border-rose-500/20">
                          {item.time}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 break-words ${isResolved ? 'text-slate-400' : 'text-rose-100'}`}>
                      {item.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Toggle Status Button */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                      isResolved
                        ? 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border-emerald-500/40'
                        : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-500/40'
                    }`}
                    title={isResolved ? 'Kembalikan ke status Tertahan' : 'Tandai sudah cair / masuk kas'}
                  >
                    {isResolved ? 'Sudah Cair' : 'Tertahan'}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveHeldMoney(item.id)}
                    className="p-1.5 text-rose-400/50 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition shrink-0 cursor-pointer"
                    title="Hapus catatan uang tertahan"
                    aria-label={`Hapus ${formatRupiah(item.amount)}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ringkasan Bawah jika ada data */}
      {heldMoneys.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-300/75">
          <span>
            Total Tercatat: <strong className="text-white font-bold">{formatRupiah(totalHeld)}</strong>
          </span>
          <span className="text-amber-300 font-bold">
            Sisa Tertahan: {formatRupiah(pendingTotal)}
          </span>
        </div>
      )}
    </section>
  );
};

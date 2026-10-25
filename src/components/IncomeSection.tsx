import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, CreditCard, Banknote, QrCode, Smartphone } from 'lucide-react';
import { Income, calculateTotalIncome, formatRupiah, parseRupiahInput } from '../utils/reportLogic';

interface IncomeSectionProps {
  incomes: Income[];
  onAddIncome: (source: string, amount: number) => void;
  onRemoveIncome: (id: string) => void;
}

const COMMON_SOURCES = [
  { id: 'Cash', label: 'Cash / Tunai', icon: Banknote },
  { id: 'QRIS', label: 'QRIS', icon: QrCode },
  { id: 'Transfer BCA', label: 'Transfer BCA', icon: CreditCard },
  { id: 'Transfer Mandiri', label: 'Transfer Mandiri', icon: CreditCard },
  { id: 'DANA', label: 'DANA', icon: Smartphone },
  { id: 'GoPay / OVO', label: 'GoPay / OVO', icon: Smartphone },
  { id: 'Lainnya', label: 'Lainnya', icon: DollarSign },
];

export const IncomeSection: React.FC<IncomeSectionProps> = ({
  incomes,
  onAddIncome,
  onRemoveIncome,
}) => {
  const [source, setSource] = useState('QRIS');
  const [customSource, setCustomSource] = useState('');
  const [amountInput, setAmountInput] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numeric = parseRupiahInput(rawVal);
    if (numeric === 0 && rawVal === '') {
      setAmountInput('');
    } else {
      setAmountInput(numeric.toLocaleString('id-ID'));
    }
  };

  const handleQuickAddNominal = (addon: number) => {
    const current = parseRupiahInput(amountInput);
    const updated = current + addon;
    setAmountInput(updated.toLocaleString('id-ID'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSource = source === 'Lainnya' ? (customSource.trim() || 'Lainnya') : source;
    const numericAmount = parseRupiahInput(amountInput);
    if (!finalSource || numericAmount <= 0) return;

    onAddIncome(finalSource, numericAmount);
    setAmountInput('');
    if (source === 'Lainnya') setCustomSource('');
  };

  const totalIncome = calculateTotalIncome(incomes);

  return (
    <section className="glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Pemasukan Hari Ini</h2>
            <p className="text-xs text-rose-300/60">Cash, QRIS, & Transfer</p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 text-emerald-300 font-extrabold text-xs rounded-full border border-emerald-600/40">
            Total: {formatRupiah(totalIncome)}
          </span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div>
          <label className="block text-[11px] font-bold text-rose-300/70 uppercase tracking-wider mb-1.5">
            Sumber Pembayaran
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-2">
            {COMMON_SOURCES.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSource(item.id)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition text-center cursor-pointer ${
                  source === item.id
                    ? 'bg-rose-700 border-rose-500 text-white shadow-md shadow-rose-950/60'
                    : 'bg-[#1b0308]/80 hover:bg-rose-950/70 border-rose-500/20 text-rose-200'
                }`}
              >
                {item.id}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {COMMON_SOURCES.slice(4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSource(item.id)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition text-center cursor-pointer ${
                  source === item.id
                    ? 'bg-rose-700 border-rose-500 text-white shadow-md shadow-rose-950/60'
                    : 'bg-[#1b0308]/80 hover:bg-rose-950/70 border-rose-500/20 text-rose-200'
                }`}
              >
                {item.id}
              </button>
            ))}
          </div>

          {source === 'Lainnya' && (
            <input
              type="text"
              value={customSource}
              onChange={(e) => setCustomSource(e.target.value)}
              placeholder="Tuliskan nama metode (misal: ShopeePay / Voucher)"
              className="mt-2 w-full px-3.5 py-2 text-sm glass-maroon-input rounded-xl text-white placeholder:text-rose-400/30 font-medium"
              required
            />
          )}
        </div>

        <div>
          <label htmlFor="income-amount" className="block text-[11px] font-bold text-rose-300/70 uppercase tracking-wider mb-1">
            Nominal Pemasukan (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-400">Rp</span>
            <input
              id="income-amount"
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={handleAmountChange}
              placeholder="150.000"
              className="w-full pl-10 pr-3.5 py-2 text-sm glass-maroon-input rounded-xl font-bold text-emerald-300 placeholder:text-rose-400/30"
              required
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-rose-300/60 font-medium mr-1">Nominal:</span>
          {[35000, 50000, 75000, 100000, 250000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickAddNominal(val)}
              className="px-2 py-0.5 text-xs font-bold bg-[#1b0308]/80 hover:bg-rose-950/80 border border-rose-500/20 text-rose-200 rounded-lg transition cursor-pointer"
            >
              +{val >= 1000 ? `${val / 1000}rb` : val}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmountInput('')}
            className="px-2 py-0.5 text-xs text-rose-400 hover:text-rose-200 transition cursor-pointer"
          >
            Clear
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 active:from-emerald-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pemasukan</span>
        </button>
      </form>

      {/* Incomes List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between text-xs text-rose-300/60 font-semibold mb-2 px-1">
          <span>Metode / Sumber ({incomes.length})</span>
          <span>Jumlah Nominal</span>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
          {incomes.length === 0 ? (
            <div className="py-8 text-center text-rose-300/50 text-xs border border-dashed border-rose-500/20 rounded-2xl bg-[#160206]/50">
              Belum ada pemasukan yang dicatat hari ini.
            </div>
          ) : (
            incomes.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between p-3 bg-[#1b0308]/70 hover:bg-[#25050e]/80 border border-rose-500/20 rounded-2xl transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                    Rp
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{inc.source}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-black text-emerald-400">
                    {formatRupiah(inc.amount)}
                  </span>
                  <button
                    onClick={() => onRemoveIncome(inc.id)}
                    className="p-1.5 text-rose-400/50 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                    title={`Hapus pemasukan ${inc.source}`}
                    aria-label={`Hapus pemasukan ${inc.source}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

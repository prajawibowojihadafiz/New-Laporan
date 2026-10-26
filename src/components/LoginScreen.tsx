import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Camera, ArrowRight, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { verifyTripleCredentials, AUTH_CREDENTIALS } from '../utils/auth';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
  logoUrl?: string;
  boothName?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  logoUrl,
  boothName = 'Meraya.id Photobooth',
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const isValid = verifyTripleCredentials(username, password, pin);
      if (isValid) {
        onLoginSuccess(username.trim() || AUTH_CREDENTIALS.id);
      } else {
        setErrorMsg('ID, Password, atau PIN tidak valid! Silakan periksa kembali.');
        setIsShaking(true);
        setIsLoading(false);
        setTimeout(() => setIsShaking(false), 500);
      }
    }, 300);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
  };

  return (
    <div className="min-h-screen bg-[#0f0205] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 text-rose-100 selection:bg-rose-600 selection:text-white">
      {/* Ambient Glass Maroon Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-900/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-red-950/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-rose-950/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card container */}
      <div
        className={`relative w-full max-w-md glass-maroon-card rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/70 border border-rose-500/25 transition-transform duration-300 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-800 via-rose-700 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 mb-3.5 overflow-hidden border border-rose-400/30 p-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Camera className="w-8 h-8 text-rose-100" />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/40 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Portal Operasional & Kasir Terproteksi</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {boothName}
          </h1>
          <p className="text-xs text-rose-200/70 mt-1 max-w-xs mx-auto leading-relaxed">
            Silakan masukkan ID, Password, dan PIN keamanan Anda untuk masuk ke sistem
          </p>
        </div>

        {/* Error Notification (Safe - Does not leak secret PIN) */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/90 border border-rose-500/60 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* 3-Tier Login Form (PIN is completely hidden and protected) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. ID / Username */}
          <div>
            <label htmlFor="login-id" className="block text-[11px] font-bold text-rose-300/80 uppercase tracking-wider mb-1.5">
              ID / Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400/60">
                <User className="w-4 h-4" />
              </span>
              <input
                id="login-id"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan ID Anda"
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-maroon-input rounded-xl focus:border-rose-400 font-semibold transition placeholder:text-rose-400/30 text-white"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* 2. Password */}
          <div>
            <label htmlFor="login-password" className="block text-[11px] font-bold text-rose-300/80 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400/60">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full pl-10 pr-10 py-2.5 text-sm glass-maroon-input rounded-xl focus:border-rose-400 font-semibold transition placeholder:text-rose-400/30 text-white"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-400/60 hover:text-rose-200 transition cursor-pointer"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. PIN (4 Digit) - Secret, no visible value hint */}
          <div>
            <label htmlFor="login-pin" className="block text-[11px] font-bold text-rose-300/80 uppercase tracking-wider mb-1.5">
              PIN Keamanan (4 Digit)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400/60">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="login-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-maroon-input rounded-xl focus:border-rose-400 font-black tracking-widest text-center transition placeholder:text-rose-400/30 text-white"
                required
                autoComplete="one-time-code"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 active:from-rose-800 active:to-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-950/60 border border-rose-400/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Security badge (Protected - Never reveals the secret PIN value) */}
        <div className="mt-6 pt-3.5 border-t border-rose-500/20 text-center flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-300/80">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Sistem Keamanan Meraya.id • Terproteksi PIN Pribadi</span>
          </div>
          <p className="text-[10px] text-rose-400/50">
            Sesi aktif tersimpan secara aman di browser perangkat Anda
          </p>
        </div>
      </div>
    </div>
  );
};

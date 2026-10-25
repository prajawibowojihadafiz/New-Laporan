/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  FileText,
  TrendingUp,
  Settings as SettingsIcon,
  Palette,
  Sparkles,
  ArrowRight,
  Send,
  FileDown,
  Printer,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { OrdersSection } from './components/OrdersSection';
import { CustomFrameQueueSection } from './components/CustomFrameQueueSection';
import { IncomeSection } from './components/IncomeSection';
import { BoothChecklist } from './components/BoothChecklist';
import { StockChecklist } from './components/StockChecklist';
import { IssuesSection } from './components/IssuesSection';
import { PurchasesSection } from './components/PurchasesSection';
import { PhotoSection } from './components/PhotoSection';
import { NotesSection } from './components/NotesSection';
import { MonthlyOverviewSection } from './components/MonthlyOverviewSection';
import { SettingsModal } from './components/SettingsModal';
import { ResetAllModal } from './components/ResetAllModal';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { PdfReportTemplate } from './components/PdfReportTemplate';
import { PdfMonthlyReportTemplate } from './components/PdfMonthlyReportTemplate';
import { LoginScreen } from './components/LoginScreen';
import { LogoutModal } from './components/LogoutModal';
import { AUTH_STORAGE_KEY, clearAuthSession, setAuthSession } from './utils/auth';
import { exportReportToPdf } from './utils/pdfExport';
import {
  saveDayReportToFirestore,
  subscribeToAllReports,
  saveSettingsToFirestore,
  subscribeToSettings,
  resetAllFirestoreReports,
  forceResyncAllData,
} from './firebase';
import {
  Order,
  Income,
  Issue,
  PurchaseItem,
  CustomFrameQueueItem,
  CustomFrameStatus,
  BoothCondition,
  StockCondition,
  Settings,
  PhotoItem,
  DayReportData,
  StatusOKMasalah,
  StatusOKKurang,
  DEFAULT_SETTINGS,
  DEFAULT_BOOTH_CONDITION,
  DEFAULT_STOCK_CONDITION,
  calculateTotalPrints,
  calculateTotalIncome,
  formatDateIndonesian,
  formatRupiah,
  syncBoothIssues,
  syncStockPurchases,
  buildWhatsAppMessage,
  calculateMonthlySummary,
  generateRealisticMonthlyData,
} from './utils/reportLogic';

const STORAGE_KEY = 'photobooth_daily_report_v3';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [loggedInUser, setLoggedInUser] = useState<string>(() => {
    return localStorage.getItem(`${AUTH_STORAGE_KEY}_username`) || 'Meraya.id';
  });

  // Current Date & View Mode
  const todayKey = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [selectedMonth, setSelectedMonth] = useState<string>(todayKey.substring(0, 7));
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  // Settings
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  // Multi-day persistent store
  const [reportsMap, setReportsMap] = useState<Record<string, DayReportData>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reports_map`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) return parsed;
      } catch {}
    }

    // Initial realistic month seed so trend graphs immediately show data
    const initialToday: DayReportData = {
      date: todayKey,
      orders: [
        { id: 'sample-ord-1', clientName: 'Birthday Amanda (Paket Strip)', prints: 12, time: '13:40' },
        { id: 'sample-ord-2', clientName: 'Couple Photo Sarah & Reza', prints: 4, time: '15:15' },
      ],
      customFrames: [
        {
          id: 'sample-cf-1',
          clientName: 'Jessica & Kevin (Wedding)',
          theme: 'Minimalist Monochrome + Logo Strip',
          status: 'Proses Desain',
          notes: 'Gunakan font Script, sertakan monogram JK',
          time: '14:20',
        },
      ],
      incomes: [
        { id: 'sample-inc-1', source: 'QRIS', amount: 120000 },
        { id: 'sample-inc-2', source: 'Cash', amount: 50000 },
      ],
      boothCondition: DEFAULT_BOOTH_CONDITION,
      stockCondition: DEFAULT_STOCK_CONDITION,
      issues: [],
      purchases: [],
      photos: [],
      notes: 'Operasional booth berjalan tertib, ramai pengunjung dan antrean rapi.',
    };

    return generateRealisticMonthlyData(todayKey.substring(0, 7), todayKey, initialToday);
  });

  // Current active day data derived or created
  const currentDayData = useMemo<DayReportData>(() => {
    if (reportsMap[selectedDate]) {
      return reportsMap[selectedDate];
    }
    return {
      date: selectedDate,
      orders: [],
      customFrames: [],
      incomes: [],
      boothCondition: DEFAULT_BOOTH_CONDITION,
      stockCondition: DEFAULT_STOCK_CONDITION,
      issues: [],
      purchases: [],
      photos: [],
      notes: '',
    };
  }, [reportsMap, selectedDate]);

  // UI Modals & Loading states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isResyncing, setIsResyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const customFrameSectionRef = useRef<HTMLDivElement>(null);
  const pdfDailyTemplateRef = useRef<HTMLDivElement>(null);
  const pdfMonthlyTemplateRef = useRef<HTMLDivElement>(null);

  // Persistence to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reports_map`, JSON.stringify(reportsMap));
  }, [reportsMap]);

  // Real-time Firebase Cloud Synchronization
  useEffect(() => {
    // 1. Subscribe to all reports in real time from Firestore
    // When Cashier on mobile adds/updates an order or checklist, Laptop Owner sees it live!
    const unsubscribeReports = subscribeToAllReports(
      (remoteMap) => {
        if (remoteMap && Object.keys(remoteMap).length > 0) {
          setReportsMap((prev) => ({
            ...prev,
            ...remoteMap,
          }));
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.warn('Firebase sync status:', err);
        setSyncStatus('offline');
      }
    );

    // 2. Subscribe to booth settings from Firestore
    const unsubscribeSettings = subscribeToSettings(
      (remoteSettings) => {
        if (remoteSettings && remoteSettings.boothName) {
          setSettings((prev) => ({
            ...prev,
            ...remoteSettings,
          }));
        }
      },
      () => {
        // silent fallback to local settings
      }
    );

    return () => {
      unsubscribeReports();
      unsubscribeSettings();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Manual / Explicit Resync with Firebase Firestore
  const handleResyncFirebase = async () => {
    setIsResyncing(true);
    setSyncStatus('syncing');
    showToast('Menyinkronkan database dengan Firebase...');
    try {
      const res = await forceResyncAllData(reportsMap, settings);
      if (res.success) {
        setReportsMap(res.mergedReports);
        setSettings(res.mergedSettings);
        setSyncStatus('synced');
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.15 },
            colors: ['#10b981', '#f43f5e', '#ffffff'],
          });
        } catch {}
        showToast(
          `Database tersinkronkan! (${res.fetchedCount} data cloud termuat, ${res.pushedCount} data terunggah)`
        );
      } else {
        setSyncStatus('offline');
        showToast(`Gagal menyinkronkan: ${res.error || 'Periksa koneksi'}`);
      }
    } catch {
      setSyncStatus('offline');
      showToast('Gagal terhubung ke database cloud Firebase.');
    } finally {
      setIsResyncing(false);
    }
  };

  // Automatic initial background resync on startup
  useEffect(() => {
    forceResyncAllData(reportsMap, settings)
      .then((res) => {
        if (res.success) {
          setReportsMap(res.mergedReports);
          setSettings(res.mergedSettings);
          setSyncStatus('synced');
        }
      })
      .catch(() => {
        // Handled silently
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: string) => {
    setIsAuthenticated(true);
    setLoggedInUser(user);
    setAuthSession(user);
    showToast(`Selamat datang kembali di ${settings.boothName}!`);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
    showToast('Anda telah keluar dari sistem.');
  };

  // Helper to mutate current day's report and push in real-time to Firestore
  const updateCurrentDay = (updater: (prev: DayReportData) => DayReportData) => {
    setSyncStatus('syncing');
    setReportsMap((prevMap) => {
      const existing = prevMap[selectedDate] || {
        date: selectedDate,
        orders: [],
        customFrames: [],
        incomes: [],
        boothCondition: DEFAULT_BOOTH_CONDITION,
        stockCondition: DEFAULT_STOCK_CONDITION,
        issues: [],
        purchases: [],
        photos: [],
        notes: '',
      };
      const updated = updater(existing);

      // Asynchronously sync to Firebase Firestore for cross-device real-time sync
      saveDayReportToFirestore(updated)
        .then((ok) => {
          setSyncStatus(ok ? 'synced' : 'offline');
        })
        .catch(() => {
          setSyncStatus('offline');
        });

      return {
        ...prevMap,
        [selectedDate]: updated,
      };
    });
  };

  // Order Handlers
  const handleAddOrder = (clientName: string, prints: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientName,
      prints,
      time: timeStr,
    };
    updateCurrentDay((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));
    showToast(`Order "${clientName}" (${prints} print) ditambahkan!`);
  };

  const handleRemoveOrder = (id: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== id),
    }));
  };

  // Antrian Custom Frame Handlers
  const handleAddCustomFrame = (clientName: string, theme: string, notes?: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem: CustomFrameQueueItem = {
      id: `cf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientName,
      theme,
      status: 'Antri',
      notes,
      time: timeStr,
    };
    updateCurrentDay((prev) => ({
      ...prev,
      customFrames: [newItem, ...prev.customFrames],
    }));
    showToast(`Antrian custom frame "${clientName}" ditambahkan!`);
  };

  const handleUpdateCustomFrameStatus = (id: string, status: CustomFrameStatus) => {
    updateCurrentDay((prev) => ({
      ...prev,
      customFrames: prev.customFrames.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    }));
    showToast(`Status custom frame diubah ke: ${status}`);
  };

  const handleRemoveCustomFrame = (id: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      customFrames: prev.customFrames.filter((item) => item.id !== id),
    }));
  };

  // Income Handlers
  const handleAddIncome = (source: string, amount: number) => {
    const newIncome: Income = {
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      source,
      amount,
    };
    updateCurrentDay((prev) => ({
      ...prev,
      incomes: [newIncome, ...prev.incomes],
    }));
    showToast(`Pemasukan ${source} ditambahkan!`);
  };

  const handleRemoveIncome = (id: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((i) => i.id !== id),
    }));
  };

  // Booth Checklist Toggle & Auto Sync
  const handleToggleBooth = (key: keyof BoothCondition, status: StatusOKMasalah) => {
    updateCurrentDay((prev) => {
      const updatedBooth = { ...prev.boothCondition, [key]: status };
      const updatedIssues = syncBoothIssues(prev.issues, updatedBooth);
      return {
        ...prev,
        boothCondition: updatedBooth,
        issues: updatedIssues,
      };
    });
  };

  // Stock Checklist Toggle & Auto Sync
  const handleToggleStock = (key: keyof StockCondition, status: StatusOKKurang) => {
    updateCurrentDay((prev) => {
      const updatedStock = { ...prev.stockCondition, [key]: status };
      const updatedPurchases = syncStockPurchases(prev.purchases, updatedStock);
      return {
        ...prev,
        stockCondition: updatedStock,
        purchases: updatedPurchases,
      };
    });
  };

  // Issues Handlers
  const handleAddIssue = (text: string) => {
    const newIssue: Issue = {
      id: `issue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
    };
    updateCurrentDay((prev) => ({
      ...prev,
      issues: [newIssue, ...prev.issues],
    }));
    showToast('Kendala dicatat!');
  };

  const handleRemoveIssue = (id: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      issues: prev.issues.filter((i) => i.id !== id),
    }));
  };

  // Purchases Handlers
  const handleAddPurchase = (name: string, quantity: string) => {
    const newPurchase: PurchaseItem = {
      id: `pur-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      quantity,
    };
    updateCurrentDay((prev) => ({
      ...prev,
      purchases: [newPurchase, ...prev.purchases],
    }));
    showToast('Barang belanjaan ditambahkan!');
  };

  const handleRemovePurchase = (id: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      purchases: prev.purchases.filter((p) => p.id !== id),
    }));
  };

  // Photos Handlers
  const handleAddPhotos = (newPhotos: PhotoItem[]) => {
    updateCurrentDay((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
    showToast(`${newPhotos.length} foto berhasil diunggah!`);
  };

  const handleRemovePhoto = (id: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  };

  const handleNotesChange = (val: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      notes: val,
    }));
  };

  // Reset Data for Current Selected Day
  const handleOpenResetModal = () => {
    setIsSettingsOpen(false);
    setIsResetConfirmModalOpen(true);
  };

  const handleConfirmResetDay = () => {
    updateCurrentDay(() => ({
      date: selectedDate,
      orders: [],
      customFrames: [],
      incomes: [],
      boothCondition: DEFAULT_BOOTH_CONDITION,
      stockCondition: DEFAULT_STOCK_CONDITION,
      issues: [],
      purchases: [],
      photos: [],
      notes: '',
    }));
    setIsResetConfirmModalOpen(false);
    showToast('Data tanggal ini telah direset!');
  };

  // Reset ALL Data (Factory Reset: Local & Cloud Firebase)
  const handleOpenResetAllModal = () => {
    setIsSettingsOpen(false);
    setIsResetAllModalOpen(true);
  };

  const handleConfirmResetAll = async (options: { resetSettings: boolean }) => {
    setIsResettingAll(true);
    setSyncStatus('syncing');
    showToast('Sedang mereset seluruh data (Lokal & Cloud Firebase)...');

    try {
      // 1. Delete all reports from Firestore
      await resetAllFirestoreReports();

      // 2. Clear localStorage reports
      localStorage.removeItem(`${STORAGE_KEY}_reports_map`);

      // 3. Reset local state to a fresh blank report for today
      const freshToday: DayReportData = {
        date: todayKey,
        orders: [],
        customFrames: [],
        incomes: [],
        boothCondition: DEFAULT_BOOTH_CONDITION,
        stockCondition: DEFAULT_STOCK_CONDITION,
        issues: [],
        purchases: [],
        photos: [],
        notes: '',
      };
      setReportsMap({ [todayKey]: freshToday });
      setSelectedDate(todayKey);

      // 4. Optionally reset settings to default
      if (options.resetSettings) {
        localStorage.removeItem(`${STORAGE_KEY}_settings`);
        setSettings(DEFAULT_SETTINGS);
        await saveSettingsToFirestore(DEFAULT_SETTINGS);
      }

      setSyncStatus('synced');
      setIsResetAllModalOpen(false);
      showToast('Seluruh data berhasil direset bersih (Lokal & Cloud Firebase)!');
    } catch (error) {
      console.error('Reset all error:', error);
      showToast('Sebagian data lokal berhasil direset. Periksa koneksi cloud.');
      setIsResetAllModalOpen(false);
    } finally {
      setIsResettingAll(false);
    }
  };

  // Export Daily PDF
  const handleExportDailyPdf = async () => {
    if (!pdfDailyTemplateRef.current) return;
    setIsGeneratingPdf(true);
    showToast('Sedang membuat berkas PDF harian...');

    try {
      const filename = `Laporan_Harian_Photobooth_${selectedDate}.pdf`;
      const success = await exportReportToPdf(pdfDailyTemplateRef.current, filename);
      if (success) {
        showToast('PDF Harian berhasil diunduh!');
        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.2 } });
        } catch {}
      }
    } catch {
      showToast('Gagal membuat PDF otomatis, membuka jendela cetak...');
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export Monthly PDF with Chart
  const handleExportMonthlyPdf = async () => {
    if (!pdfMonthlyTemplateRef.current) return;
    setIsGeneratingPdf(true);
    showToast('Sedang membuat berkas PDF bulanan beserta grafik...');

    try {
      const filename = `Laporan_Bulanan_Photobooth_${selectedMonth}.pdf`;
      const success = await exportReportToPdf(pdfMonthlyTemplateRef.current, filename);
      if (success) {
        showToast('PDF Bulanan beserta grafik berhasil diunduh!');
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.2 } });
        } catch {}
      }
    } catch {
      showToast('Gagal membuat PDF otomatis, membuka jendela cetak...');
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Monthly summary calculations
  const monthlySummary = useMemo(() => {
    return calculateMonthlySummary(selectedMonth, reportsMap);
  }, [selectedMonth, reportsMap]);

  // WhatsApp Message for Current Date
  const dateStr = formatDateIndonesian(selectedDate);
  const waMessage = buildWhatsAppMessage({
    dateStr,
    settings,
    orders: currentDayData.orders,
    incomes: currentDayData.incomes,
    issues: currentDayData.issues,
    purchases: currentDayData.purchases,
    notes: currentDayData.notes,
    boothCondition: currentDayData.boothCondition,
    stockCondition: currentDayData.stockCondition,
    customFrames: currentDayData.customFrames,
  });

  const totalPrints = calculateTotalPrints(currentDayData.orders);
  const totalIncome = calculateTotalIncome(currentDayData.incomes);
  const lowStockCount = Object.values(currentDayData.stockCondition).filter((v) => v === 'Kurang').length;
  const boothIssuesCount = Object.values(currentDayData.boothCondition).filter((v) => v === 'Masalah').length;
  const hasIssues = boothIssuesCount > 0 || lowStockCount > 0 || currentDayData.issues.length > 0;

  // Scroll to custom frame
  const handleScrollToCustomFrame = () => {
    if (viewMode !== 'daily') setViewMode('daily');
    setTimeout(() => {
      customFrameSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Gate app behind login screen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        logoUrl={settings.logoUrl}
        boothName={settings.boothName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0205] text-rose-100 pb-24 selection:bg-rose-600 selection:text-white relative overflow-x-hidden">
      {/* Ambient Radial Mesh Gradients for Glass Maroon effect */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-rose-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-[500px] h-[500px] bg-red-950/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#1f040a]/95 text-rose-100 px-4 py-2.5 rounded-2xl shadow-2xl border border-rose-500/40 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in backdrop-blur-md">
          <span className="text-rose-400">🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        {/* Header with Date Picker, Mode Switch & Logout */}
        <Header
          dateStr={dateStr}
          selectedDate={selectedDate}
          onChangeDate={(newDate) => {
            setSelectedDate(newDate);
            const newMonth = newDate.substring(0, 7);
            if (newMonth !== selectedMonth) {
              setSelectedMonth(newMonth);
            }
          }}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          settings={settings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExportPdf={viewMode === 'daily' ? handleExportDailyPdf : handleExportMonthlyPdf}
          onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
          isGeneratingPdf={isGeneratingPdf}
          loggedInUser={loggedInUser}
          onLogout={handleLogout}
          syncStatus={syncStatus}
          onResyncFirebase={handleResyncFirebase}
          isResyncing={isResyncing}
        />

        {/* Hero Card: Inspired directly by "Current Limit / Welcome Back" Card in Reference Screens */}
        <div className="glass-maroon-hero rounded-3xl p-5 sm:p-6 mb-5 relative overflow-hidden shadow-2xl border border-rose-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">
                  {viewMode === 'daily' ? 'Pemasukan Kasir Hari Ini' : `Total Penjualan ${monthlySummary.monthName}`}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {viewMode === 'daily' ? formatRupiah(totalIncome) : formatRupiah(monthlySummary.totalIncome)}
                </h2>
              </div>
              <div className="flex items-center gap-2.5 mt-2 text-xs text-rose-200/80 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-[#1a0308]/80 px-2.5 py-1 rounded-xl border border-rose-500/25">
                  <Printer className="w-3.5 h-3.5 text-rose-400" />
                  <strong className="text-white font-bold">{viewMode === 'daily' ? totalPrints : monthlySummary.totalPrints}</strong> Print Biji
                </span>
                <span className="inline-flex items-center gap-1 bg-[#1a0308]/80 px-2.5 py-1 rounded-xl border border-rose-500/25">
                  <span className="text-rose-400 font-bold">#</span>
                  <strong className="text-white font-bold">{viewMode === 'daily' ? currentDayData.orders.length : monthlySummary.totalOrders}</strong> Transaksi
                </span>
                <span className="inline-flex items-center gap-1 bg-[#1a0308]/80 px-2.5 py-1 rounded-xl border border-rose-500/25">
                  {hasIssues ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Ada Perhatian
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Hero Quick Pill Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={viewMode === 'daily' ? handleExportDailyPdf : handleExportMonthlyPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-950/60 border border-rose-400/30 flex items-center gap-2 transition cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Memproses...' : 'Unduh PDF'}</span>
              </button>

              {viewMode === 'daily' && (
                <button
                  type="button"
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md border border-emerald-400/30 flex items-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  <span>Kirim WA</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode 1: LAPORAN HARIAN */}
        {viewMode === 'daily' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Quick Stats Bar for selected date */}
            <StatsBar
              totalOrders={currentDayData.orders.length}
              totalPrints={totalPrints}
              totalIncome={totalIncome}
              hasIssues={hasIssues}
              issuesCount={currentDayData.issues.length}
              lowStockCount={lowStockCount}
            />

            {/* Section Grid 1: Orderan & Pemasukan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <div className="flex flex-col">
                <OrdersSection
                  orders={currentDayData.orders}
                  onAddOrder={handleAddOrder}
                  onRemoveOrder={handleRemoveOrder}
                />

                {/* Antrian Custom Frame */}
                <div ref={customFrameSectionRef}>
                  <CustomFrameQueueSection
                    queue={currentDayData.customFrames}
                    onAddQueueItem={handleAddCustomFrame}
                    onUpdateStatus={handleUpdateCustomFrameStatus}
                    onRemoveQueueItem={handleRemoveCustomFrame}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <IncomeSection
                  incomes={currentDayData.incomes}
                  onAddIncome={handleAddIncome}
                  onRemoveIncome={handleRemoveIncome}
                />
              </div>
            </div>

            {/* Section Grid 2: Checklist Booth & Stok */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <BoothChecklist
                condition={currentDayData.boothCondition}
                onToggle={handleToggleBooth}
              />

              <StockChecklist
                condition={currentDayData.stockCondition}
                onToggle={handleToggleStock}
              />
            </div>

            {/* Section Grid 3: Kendala & Barang Belanja */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <IssuesSection
                issues={currentDayData.issues}
                onAddIssue={handleAddIssue}
                onRemoveIssue={handleRemoveIssue}
              />

              <PurchasesSection
                purchases={currentDayData.purchases}
                onAddPurchase={handleAddPurchase}
                onRemovePurchase={handleRemovePurchase}
              />
            </div>

            {/* Section Grid 4: Foto Kegiatan & Catatan Kegiatan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
              <PhotoSection
                photos={currentDayData.photos}
                onAddPhotos={handleAddPhotos}
                onRemovePhoto={handleRemovePhoto}
              />

              <NotesSection
                notes={currentDayData.notes}
                onChangeNotes={handleNotesChange}
              />
            </div>
          </div>
        )}

        {/* View Mode 2: LAPORAN & TREN BULANAN (DENGAN GRAFIK NAIK TURUN) */}
        {viewMode === 'monthly' && (
          <div className="animate-in fade-in duration-200">
            <MonthlyOverviewSection
              summary={monthlySummary}
              selectedMonth={selectedMonth}
              onChangeMonth={setSelectedMonth}
              onSelectDate={(clickedDate) => {
                setSelectedDate(clickedDate);
                setViewMode('daily');
                showToast(`Membuka laporan tanggal ${clickedDate}`);
              }}
              onExportMonthlyPdf={handleExportMonthlyPdf}
              isGeneratingPdf={isGeneratingPdf}
            />
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar: Inspired directly by reference app's bottom bar */}
      <nav
        aria-label="Navigasi Aplikasi"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass-maroon-card rounded-2xl p-1.5 z-40 border border-rose-500/25 shadow-2xl flex items-center justify-around backdrop-blur-2xl"
      >
        {/* Tab 1: Laporan Harian */}
        <button
          type="button"
          onClick={() => setViewMode('daily')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            viewMode === 'daily'
              ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-md border border-rose-400/30'
              : 'text-rose-300/60 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Harian</span>
        </button>

        {/* Tab 2: Rekap Bulanan */}
        <button
          type="button"
          onClick={() => setViewMode('monthly')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            viewMode === 'monthly'
              ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-md border border-rose-400/30'
              : 'text-rose-300/60 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Bulanan</span>
        </button>

        {/* Tab 3: Antrean Custom Frame */}
        <button
          type="button"
          onClick={handleScrollToCustomFrame}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-300/60 hover:text-white transition cursor-pointer"
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Antrean</span>
        </button>

        {/* Tab 4: Pengaturan */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-300/60 hover:text-white transition cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Pengaturan</span>
        </button>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          setSyncStatus('syncing');
          saveSettingsToFirestore(newSettings).then((ok) => {
            setSyncStatus(ok ? 'synced' : 'offline');
          });
          showToast('Pengaturan photobooth disimpan!');
        }}
        onResetDay={handleOpenResetModal}
        onResetAllData={handleOpenResetAllModal}
      />

      {/* Reset All Data (Factory Reset) Confirmation Modal */}
      <ResetAllModal
        isOpen={isResetAllModalOpen}
        onClose={() => setIsResetAllModalOpen(false)}
        onConfirmResetAll={handleConfirmResetAll}
        isResetting={isResettingAll}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        username={loggedInUser}
        boothName={settings.boothName}
      />

      {/* Reset Day In-App Confirmation Modal */}
      {isResetConfirmModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0103]/85 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm glass-maroon-card rounded-3xl shadow-2xl border border-rose-500/30 p-6 text-center animate-in zoom-in-95 text-rose-100">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3.5 shadow-inner">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-base font-black text-white">
              Reset Data {formatDateIndonesian(selectedDate)}?
            </h3>
            <p className="text-xs text-rose-300/70 mt-1.5 leading-relaxed">
              Orderan, pemasukan, antrean custom frame, dan catatan pada tanggal ini akan dibersihkan. Data tanggal lain dan pengaturan booth tetap tersimpan aman.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-rose-500/25 text-rose-200 font-semibold text-xs hover:bg-rose-950/60 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetDay}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/50 border border-rose-400/30 transition cursor-pointer"
              >
                Ya, Bersihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message Preview Modal */}
      <WhatsAppPreviewModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        messageText={waMessage}
        ownerPhone={settings.ownerPhone}
      />

      {/* Hidden PDF Printable Document Template - Daily */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none print:static print:left-0 print:top-0"
        style={{ width: '850px' }}
        aria-hidden="true"
      >
        <PdfReportTemplate
          ref={pdfDailyTemplateRef}
          dateStr={dateStr}
          settings={settings}
          orders={currentDayData.orders}
          incomes={currentDayData.incomes}
          issues={currentDayData.issues}
          purchases={currentDayData.purchases}
          photos={currentDayData.photos}
          notes={currentDayData.notes}
          boothCondition={currentDayData.boothCondition}
          stockCondition={currentDayData.stockCondition}
          customFrames={currentDayData.customFrames}
        />
      </div>

      {/* Hidden PDF Printable Document Template - Monthly with Graph */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none print:static print:left-0 print:top-0"
        style={{ width: '850px' }}
        aria-hidden="true"
      >
        <PdfMonthlyReportTemplate
          ref={pdfMonthlyTemplateRef}
          summary={monthlySummary}
          settings={settings}
          dateStr={formatDateIndonesian(new Date())}
        />
      </div>
    </div>
  );
}

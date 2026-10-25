export interface Order {
  id: string;
  clientName: string;
  prints: number;
  time?: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
}

export interface Issue {
  id: string;
  text: string;
  autoSource?: string;
  createdAt?: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: string;
  autoSource?: string;
}

export type StatusOKMasalah = 'OK' | 'Masalah';
export type StatusOKKurang = 'OK' | 'Kurang';

export interface BoothCondition {
  camera: StatusOKMasalah;
  ringLight: StatusOKMasalah;
  screen: StatusOKMasalah;
  printer: StatusOKMasalah;
  cleanliness: StatusOKMasalah;
}

export interface StockCondition {
  bk: StatusOKKurang;
  c: StatusOKKurang;
  y: StatusOKKurang;
  m: StatusOKKurang;
  lc: StatusOKKurang;
  lm: StatusOKKurang;
  paper: StatusOKKurang;
  inkBox: StatusOKKurang;
}

export type CustomFrameStatus = 'Antri' | 'Proses Desain' | 'Siap Cetak' | 'Selesai';

export interface CustomFrameQueueItem {
  id: string;
  clientName: string;
  theme: string;
  status: CustomFrameStatus;
  notes?: string;
  time?: string;
}

export interface Settings {
  boothName: string;
  attendantName: string;
  ownerPhone: string;
  logoUrl?: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  name: string;
}

export interface DayReportData {
  date: string; // YYYY-MM-DD
  orders: Order[];
  customFrames: CustomFrameQueueItem[];
  incomes: Income[];
  boothCondition: BoothCondition;
  stockCondition: StockCondition;
  issues: Issue[];
  purchases: PurchaseItem[];
  photos: PhotoItem[];
  notes: string;
}

export interface DailySalesSummary {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1..31
  dayLabel: string; // e.g. "24 Okt"
  dayOfWeek: string; // Sen, Sel, Rab, dll.
  ordersCount: number;
  totalPrints: number;
  totalIncome: number;
}

export interface MonthlyReportSummary {
  monthKey: string; // YYYY-MM
  monthName: string; // e.g. "Oktober 2026"
  days: DailySalesSummary[];
  totalOrders: number;
  totalPrints: number;
  totalIncome: number;
  averageDailyIncome: number;
  highestDay: { date: string; dayLabel: string; income: number; prints: number } | null;
  paymentBreakdown: { source: string; amount: number; percentage: number }[];
}

export const DEFAULT_SETTINGS: Settings = {
  boothName: 'Photobooth Station 1',
  attendantName: 'Kasir / Operator',
  ownerPhone: '6281234567890',
  logoUrl: '',
};

export function calculateActiveCustomFrames(queue: CustomFrameQueueItem[]): number {
  return queue.filter((item) => item.status !== 'Selesai').length;
}

export const CUSTOM_FRAME_STATUS_CONFIG: Record<
  CustomFrameStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string; icon: string }
> = {
  Antri: {
    label: 'Antri',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    icon: '⏳',
  },
  'Proses Desain': {
    label: 'Proses Desain',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    icon: '🎨',
  },
  'Siap Cetak': {
    label: 'Siap Cetak',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    icon: '🖨️',
  },
  Selesai: {
    label: 'Selesai',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    icon: '✅',
  },
};

export const DEFAULT_BOOTH_CONDITION: BoothCondition = {
  camera: 'OK',
  ringLight: 'OK',
  screen: 'OK',
  printer: 'OK',
  cleanliness: 'OK',
};

export const DEFAULT_STOCK_CONDITION: StockCondition = {
  bk: 'OK',
  c: 'OK',
  y: 'OK',
  m: 'OK',
  lc: 'OK',
  lm: 'OK',
  paper: 'OK',
  inkBox: 'OK',
};

export function calculateTotalPrints(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + (Number(order.prints) || 0), 0);
}

export function calculateTotalIncome(incomes: Income[]): number {
  return incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
}

export function formatRupiah(amount: number): string {
  const safeNum = Math.round(Number(amount) || 0);
  return 'Rp ' + safeNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseRupiahInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
}

export function sanitizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.replace('+', '');
  } else if (!cleaned.startsWith('62') && cleaned.length > 0) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export const BOOTH_LABELS: Record<keyof BoothCondition, string> = {
  camera: 'Kamera',
  ringLight: 'Lampu Ring',
  screen: 'Layar / Monitor',
  printer: 'Printer',
  cleanliness: 'Kebersihan Booth',
};

export const STOCK_LABELS: Record<keyof StockCondition, { label: string; item: string; defaultQty: string }> = {
  bk: { label: 'Tinta BK (Black)', item: 'Tinta Printer BK', defaultQty: '1 Botol' },
  c: { label: 'Tinta C (Cyan)', item: 'Tinta Printer Cyan', defaultQty: '1 Botol' },
  y: { label: 'Tinta Y (Yellow)', item: 'Tinta Printer Yellow', defaultQty: '1 Botol' },
  m: { label: 'Tinta M (Magenta)', item: 'Tinta Printer Magenta', defaultQty: '1 Botol' },
  lc: { label: 'Tinta LC (Light Cyan)', item: 'Tinta Printer Light Cyan', defaultQty: '1 Botol' },
  lm: { label: 'Tinta LM (Light Magenta)', item: 'Tinta Printer Light Magenta', defaultQty: '1 Botol' },
  paper: { label: 'Kertas Foto', item: 'Kertas Foto Photobooth', defaultQty: '1-2 Roll / Pack' },
  inkBox: { label: 'Box Tinta (Maintenance)', item: 'Maintenance Box Tinta', defaultQty: '1 Pcs' },
};

/**
 * Synchronizes booth condition checklist into the issues list.
 * If an item is "Masalah", an auto-generated entry is present.
 * If "OK", the auto-generated entry is removed.
 * Manual user-entered issues are preserved.
 */
export function syncBoothIssues(currentIssues: Issue[], booth: BoothCondition): Issue[] {
  const result = [...currentIssues];
  const keys = Object.keys(booth) as (keyof BoothCondition)[];

  for (const key of keys) {
    const autoKey = `booth-${key}`;
    const status = booth[key];
    const existingIndex = result.findIndex((i) => i.autoSource === autoKey);

    if (status === 'Masalah') {
      if (existingIndex === -1) {
        result.push({
          id: `auto-${autoKey}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          text: `[Otomatis] Kondisi ${BOOTH_LABELS[key]} bermasalah / butuh perbaikan`,
          autoSource: autoKey,
        });
      }
    } else {
      // If OK, remove auto-generated issue
      if (existingIndex !== -1) {
        result.splice(existingIndex, 1);
      }
    }
  }

  return result;
}

/**
 * Synchronizes stock checklist into the items to purchase list.
 * If an item is "Kurang", an auto-generated purchase recommendation is present.
 * If "OK", the auto-generated item is removed.
 * Manual user-entered purchase items are preserved.
 */
export function syncStockPurchases(currentItems: PurchaseItem[], stock: StockCondition): PurchaseItem[] {
  const result = [...currentItems];
  const keys = Object.keys(stock) as (keyof StockCondition)[];

  for (const key of keys) {
    const autoKey = `stock-${key}`;
    const status = stock[key];
    const existingIndex = result.findIndex((i) => i.autoSource === autoKey);

    if (status === 'Kurang') {
      if (existingIndex === -1) {
        const info = STOCK_LABELS[key];
        result.push({
          id: `auto-${autoKey}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: `[Otomatis] ${info.item} (Stok Kurang)`,
          quantity: info.defaultQty,
          autoSource: autoKey,
        });
      }
    } else {
      // If OK, remove auto-generated item
      if (existingIndex !== -1) {
        result.splice(existingIndex, 1);
      }
    }
  }

  return result;
}

export function formatDateIndonesian(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[d.getDay()];
  const day = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function buildWhatsAppMessage(data: {
  dateStr: string;
  settings: Settings;
  orders: Order[];
  incomes: Income[];
  issues: Issue[];
  purchases: PurchaseItem[];
  notes: string;
  boothCondition: BoothCondition;
  stockCondition: StockCondition;
  customFrames?: CustomFrameQueueItem[];
}): string {
  const totalPrints = calculateTotalPrints(data.orders);
  const totalIncome = calculateTotalIncome(data.incomes);

  const lines: string[] = [];

  lines.push(`📋 *LAPORAN HARIAN PHOTOBOOTH*`);
  lines.push(`🏢 *Booth:* ${data.settings.boothName}`);
  lines.push(`📅 *Tanggal:* ${data.dateStr}`);
  lines.push(`👤 *Kasir / Attendant:* ${data.settings.attendantName}`);
  lines.push(`----------------------------------------`);

  // Ringkasan Utama
  lines.push(`📊 *RINGKASAN UTAMA*`);
  lines.push(`• Total Orderan: ${data.orders.length} transaksi`);
  lines.push(`• Total Biji (Print): *${totalPrints} print*`);
  lines.push(`• Total Pemasukan: *${formatRupiah(totalIncome)}*`);
  if (data.customFrames && data.customFrames.length > 0) {
    const activeFrames = data.customFrames.filter((f) => f.status !== 'Selesai').length;
    lines.push(`• Antrian Custom Frame: *${data.customFrames.length} klien* (${activeFrames} proses)`);
  }
  lines.push(``);

  // Rincian Pemasukan
  lines.push(`💰 *RINCIAN PEMASUKAN:*`);
  if (data.incomes.length === 0) {
    lines.push(`  _(Belum ada catatan pemasukan)_`);
  } else {
    data.incomes.forEach((inc, idx) => {
      lines.push(`  ${idx + 1}. ${inc.source}: ${formatRupiah(inc.amount)}`);
    });
  }
  lines.push(``);

  // Rincian Orderan
  lines.push(`📸 *DAFTAR ORDERAN HARI INI:*`);
  if (data.orders.length === 0) {
    lines.push(`  _(Belum ada orderan)_`);
  } else {
    data.orders.forEach((ord, idx) => {
      lines.push(`  ${idx + 1}. ${ord.clientName} (${ord.prints} print)`);
    });
  }
  lines.push(``);

  // Antrian Custom Frame (jika ada)
  if (data.customFrames && data.customFrames.length > 0) {
    lines.push(`🖼️ *ANTRIAN CUSTOM FRAME:*`);
    data.customFrames.forEach((frame, idx) => {
      const statusIcon =
        frame.status === 'Selesai'
          ? '✅'
          : frame.status === 'Siap Cetak'
          ? '🖨️'
          : frame.status === 'Proses Desain'
          ? '🎨'
          : '⏳';
      lines.push(`  ${idx + 1}. [${statusIcon} ${frame.status}] ${frame.clientName} - ${frame.theme}`);
      if (frame.notes) {
        lines.push(`     Catatan: _${frame.notes}_`);
      }
    });
    lines.push(``);
  }

  // Kendala
  lines.push(`⚠️ *KENDALA OPERASIONAL:*`);
  if (data.issues.length === 0) {
    lines.push(`  ✅ Aman / Tidak ada kendala.`);
  } else {
    data.issues.forEach((iss, idx) => {
      lines.push(`  ${idx + 1}. ${iss.text}`);
    });
  }
  lines.push(``);

  // Barang yang Harus Dibeli
  lines.push(`🛒 *BARANG YANG HARUS DIBELI / STOK KURANG:*`);
  if (data.purchases.length === 0) {
    lines.push(`  ✅ Stok aman terkendali.`);
  } else {
    data.purchases.forEach((pur, idx) => {
      lines.push(`  ${idx + 1}. ${pur.name} -> ${pur.quantity}`);
    });
  }
  lines.push(``);

  // Catatan Kegiatan
  if (data.notes.trim()) {
    lines.push(`📝 *CATATAN KEGIATAN:*`);
    lines.push(data.notes.trim());
    lines.push(``);
  }

  lines.push(`_Dikirim melalui Sistem Laporan Harian Photobooth_`);

  return lines.join('\n');
}

export function formatMonthIndonesian(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  if (isNaN(year) || isNaN(monthIdx) || monthIdx < 0 || monthIdx > 11) return monthKey;
  return `${months[monthIdx]} ${year}`;
}

export function calculateMonthlySummary(
  monthKey: string,
  reportsMap: Record<string, DayReportData>
): MonthlyReportSummary {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  const days: DailySalesSummary[] = [];
  let totalOrders = 0;
  let totalPrints = 0;
  let totalIncome = 0;
  const paymentTotals: Record<string, number> = {};

  const daysShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  let highestDay: { date: string; dayLabel: string; income: number; prints: number } | null = null;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateKey = `${monthKey}-${dayStr}`;
    const dateObj = new Date(year, monthNum - 1, d);
    const dayOfWeek = daysShort[dateObj.getDay()];
    const dayLabel = `${d} ${monthsShort[monthNum - 1]}`;

    const report = reportsMap[dateKey];
    let dayOrders = 0;
    let dayPrints = 0;
    let dayIncome = 0;

    if (report) {
      dayOrders = report.orders?.length || 0;
      dayPrints = calculateTotalPrints(report.orders || []);
      dayIncome = calculateTotalIncome(report.incomes || []);

      (report.incomes || []).forEach((inc) => {
        paymentTotals[inc.source] = (paymentTotals[inc.source] || 0) + (Number(inc.amount) || 0);
      });
    }

    totalOrders += dayOrders;
    totalPrints += dayPrints;
    totalIncome += dayIncome;

    if (dayIncome > 0 && (!highestDay || dayIncome > highestDay.income)) {
      highestDay = {
        date: dateKey,
        dayLabel,
        income: dayIncome,
        prints: dayPrints,
      };
    }

    days.push({
      date: dateKey,
      dayNumber: d,
      dayLabel,
      dayOfWeek,
      ordersCount: dayOrders,
      totalPrints: dayPrints,
      totalIncome: dayIncome,
    });
  }

  // Active days with income for average daily calculation
  const activeDaysCount = days.filter((d) => d.totalIncome > 0).length || 1;
  const averageDailyIncome = Math.round(totalIncome / activeDaysCount);

  // Breakdown array
  const paymentBreakdown = Object.entries(paymentTotals).map(([source, amount]) => ({
    source,
    amount,
    percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
  }));

  // Sort payment breakdown desc
  paymentBreakdown.sort((a, b) => b.amount - a.amount);

  return {
    monthKey,
    monthName: formatMonthIndonesian(monthKey),
    days,
    totalOrders,
    totalPrints,
    totalIncome,
    averageDailyIncome,
    highestDay,
    paymentBreakdown,
  };
}

/**
 * Generates realistic historical sample data for the given month
 * with natural peaks on weekends (Sabtu, Minggu) and steady sales on weekdays.
 */
export function generateRealisticMonthlyData(
  monthKey: string,
  todayKey?: string,
  todayData?: DayReportData
): Record<string, DayReportData> {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  const result: Record<string, DayReportData> = {};

  const commonClients = [
    'Sweet 17th Clara', 'Wedding Dimas & Putri', 'Couple Photo Studio', 'Group Hangout SMA 3',
    'Arisan Keluarga Melati', 'Birthday Party Kenzo', 'Graduation Photo Strip', 'Family Portrait Wahyudi',
    'Corporate Gathering BCA', 'Selfie Bareng Bestie', 'Couple Strip Vintage'
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const dateKey = `${monthKey}-${dayStr}`;

    // If today's data is already provided, keep it pristine
    if (todayKey && dateKey === todayKey && todayData) {
      result[dateKey] = todayData;
      continue;
    }

    const dateObj = new Date(year, monthNum - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Up and down pattern: higher on weekends (15-28 orders), moderate on weekdays (4-12 orders)
    const baseOrders = isWeekend ? Math.floor(12 + Math.random() * 10) : Math.floor(4 + Math.random() * 6);
    const orders: Order[] = [];
    const incomes: Income[] = [];

    let dayPrints = 0;
    for (let o = 0; o < baseOrders; o++) {
      const client = commonClients[(d + o) % commonClients.length];
      const prints = [2, 4, 6, 8, 12][(o + d) % 5];
      orders.push({
        id: `gen-ord-${dateKey}-${o}`,
        clientName: `${client} #${o + 1}`,
        prints,
        time: `${12 + (o % 9)}:${(o * 17) % 60}`,
      });
      dayPrints += prints;
    }

    const totalDayNominal = dayPrints * 15000 + baseOrders * 20000;
    const qrisShare = Math.round(totalDayNominal * 0.65);
    const cashShare = totalDayNominal - qrisShare;

    incomes.push({ id: `gen-inc-${dateKey}-1`, source: 'QRIS', amount: qrisShare });
    incomes.push({ id: `gen-inc-${dateKey}-2`, source: 'Cash', amount: cashShare });

    result[dateKey] = {
      date: dateKey,
      orders,
      customFrames: [],
      incomes,
      boothCondition: DEFAULT_BOOTH_CONDITION,
      stockCondition: DEFAULT_STOCK_CONDITION,
      issues: d % 7 === 0 ? [{ id: `gen-iss-${dateKey}`, text: 'Kertas hampir habis sempat restock jam 16:00' }] : [],
      purchases: [],
      photos: [],
      notes: isWeekend ? 'Weekend ramai pengunjung, antrean antusias!' : 'Operasional hari kerja stabil.',
    };
  }

  return result;
}


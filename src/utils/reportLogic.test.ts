import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalPrints,
  calculateTotalIncome,
  formatRupiah,
  parseRupiahInput,
  sanitizePhoneNumber,
  syncBoothIssues,
  syncStockPurchases,
  buildWhatsAppMessage,
  DEFAULT_BOOTH_CONDITION,
  DEFAULT_STOCK_CONDITION,
  DEFAULT_SETTINGS,
  Order,
  Income,
  Issue,
  PurchaseItem,
} from './reportLogic';

test('calculateTotalPrints correctly sums print quantities', () => {
  const orders: Order[] = [
    { id: '1', clientName: 'Wedding Dian', prints: 50 },
    { id: '2', clientName: 'Birthday Rani', prints: 25 },
    { id: '3', clientName: 'Corporate Event', prints: 100 },
  ];
  assert.equal(calculateTotalPrints(orders), 175);
  assert.equal(calculateTotalPrints([]), 0);
});

test('calculateTotalIncome correctly sums income amounts', () => {
  const incomes: Income[] = [
    { id: '1', source: 'Cash', amount: 500000 },
    { id: '2', source: 'QRIS', amount: 350000 },
    { id: '3', source: 'Transfer BCA', amount: 1200000 },
  ];
  assert.equal(calculateTotalIncome(incomes), 2050000);
  assert.equal(calculateTotalIncome([]), 0);
});

test('formatRupiah formats number to IDR string', () => {
  assert.equal(formatRupiah(150000), 'Rp 150.000');
  assert.equal(formatRupiah(2500000), 'Rp 2.500.000');
  assert.equal(formatRupiah(0), 'Rp 0');
});

test('parseRupiahInput extracts numeric values safely', () => {
  assert.equal(parseRupiahInput('150.000'), 150000);
  assert.equal(parseRupiahInput('Rp 2.500.000'), 2500000);
  assert.equal(parseRupiahInput(''), 0);
});

test('sanitizePhoneNumber standardizes Indonesian phone formats', () => {
  assert.equal(sanitizePhoneNumber('08123456789'), '628123456789');
  assert.equal(sanitizePhoneNumber('+628123456789'), '628123456789');
  assert.equal(sanitizePhoneNumber('628123456789'), '628123456789');
  assert.equal(sanitizePhoneNumber('0812-3456-7890'), '6281234567890');
});

test('syncBoothIssues automatically adds issues when status is Masalah, and removes when OK', () => {
  const initialIssues: Issue[] = [
    { id: 'custom-1', text: 'Kabel colokan agak longgar' }
  ];

  // Set camera to Masalah
  const withCameraProblem = syncBoothIssues(initialIssues, {
    ...DEFAULT_BOOTH_CONDITION,
    camera: 'Masalah',
    printer: 'Masalah',
  });

  assert.equal(withCameraProblem.length, 3);
  assert.ok(withCameraProblem.some(i => i.autoSource === 'booth-camera'));
  assert.ok(withCameraProblem.some(i => i.autoSource === 'booth-printer'));
  // Ensure custom issue is still intact
  assert.ok(withCameraProblem.some(i => i.id === 'custom-1'));

  // Now resolve printer (back to OK)
  const resolvedPrinter = syncBoothIssues(withCameraProblem, {
    ...DEFAULT_BOOTH_CONDITION,
    camera: 'Masalah',
    printer: 'OK',
  });

  assert.equal(resolvedPrinter.length, 2);
  assert.ok(resolvedPrinter.some(i => i.autoSource === 'booth-camera'));
  assert.ok(!resolvedPrinter.some(i => i.autoSource === 'booth-printer'));
});

test('syncStockPurchases automatically adds purchase items when Kurang and removes when OK', () => {
  const initialItems: PurchaseItem[] = [
    { id: 'custom-pur-1', name: 'Baterai Cadangan AA', quantity: '4 Pcs' }
  ];

  // Set Tinta BK and Kertas to Kurang
  const withLowStock = syncStockPurchases(initialItems, {
    ...DEFAULT_STOCK_CONDITION,
    bk: 'Kurang',
    paper: 'Kurang',
  });

  assert.equal(withLowStock.length, 3);
  assert.ok(withLowStock.some(item => item.autoSource === 'stock-bk'));
  assert.ok(withLowStock.some(item => item.autoSource === 'stock-paper'));
  assert.ok(withLowStock.some(item => item.id === 'custom-pur-1'));

  // Refilled paper (back to OK)
  const afterRefill = syncStockPurchases(withLowStock, {
    ...DEFAULT_STOCK_CONDITION,
    bk: 'Kurang',
    paper: 'OK',
  });

  assert.equal(afterRefill.length, 2);
  assert.ok(afterRefill.some(item => item.autoSource === 'stock-bk'));
  assert.ok(!afterRefill.some(item => item.autoSource === 'stock-paper'));
});

test('buildWhatsAppMessage builds complete report text', () => {
  const msg = buildWhatsAppMessage({
    dateStr: 'Sabtu, 24 Oktober 2026',
    settings: DEFAULT_SETTINGS,
    orders: [{ id: '1', clientName: 'Pak Doni', prints: 40 }],
    incomes: [{ id: '1', source: 'QRIS', amount: 750000 }],
    issues: [{ id: '1', text: 'Kertas sempat macet' }],
    purchases: [{ id: '1', name: 'Kertas Glossy', quantity: '1 Roll' }],
    notes: 'Acara sukses ramai lancar.',
    boothCondition: DEFAULT_BOOTH_CONDITION,
    stockCondition: DEFAULT_STOCK_CONDITION,
    customFrames: [
      { id: 'cf-1', clientName: 'Rania Birthday', theme: 'Y2K Vintage Pink', status: 'Proses Desain', notes: 'Tulis Sweet 17' },
    ],
  });

  assert.ok(msg.includes('LAPORAN HARIAN PHOTOBOOTH'));
  assert.ok(msg.includes('40 print'));
  assert.ok(msg.includes('Rp 750.000'));
  assert.ok(msg.includes('Pak Doni'));
  assert.ok(msg.includes('Kertas sempat macet'));
  assert.ok(msg.includes('Kertas Glossy'));
  assert.ok(msg.includes('Acara sukses ramai lancar.'));
  assert.ok(msg.includes('ANTRIAN CUSTOM FRAME'));
  assert.ok(msg.includes('Rania Birthday'));
  assert.ok(msg.includes('Y2K Vintage Pink'));
});

test('calculateMonthlySummary aggregates monthly sales and tracks highest day and payment breakdown', async () => {
  const { calculateMonthlySummary, formatMonthIndonesian } = await import('./reportLogic');

  const sampleReports = {
    '2026-10-01': {
      date: '2026-10-01',
      orders: [{ id: '1', clientName: 'Klien A', prints: 10 }],
      customFrames: [],
      incomes: [{ id: '1', source: 'QRIS', amount: 200000 }],
      boothCondition: DEFAULT_BOOTH_CONDITION,
      stockCondition: DEFAULT_STOCK_CONDITION,
      issues: [],
      purchases: [],
      photos: [],
      notes: '',
    },
    '2026-10-02': {
      date: '2026-10-02',
      orders: [
        { id: '2', clientName: 'Klien B', prints: 20 },
        { id: '3', clientName: 'Klien C', prints: 15 },
      ],
      customFrames: [],
      incomes: [
        { id: '2', source: 'QRIS', amount: 300000 },
        { id: '3', source: 'Cash', amount: 150000 },
      ],
      boothCondition: DEFAULT_BOOTH_CONDITION,
      stockCondition: DEFAULT_STOCK_CONDITION,
      issues: [],
      purchases: [],
      photos: [],
      notes: '',
    },
  };

  const summary = calculateMonthlySummary('2026-10', sampleReports);
  assert.equal(summary.monthName, 'Oktober 2026');
  assert.equal(summary.totalOrders, 3);
  assert.equal(summary.totalPrints, 45);
  assert.equal(summary.totalIncome, 650000);
  assert.equal(summary.highestDay?.date, '2026-10-02');
  assert.equal(summary.highestDay?.income, 450000);
  assert.equal(summary.paymentBreakdown[0].source, 'QRIS');
  assert.equal(summary.paymentBreakdown[0].amount, 500000);
});


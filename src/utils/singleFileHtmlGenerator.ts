/**
 * Generates a completely standalone single-file HTML with embedded Tailwind CDN,
 * Font, Lucide icons, html2canvas, and jsPDF, containing all interactive logic in plain JS.
 */
export function generateSingleFileHtml(initialState?: {
  boothName?: string;
  attendantName?: string;
  ownerPhone?: string;
  logoUrl?: string;
}): string {
  const boothName = initialState?.boothName || 'SnapVibe Photobooth';
  const attendant = initialState?.attendantName || 'Kasir / Attendant';
  const ownerPhone = initialState?.ownerPhone || '6281234567890';
  const logoUrl = initialState?.logoUrl || '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Harian Photobooth</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- jsPDF & html2canvas -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background-color: #f8fafc; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body class="min-h-screen text-slate-800 pb-16">
  <div id="app" class="max-w-5xl mx-auto px-4 py-6">
    <!-- Header -->
    <header class="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 mb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">📸</span>
            <h1 class="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Laporan Harian Photobooth</h1>
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span id="date-display" class="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold"></span>
            <span>•</span>
            <span id="header-booth-name" class="font-semibold text-slate-700"></span>
            <span>•</span>
            <span id="header-attendant" class="text-slate-600"></span>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button onclick="downloadPDF()" class="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
            📄 PDF
          </button>
          <button onclick="sendWhatsApp()" class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
            💬 Kirim
          </button>
          <button onclick="openSettings()" class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition">
            ⚙️ Pengaturan
          </button>
        </div>
      </div>
    </header>

    <!-- Stat Summary Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orderan</p>
        <p id="stat-orders" class="text-2xl font-bold text-slate-900 mt-1">0</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Biji / Print</p>
        <p id="stat-prints" class="text-2xl font-bold text-indigo-600 mt-1">0</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pemasukan</p>
        <p id="stat-income" class="text-2xl font-bold text-emerald-600 mt-1">Rp 0</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Operasional</p>
        <p id="stat-status" class="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1">✅ Semua OK</p>
      </div>
    </div>

    <!-- Main Grid Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- 2a. Orderan Hari Ini -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🏷️</span> Orderan Hari Ini
          </h2>
          <span class="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full" id="badge-total-prints">0 Print</span>
        </div>
        <form onsubmit="addOrder(event)" class="space-y-3 mb-4">
          <div class="grid grid-cols-3 gap-2">
            <input id="input-client" type="text" placeholder="Nama Klien / Acara" required class="col-span-2 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-500">
            <input id="input-prints" type="number" min="1" placeholder="Biji/Print" required class="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-indigo-500">
          </div>
          <button type="submit" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">+ Tambah Orderan</button>
        </form>
        <div id="orders-list" class="space-y-2 max-h-56 overflow-y-auto"></div>
      </section>

      <!-- 2b. Pemasukan Hari Ini -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>💰</span> Pemasukan Hari Ini
          </h2>
          <span class="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full" id="badge-total-income">Rp 0</span>
        </div>
        <form onsubmit="addIncome(event)" class="space-y-3 mb-4">
          <div class="grid grid-cols-2 gap-2">
            <select id="select-income-source" class="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-500 bg-white">
              <option value="Cash">Cash / Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer BCA">Transfer BCA</option>
              <option value="Transfer Mandiri">Transfer Mandiri</option>
              <option value="DANA">DANA</option>
              <option value="GoPay/OVO">GoPay / OVO</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <input id="input-amount" type="number" min="1000" step="500" placeholder="Nominal (Rp)" required class="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-500">
          </div>
          <button type="submit" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition">+ Tambah Pemasukan</button>
        </form>
        <div id="incomes-list" class="space-y-2 max-h-56 overflow-y-auto"></div>
      </section>
    </div>

    <!-- 3. CHECKLIST BOOTH & STOK -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- 3a. Cek Kondisi Booth -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
          <span>🛠️</span> Cek Kondisi Booth
        </h2>
        <p class="text-xs text-slate-500 mb-4">Jika memilih "Masalah", otomatis masuk ke daftar Kendala.</p>
        <div class="space-y-2" id="booth-checklist-container"></div>
      </section>

      <!-- 3b. Stok & Perlengkapan -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
          <span>📦</span> Stok & Perlengkapan
        </h2>
        <p class="text-xs text-slate-500 mb-4">Jika memilih "Kurang", otomatis masuk ke Barang yang Harus Dibeli.</p>
        <div class="grid grid-cols-2 gap-2" id="stock-checklist-container"></div>
      </section>
    </div>

    <!-- 2c & 2d: Kendala & Belanja -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- 2c. Kendala Hari Ini -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
          <span>⚠️</span> Kendala Hari Ini
        </h2>
        <form onsubmit="addIssue(event)" class="flex gap-2 mb-4">
          <input id="input-issue" type="text" placeholder="Tulis 1 kalimat deskripsi kendala..." class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-amber-500">
          <button type="submit" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition">+</button>
        </form>
        <div id="issues-list" class="space-y-2 max-h-56 overflow-y-auto"></div>
      </section>

      <!-- 2d. Barang yang Harus Dibeli -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
          <span>🛒</span> Barang yang Harus Dibeli
        </h2>
        <form onsubmit="addPurchase(event)" class="space-y-2 mb-4">
          <div class="grid grid-cols-3 gap-2">
            <input id="input-purchase-name" type="text" placeholder="Nama Barang (mis: Kertas)" required class="col-span-2 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-rose-500">
            <input id="input-purchase-qty" type="text" placeholder="Qty (2 Roll)" required class="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-rose-500">
          </div>
          <button type="submit" class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition">+ Tambah Barang Belanja</button>
        </form>
        <div id="purchases-list" class="space-y-2 max-h-56 overflow-y-auto"></div>
      </section>
    </div>

    <!-- 2e & 2f: Foto Kegiatan & Catatan Kegiatan -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 2e. Foto Kegiatan -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>📷</span> Foto Kegiatan
          </h2>
          <span id="photo-count" class="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">0 foto</span>
        </div>
        <div class="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer mb-3" onclick="document.getElementById('file-input').click()">
          <span class="text-2xl block mb-1">📤</span>
          <p class="text-xs font-semibold text-slate-700">Klik untuk upload foto kegiatan (bisa banyak)</p>
          <input type="file" id="file-input" multiple accept="image/*" class="hidden" onchange="handleFileUpload(event)">
        </div>
        <div id="photo-grid" class="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto"></div>
      </section>

      <!-- 2f. Catatan Kegiatan Hari Ini -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
          <span>📝</span> Catatan Kegiatan Hari Ini
        </h2>
        <textarea id="notes-textarea" oninput="saveNotes(this.value)" rows="6" placeholder="Tuliskan catatan umum, brief acara, situasi pengunjung, atau evaluasi operasional hari ini..." class="flex-1 w-full p-3 text-sm border border-slate-300 rounded-xl focus:outline-indigo-500 resize-none"></textarea>
      </section>
    </div>
  </div>

  <!-- Modal Pengaturan -->
  <div id="settings-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">⚙️ Pengaturan Photobooth</h3>
        <button onclick="closeSettings()" class="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Photobooth</label>
          <input id="setting-booth" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Kasir / Attendant</label>
          <input id="setting-attendant" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nomor WhatsApp Owner (e.g. 6281234567890)</label>
          <input id="setting-phone" type="text" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
          <p class="text-[11px] text-slate-500 mt-1">Format diawali kode negara 62 (contoh: 081234 -> 6281234)</p>
        </div>
        <div class="pt-2 flex justify-between gap-2 border-t border-slate-100">
          <button onclick="resetDayData()" class="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg">Reset Hari Baru</button>
          <button onclick="saveSettings()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg">Simpan</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // State
    let state = {
      settings: { boothName: '${boothName}', attendantName: '${attendant}', ownerPhone: '${ownerPhone}' },
      orders: [],
      incomes: [],
      issues: [],
      purchases: [],
      photos: [],
      notes: '',
      booth: { camera: 'OK', ringLight: 'OK', screen: 'OK', printer: 'OK', cleanliness: 'OK' },
      stock: { bk: 'OK', c: 'OK', y: 'OK', m: 'OK', lc: 'OK', lm: 'OK', paper: 'OK', inkBox: 'OK' }
    };

    const boothLabels = { camera: 'Kamera', ringLight: 'Lampu Ring', screen: 'Layar / Monitor', printer: 'Printer', cleanliness: 'Kebersihan' };
    const stockLabels = {
      bk: 'Tinta BK (Black)', c: 'Tinta Cyan', y: 'Tinta Yellow', m: 'Tinta Magenta',
      lc: 'Tinta Light Cyan', lm: 'Tinta Light Magenta', paper: 'Kertas Foto', inkBox: 'Box Tinta'
    };

    function init() {
      const saved = localStorage.getItem('photobooth_daily_report_data');
      if (saved) {
        try { Object.assign(state, JSON.parse(saved)); } catch(e){}
      }
      renderAll();
    }

    function saveToStorage() {
      localStorage.setItem('photobooth_daily_report_data', JSON.stringify(state));
      renderStats();
    }

    function formatRupiah(num) {
      return 'Rp ' + Math.round(num || 0).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
    }

    function getIndonesianDate() {
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      const now = new Date();
      return \`\${days[now.getDay()]}, \${now.getDate()} \${months[now.getMonth()]} \${now.getFullYear()}\`;
    }

    function renderAll() {
      document.getElementById('date-display').textContent = getIndonesianDate();
      document.getElementById('header-booth-name').textContent = state.settings.boothName;
      document.getElementById('header-attendant').textContent = state.settings.attendantName;
      document.getElementById('notes-textarea').value = state.notes || '';
      renderStats();
      renderOrders();
      renderIncomes();
      renderBoothChecklist();
      renderStockChecklist();
      renderIssues();
      renderPurchases();
      renderPhotos();
    }

    function renderStats() {
      const totalPrints = state.orders.reduce((sum, o) => sum + (Number(o.prints)||0), 0);
      const totalIncome = state.incomes.reduce((sum, i) => sum + (Number(i.amount)||0), 0);
      document.getElementById('stat-orders').textContent = state.orders.length;
      document.getElementById('stat-prints').textContent = totalPrints + ' pcs';
      document.getElementById('stat-income').textContent = formatRupiah(totalIncome);
      document.getElementById('badge-total-prints').textContent = totalPrints + ' Print';
      document.getElementById('badge-total-income').textContent = formatRupiah(totalIncome);

      const hasIssue = Object.values(state.booth).some(v => v === 'Masalah') || Object.values(state.stock).some(v => v === 'Kurang');
      const statusEl = document.getElementById('stat-status');
      if (hasIssue) {
        statusEl.innerHTML = '<span class="text-amber-600 font-bold">⚠️ Perlu Perhatian</span>';
      } else {
        statusEl.innerHTML = '<span class="text-emerald-600 font-bold">✅ Semua OK</span>';
      }
    }

    // Orders
    function addOrder(e) {
      e.preventDefault();
      const client = document.getElementById('input-client').value.trim();
      const prints = parseInt(document.getElementById('input-prints').value, 10);
      if (!client || !prints) return;
      state.orders.push({ id: Date.now().toString(), clientName: client, prints });
      document.getElementById('input-client').value = '';
      document.getElementById('input-prints').value = '';
      saveToStorage();
      renderOrders();
    }

    function removeOrder(id) {
      state.orders = state.orders.filter(o => o.id !== id);
      saveToStorage();
      renderOrders();
    }

    function renderOrders() {
      const container = document.getElementById('orders-list');
      if (state.orders.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 py-3 text-center">Belum ada orderan ditambahkan.</p>';
        return;
      }
      container.innerHTML = state.orders.map(o => \`
        <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm">
          <span class="font-medium text-slate-800">\${o.clientName}</span>
          <div class="flex items-center gap-3">
            <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-md">\${o.prints} Print</span>
            <button onclick="removeOrder('\${o.id}')" class="text-slate-400 hover:text-rose-500 font-bold text-base">&times;</button>
          </div>
        </div>
      \`).join('');
    }

    // Incomes
    function addIncome(e) {
      e.preventDefault();
      const source = document.getElementById('select-income-source').value;
      const amount = parseInt(document.getElementById('input-amount').value, 10);
      if (!amount) return;
      state.incomes.push({ id: Date.now().toString(), source, amount });
      document.getElementById('input-amount').value = '';
      saveToStorage();
      renderIncomes();
    }

    function removeIncome(id) {
      state.incomes = state.incomes.filter(i => i.id !== id);
      saveToStorage();
      renderIncomes();
    }

    function renderIncomes() {
      const container = document.getElementById('incomes-list');
      if (state.incomes.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 py-3 text-center">Belum ada catatan pemasukan.</p>';
        return;
      }
      container.innerHTML = state.incomes.map(i => \`
        <div class="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm">
          <span class="font-medium text-slate-800">\${i.source}</span>
          <div class="flex items-center gap-3">
            <span class="font-bold text-emerald-700">\${formatRupiah(i.amount)}</span>
            <button onclick="removeIncome('\${i.id}')" class="text-slate-400 hover:text-rose-500 font-bold text-base">&times;</button>
          </div>
        </div>
      \`).join('');
    }

    // Booth Checklist
    function toggleBooth(itemKey, status) {
      state.booth[itemKey] = status;
      syncBoothToIssues();
      saveToStorage();
      renderBoothChecklist();
      renderIssues();
    }

    function syncBoothToIssues() {
      for (const [key, label] of Object.entries(boothLabels)) {
        const autoKey = 'booth-' + key;
        const existsIndex = state.issues.findIndex(i => i.autoSource === autoKey);
        if (state.booth[key] === 'Masalah') {
          if (existsIndex === -1) {
            state.issues.push({ id: 'auto-' + autoKey, text: \`[Otomatis] \${label} booth bermasalah\`, autoSource: autoKey });
          }
        } else {
          if (existsIndex !== -1) {
            state.issues.splice(existsIndex, 1);
          }
        }
      }
    }

    function renderBoothChecklist() {
      const container = document.getElementById('booth-checklist-container');
      container.innerHTML = Object.entries(boothLabels).map(([key, label]) => {
        const current = state.booth[key];
        const isOk = current === 'OK';
        return \`
          <div class="flex items-center justify-between p-2.5 rounded-xl border \${isOk ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'}">
            <span class="text-sm font-semibold text-slate-800">\${label}</span>
            <div class="flex gap-1.5">
              <button onclick="toggleBooth('\${key}', 'OK')" class="px-3 py-1 rounded-lg text-xs font-bold transition \${isOk ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}">OK</button>
              <button onclick="toggleBooth('\${key}', 'Masalah')" class="px-3 py-1 rounded-lg text-xs font-bold transition \${!isOk ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}">Masalah</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Stock Checklist
    function toggleStock(itemKey, status) {
      state.stock[itemKey] = status;
      syncStockToPurchases();
      saveToStorage();
      renderStockChecklist();
      renderPurchases();
    }

    function syncStockToPurchases() {
      for (const [key, label] of Object.entries(stockLabels)) {
        const autoKey = 'stock-' + key;
        const existsIndex = state.purchases.findIndex(p => p.autoSource === autoKey);
        if (state.stock[key] === 'Kurang') {
          if (existsIndex === -1) {
            state.purchases.push({ id: 'auto-' + autoKey, name: \`[Otomatis] \${label}\`, quantity: '1 Unit/Roll', autoSource: autoKey });
          }
        } else {
          if (existsIndex !== -1) {
            state.purchases.splice(existsIndex, 1);
          }
        }
      }
    }

    function renderStockChecklist() {
      const container = document.getElementById('stock-checklist-container');
      container.innerHTML = Object.entries(stockLabels).map(([key, label]) => {
        const isOk = state.stock[key] === 'OK';
        return \`
          <div class="p-2.5 rounded-xl border text-xs \${isOk ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'}">
            <p class="font-bold text-slate-800 truncate mb-1.5">\${label}</p>
            <div class="flex gap-1">
              <button onclick="toggleStock('\${key}', 'OK')" class="flex-1 py-1 rounded font-bold transition \${isOk ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}">OK</button>
              <button onclick="toggleStock('\${key}', 'Kurang')" class="flex-1 py-1 rounded font-bold transition \${!isOk ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}">Kurang</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Issues
    function addIssue(e) {
      e.preventDefault();
      const val = document.getElementById('input-issue').value.trim();
      if (!val) return;
      state.issues.push({ id: Date.now().toString(), text: val });
      document.getElementById('input-issue').value = '';
      saveToStorage();
      renderIssues();
    }

    function removeIssue(id) {
      state.issues = state.issues.filter(i => i.id !== id);
      saveToStorage();
      renderIssues();
    }

    function renderIssues() {
      const container = document.getElementById('issues-list');
      if (state.issues.length === 0) {
        container.innerHTML = '<p class="text-xs text-emerald-600 py-3 text-center">✅ Tidak ada kendala operasional hari ini.</p>';
        return;
      }
      container.innerHTML = state.issues.map(i => \`
        <div class="flex items-center justify-between p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs">
          <span class="text-amber-900 font-medium">\${i.text}</span>
          <button onclick="removeIssue('\${i.id}')" class="text-amber-400 hover:text-rose-600 font-bold text-base">&times;</button>
        </div>
      \`).join('');
    }

    // Purchases
    function addPurchase(e) {
      e.preventDefault();
      const name = document.getElementById('input-purchase-name').value.trim();
      const quantity = document.getElementById('input-purchase-qty').value.trim();
      if (!name || !quantity) return;
      state.purchases.push({ id: Date.now().toString(), name, quantity });
      document.getElementById('input-purchase-name').value = '';
      document.getElementById('input-purchase-qty').value = '';
      saveToStorage();
      renderPurchases();
    }

    function removePurchase(id) {
      state.purchases = state.purchases.filter(p => p.id !== id);
      saveToStorage();
      renderPurchases();
    }

    function renderPurchases() {
      const container = document.getElementById('purchases-list');
      if (state.purchases.length === 0) {
        container.innerHTML = '<p class="text-xs text-emerald-600 py-3 text-center">✅ Stok aman terkendali.</p>';
        return;
      }
      container.innerHTML = state.purchases.map(p => \`
        <div class="flex items-center justify-between p-2 bg-rose-50 border border-rose-100 rounded-lg text-xs">
          <span class="text-rose-900 font-medium">\${p.name}</span>
          <div class="flex items-center gap-2">
            <span class="bg-rose-200/60 text-rose-800 font-bold px-1.5 py-0.5 rounded">\${p.quantity}</span>
            <button onclick="removePurchase('\${p.id}')" class="text-rose-400 hover:text-rose-700 font-bold text-base">&times;</button>
          </div>
        </div>
      \`).join('');
    }

    // Photos
    function handleFileUpload(e) {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          state.photos.push({ id: Date.now().toString() + Math.random(), url: evt.target.result, name: f.name });
          saveToStorage();
          renderPhotos();
        };
        reader.readAsDataURL(f);
      });
      e.target.value = '';
    }

    function removePhoto(id) {
      state.photos = state.photos.filter(p => p.id !== id);
      saveToStorage();
      renderPhotos();
    }

    function renderPhotos() {
      document.getElementById('photo-count').textContent = state.photos.length + ' foto';
      const container = document.getElementById('photo-grid');
      if (state.photos.length === 0) {
        container.innerHTML = '<p class="col-span-3 text-xs text-slate-400 py-2 text-center">Belum ada foto yang diunggah.</p>';
        return;
      }
      container.innerHTML = state.photos.map(p => \`
        <div class="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
          <img src="\${p.url}" class="w-full h-full object-cover">
          <button onclick="removePhoto('\${p.id}')" class="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100">&times;</button>
        </div>
      \`).join('');
    }

    function saveNotes(val) {
      state.notes = val;
      localStorage.setItem('photobooth_daily_report_data', JSON.stringify(state));
    }

    // Settings Modal
    function openSettings() {
      document.getElementById('setting-booth').value = state.settings.boothName;
      document.getElementById('setting-attendant').value = state.settings.attendantName;
      document.getElementById('setting-phone').value = state.settings.ownerPhone;
      document.getElementById('settings-modal').classList.remove('hidden');
      document.getElementById('settings-modal').classList.add('flex');
    }

    function closeSettings() {
      document.getElementById('settings-modal').classList.add('hidden');
      document.getElementById('settings-modal').classList.remove('flex');
    }

    function saveSettings() {
      state.settings.boothName = document.getElementById('setting-booth').value.trim() || 'Photobooth';
      state.settings.attendantName = document.getElementById('setting-attendant').value.trim() || 'Attendant';
      state.settings.ownerPhone = document.getElementById('setting-phone').value.trim() || '6281234567890';
      saveToStorage();
      closeSettings();
      renderAll();
    }

    function resetDayData() {
      if (confirm('Yakin ingin mereset seluruh data laporan hari ini untuk memulai hari baru?')) {
        state.orders = [];
        state.incomes = [];
        state.issues = [];
        state.purchases = [];
        state.photos = [];
        state.notes = '';
        state.booth = { camera: 'OK', ringLight: 'OK', screen: 'OK', printer: 'OK', cleanliness: 'OK' };
        state.stock = { bk: 'OK', c: 'OK', y: 'OK', m: 'OK', lc: 'OK', lm: 'OK', paper: 'OK', inkBox: 'OK' };
        saveToStorage();
        closeSettings();
        renderAll();
      }
    }

    // WhatsApp Export
    function sendWhatsApp() {
      const totalPrints = state.orders.reduce((sum, o) => sum + (Number(o.prints)||0), 0);
      const totalIncome = state.incomes.reduce((sum, i) => sum + (Number(i.amount)||0), 0);
      const dateStr = getIndonesianDate();

      let msg = '📋 *LAPORAN HARIAN PHOTOBOOTH*\\n';
      msg += \`🏢 *Booth:* \${state.settings.boothName}\\n\`;
      msg += \`📅 *Tanggal:* \${dateStr}\\n\`;
      msg += \`👤 *Kasir:* \${state.settings.attendantName}\\n\`;
      msg += '----------------------------------------\\n';
      msg += '📊 *RINGKASAN UTAMA*\\n';
      msg += \`• Total Orderan: \${state.orders.length} transaksi\\n\`;
      msg += \`• Total Biji (Print): *\${totalPrints} print*\\n\`;
      msg += \`• Total Pemasukan: *\${formatRupiah(totalIncome)}*\\n\\n\`;

      msg += '💰 *RINCIAN PEMASUKAN:*\\n';
      if (!state.incomes.length) msg += '  _(Belum ada pemasukan)_\\n';
      else state.incomes.forEach((inc, i) => { msg += \`  \${i+1}. \${inc.source}: \${formatRupiah(inc.amount)}\\n\`; });
      msg += '\\n';

      msg += '📸 *ORDERAN:*\\n';
      if (!state.orders.length) msg += '  _(Belum ada orderan)_\\n';
      else state.orders.forEach((o, i) => { msg += \`  \${i+1}. \${o.clientName} (\${o.prints} print)\\n\`; });
      msg += '\\n';

      msg += '⚠️ *KENDALA:*\\n';
      if (!state.issues.length) msg += '  ✅ Aman / Tidak ada kendala.\\n';
      else state.issues.forEach((iss, i) => { msg += \`  \${i+1}. \${iss.text}\\n\`; });
      msg += '\\n';

      msg += '🛒 *BARANG HARUS DIBELI:*\\n';
      if (!state.purchases.length) msg += '  ✅ Stok aman.\\n';
      else state.purchases.forEach((p, i) => { msg += \`  \${i+1}. \${p.name} (\${p.quantity})\\n\`; });
      msg += '\\n';

      if (state.notes.trim()) {
        msg += \`📝 *CATATAN KEGIATAN:*\\n\${state.notes.trim()}\\n\\n\`;
      }
      msg += '_Dikirim melalui Sistem Laporan Harian Photobooth_';

      let phone = state.settings.ownerPhone.replace(/\\D/g, '');
      if (phone.startsWith('0')) phone = '62' + phone.slice(1);
      const url = \`https://wa.me/\${phone}?text=\${encodeURIComponent(msg)}\`;
      window.open(url, '_blank');
    }

    // PDF Export
    async function downloadPDF() {
      const element = document.getElementById('app');
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(\`Laporan_Photobooth_\${new Date().toISOString().split('T')[0]}.pdf\`);
      } catch (err) {
        window.print();
      }
    }

    window.onload = init;
  </script>
</body>
</html>`;
}

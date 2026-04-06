[bimdex (2).html](https://github.com/user-attachments/files/26503683/bimdex.2.html)
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BimDex – Linzer Straßenbahnen</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="BimDex">
<meta name="theme-color" content="#0d0f14">
<link rel="apple-touch-icon" id="appleTouchIcon">
<link rel="manifest" id="manifestLink">
<script>
// Generate icon as SVG→PNG via canvas, then inject manifest + apple icon
(function() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#1e2330');
  grad.addColorStop(1, '#0d0f14');
  ctx.fillStyle = grad;
  roundRect(ctx, 0, 0, 512, 512, 90);
  ctx.fill();

  // Tram body
  ctx.fillStyle = '#f5a623';
  roundRect(ctx, 80, 180, 352, 200, 24);
  ctx.fill();

  // Windows
  ctx.fillStyle = '#0d0f14';
  [120, 210, 300].forEach(x => {
    roundRect(ctx, x, 210, 60, 60, 8);
    ctx.fill();
  });

  // Window shine
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  [120, 210, 300].forEach(x => {
    roundRect(ctx, x, 210, 60, 60, 8);
    ctx.fill();
  });

  // Door
  ctx.fillStyle = '#e63946';
  roundRect(ctx, 376, 230, 40, 130, 6);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#2a3045';
  [[140,380],[360,380]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.arc(x, y, 32, 0, Math.PI*2); ctx.fill();
  });
  ctx.fillStyle = '#6b7280';
  [[140,380],[360,380]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI*2); ctx.fill();
  });

  // Pantograph (Stromabnehmer)
  ctx.strokeStyle = '#f5a623';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(256, 180); ctx.lineTo(220, 120); ctx.lineTo(290, 90); ctx.lineTo(256, 180);
  ctx.stroke();

  // Rail line on top
  ctx.fillStyle = '#f5a623';
  ctx.fillRect(60, 90, 392, 8);

  // "BD" text
  ctx.fillStyle = '#0d0f14';
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BimDex', 256, 460);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
    ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
    ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
    ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
    ctx.closePath();
  }

  const iconDataUrl = canvas.toDataURL('image/png');

  // Apple touch icon
  document.getElementById('appleTouchIcon').href = iconDataUrl;

  // Manifest
  const manifest = {
    name: 'BimDex – Linzer Straßenbahnen',
    short_name: 'BimDex',
    description: 'Sammle alle Linzer Straßenbahnen',
    start_url: '.',
    display: 'standalone',
    background_color: '#0d0f14',
    theme_color: '#0d0f14',
    orientation: 'portrait',
    icons: [
      { src: iconDataUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  };
  const blob = new Blob([JSON.stringify(manifest)], {type: 'application/manifest+json'});
  document.getElementById('manifestLink').href = URL.createObjectURL(blob);
})();

// Service Worker (inline via blob)
if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE = 'bimdex-v1';
    self.addEventListener('install', e => {
      e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/'])));
      self.skipWaiting();
    });
    self.addEventListener('fetch', e => {
      e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('Offline')))
      );
    });
  `;
  const swBlob = new Blob([swCode], {type: 'application/javascript'});
  navigator.serviceWorker.register(URL.createObjectURL(swBlob)).catch(() => {});
}
</script>
<style>
  :root {
    --bg: #0d0f14;
    --surface: #161a23;
    --card: #1e2330;
    --border: #2a3045;
    --accent: #f5a623;
    --accent2: #e63946;
    --text: #e8eaf0;
    --muted: #6b7280;
    --green: #4ade80;
    --line1: #e63946;
    --line2: #3b82f6;
    --line3: #f59e0b;
    --line4: #10b981;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Background texture */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: 
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(245,166,35,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(230,57,70,0.06) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .wrap {
    position: relative;
    z-index: 1;
    max-width: 480px;
    margin: 0 auto;
    padding: 0 16px 100px;
  }

  /* Header */
  header {
    padding: 28px 0 20px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 42px;
    letter-spacing: 3px;
    line-height: 1;
    color: var(--accent);
    text-shadow: 0 0 30px rgba(245,166,35,0.4);
  }

  .logo span {
    color: var(--text);
    opacity: 0.4;
    font-size: 13px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 2px;
    display: block;
    margin-bottom: 4px;
  }

  .stats-pill {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 8px 14px;
    text-align: right;
  }

  .stats-pill .num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: var(--accent);
    line-height: 1;
  }

  .stats-pill .label {
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* Progress bar */
  .progress-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 20px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .progress-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--muted);
  }

  .progress-pct {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: var(--accent);
  }

  .progress-bar {
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent2), var(--accent));
    border-radius: 3px;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Scan button */
  .scan-area {
    background: var(--surface);
    border: 2px dashed var(--border);
    border-radius: 20px;
    padding: 28px 20px;
    margin-bottom: 20px;
    text-align: center;
    transition: border-color 0.2s, background 0.2s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .scan-area:hover {
    border-color: var(--accent);
    background: rgba(245,166,35,0.04);
  }

  .scan-area input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .scan-icon {
    font-size: 36px;
    margin-bottom: 8px;
    display: block;
  }

  .scan-label {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.5;
  }

  .photo-preview {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 12px;
    display: none;
  }

  /* Form */
  .entry-form {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .form-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 2px;
    color: var(--accent);
    margin-bottom: 16px;
  }

  .form-row {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--muted);
  }

  input[type="text"], input[type="number"], select {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 16px;
    padding: 12px 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
    -webkit-appearance: none;
  }

  input:focus, select:focus {
    border-color: var(--accent);
  }

  select option {
    background: var(--card);
  }

  .btn-submit {
    width: 100%;
    background: var(--accent);
    color: #0d0f14;
    border: none;
    border-radius: 12px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    letter-spacing: 2px;
    padding: 14px;
    cursor: pointer;
    margin-top: 4px;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .btn-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(245,166,35,0.3);
  }

  .btn-submit:active {
    transform: translateY(0);
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--green);
    color: #0d0f14;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 20px;
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    pointer-events: none;
    z-index: 100;
    white-space: nowrap;
  }

  .toast.already {
    background: var(--accent2);
    color: #fff;
  }

  .toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* Collection grid */
  .section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: var(--muted);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* Filter tabs */
  .filter-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .filter-tabs::-webkit-scrollbar { display: none; }

  .tab {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 12px;
    font-family: 'DM Mono', monospace;
    color: var(--muted);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .tab.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #0d0f14;
    font-weight: 500;
  }

  /* Bim cards */
  .bim-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .bim-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    animation: fadeIn 0.3s ease;
    position: relative;
  }

  .bim-delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(13,15,20,0.75);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--accent2);
    font-size: 14px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: background 0.2s;
  }

  .bim-delete-btn:hover { background: var(--accent2); color: #fff; }

  /* Confirm dialog */
  .confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  .confirm-overlay.show {
    opacity: 1;
    pointer-events: all;
  }

  .confirm-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 24px 20px;
    width: 100%;
    max-width: 400px;
    transform: translateY(20px);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .confirm-overlay.show .confirm-box {
    transform: translateY(0);
  }

  .confirm-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: var(--accent2);
    margin-bottom: 8px;
  }

  .confirm-text {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .confirm-text strong { color: var(--text); }

  .confirm-btns {
    display: flex;
    gap: 10px;
  }

  .confirm-btns button {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    border: none;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: transform 0.15s;
  }

  .confirm-btns button:active { transform: scale(0.97); }

  .btn-cancel {
    background: var(--card);
    border: 1px solid var(--border) !important;
    color: var(--muted);
  }

  .btn-delete {
    background: var(--accent2);
    color: #fff;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .bim-photo {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    display: block;
    background: var(--surface);
  }

  .bim-photo-placeholder {
    width: 100%;
    aspect-ratio: 4/3;
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: var(--border);
  }

  .bim-info {
    padding: 10px 12px;
  }

  .bim-number {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 2px;
    line-height: 1;
    margin-bottom: 4px;
  }

  .bim-meta {
    font-size: 10px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    line-height: 1.6;
  }

  .bim-line-badge {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-align: center;
    line-height: 18px;
    color: #fff;
    margin-right: 4px;
  }

  .bim-count-badge {
    float: right;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2px 7px;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: var(--accent);
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--muted);
    font-size: 13px;
    line-height: 2;
    grid-column: 1/-1;
  }

  .empty-state .big {
    font-size: 40px;
    display: block;
    margin-bottom: 8px;
  }

  /* Install banner */
  .install-banner {
    background: var(--surface);
    border: 1px solid var(--accent);
    border-radius: 16px;
    padding: 14px 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: fadeIn 0.4s ease;
  }

  .install-banner .icon { font-size: 28px; flex-shrink: 0; }

  .install-banner .text { flex: 1; font-size: 12px; color: var(--muted); line-height: 1.5; }
  .install-banner .text strong { color: var(--text); font-size: 13px; display: block; }

  .install-btn {
    background: var(--accent);
    color: #0d0f14;
    border: none;
    border-radius: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    padding: 8px 12px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .dismiss-btn {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 18px;
    cursor: pointer;
    padding: 0 0 0 4px;
    flex-shrink: 0;
  }

  /* Bottom nav */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(13,15,20,0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-around;
    padding: 10px 0 max(10px, env(safe-area-inset-bottom));
    z-index: 50;
  }

  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 20px;
    color: var(--muted);
    transition: color 0.2s;
    font-size: 20px;
  }

  .nav-btn.active { color: var(--accent); }

  .nav-btn span {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* Screens */
  .screen { display: none; }
  .screen.active { display: block; }
</style>
</head>
<body>

<div class="wrap">
  <div class="install-banner" id="installBanner" style="display:none">
    <div class="icon">🚃</div>
    <div class="text">
      <strong>Als App installieren</strong>
      Zum Homescreen hinzufügen für echtes App-Feeling
    </div>
    <button class="install-btn" id="installBtn">Installieren</button>
    <button class="dismiss-btn" onclick="document.getElementById('installBanner').style.display='none'">×</button>
  </div>

  <header>
    <div class="logo">
      <span>LINZ</span>
      BimDex
    </div>
    <div class="stats-pill">
      <div class="num" id="totalCount">0</div>
      <div class="label">Gefunden</div>
    </div>
  </header>

  <!-- SCAN SCREEN -->
  <div class="screen active" id="screen-scan">

    <div class="progress-section">
      <div class="progress-header">
        <div class="progress-title">Sammelfortschritt</div>
        <div class="progress-pct" id="progressPct">0%</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill" style="width:0%"></div>
      </div>
    </div>

    <div class="scan-area" id="scanArea">
      <input type="file" accept="image/*" id="photoInput">
      <img class="photo-preview" id="photoPreview" alt="Foto">
      <span class="scan-icon" id="scanIcon">📷</span>
      <div class="scan-label" id="scanLabel">Foto aufnehmen oder aus Galerie wählen</div>
    </div>

    <div class="entry-form">
      <div class="form-title">Bim eintragen</div>
      <div class="form-row">
        <div class="form-group">
          <label>Wagennummer</label>
          <input type="number" id="inputNumber" placeholder="z.B. 012" min="1" max="999">
        </div>
        <div class="form-group">
          <label>Linie</label>
          <select id="inputLine">
            <option value="">–</option>
            <option value="1">Linie 1</option>
            <option value="2">Linie 2</option>
            <option value="3">Linie 3</option>
            <option value="4">Linie 4</option>
          </select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label>Ort / Haltestelle</label>
        <input type="text" id="inputLocation" placeholder="z.B. Hauptplatz">
      </div>
      <button class="btn-submit" onclick="addBim()">EINTRAGEN</button>
    </div>

  </div>

  <!-- COLLECTION SCREEN -->
  <div class="screen" id="screen-collection">

    <div class="filter-tabs" id="filterTabs">
      <div class="tab active" data-filter="all" onclick="setFilter(this)">Alle</div>
      <div class="tab" data-filter="1" onclick="setFilter(this)">Linie 1</div>
      <div class="tab" data-filter="2" onclick="setFilter(this)">Linie 2</div>
      <div class="tab" data-filter="3" onclick="setFilter(this)">Linie 3</div>
      <div class="tab" data-filter="4" onclick="setFilter(this)">Linie 4</div>
    </div>

    <div class="section-title">Meine Bims</div>
    <div class="bim-grid" id="bimGrid"></div>

  </div>

</div>

<!-- Confirm Delete Dialog -->
<div class="confirm-overlay" id="confirmOverlay">
  <div class="confirm-box">
    <div class="confirm-title">Bim löschen?</div>
    <div class="confirm-text" id="confirmText">Möchtest du diese Beobachtung wirklich löschen?</div>
    <div class="confirm-btns">
      <button class="btn-cancel" onclick="closeConfirm()">Abbrechen</button>
      <button class="btn-delete" onclick="confirmDelete()">Löschen</button>
    </div>
  </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<!-- Bottom Nav -->
<nav class="bottom-nav">
  <button class="nav-btn active" id="nav-scan" onclick="showScreen('scan')">
    📷<span>Scan</span>
  </button>
  <button class="nav-btn" id="nav-collection" onclick="showScreen('collection')">
    🗂️<span>Sammlung</span>
  </button>
</nav>

<script>
  // --- State ---
  const TOTAL_BIMS = 60; // Placeholder – anpassen wenn echte Anzahl bekannt
  let collection = JSON.parse(localStorage.getItem('bimdex') || '[]');
  let currentPhotoData = null;
  let currentFilter = 'all';

  const LINE_COLORS = { '1': '#e63946', '2': '#3b82f6', '3': '#f59e0b', '4': '#10b981' };

  // --- Init ---
  function init() {
    renderGrid();
    updateStats();
  }

  // --- Photo ---
  document.getElementById('photoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      currentPhotoData = ev.target.result;
      const preview = document.getElementById('photoPreview');
      preview.src = currentPhotoData;
      preview.style.display = 'block';
      document.getElementById('scanIcon').style.display = 'none';
      document.getElementById('scanLabel').textContent = 'Foto gewählt ✓';
    };
    reader.readAsDataURL(file);
  });

  // --- Add Bim ---
  function addBim() {
    const num = document.getElementById('inputNumber').value.trim();
    const line = document.getElementById('inputLine').value;
    const location = document.getElementById('inputLocation').value.trim();

    if (!num) {
      showToast('Wagennummer eingeben!', 'error');
      return;
    }

    const existing = collection.find(b => b.number === num);
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit' });

    const entry = {
      id: Date.now(),
      number: num,
      line: line,
      location: location,
      date: dateStr,
      photo: currentPhotoData,
      count: existing ? existing.count + 1 : 1
    };

    if (existing) {
      existing.count += 1;
      existing.date = dateStr;
      if (currentPhotoData) existing.photo = currentPhotoData;
      showToast(`Bim ${num} – schon ${existing.count}× gesehen! 🔁`, 'already');
    } else {
      collection.unshift(entry);
      showToast(`Bim ${num} neu entdeckt! 🎉`, 'new');
    }

    save();
    resetForm();
    renderGrid();
    updateStats();
  }

  function resetForm() {
    document.getElementById('inputNumber').value = '';
    document.getElementById('inputLine').value = '';
    document.getElementById('inputLocation').value = '';
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPreview').src = '';
    document.getElementById('scanIcon').style.display = 'block';
    document.getElementById('scanLabel').textContent = 'Foto aufnehmen oder auswählen';
    document.getElementById('photoInput').value = '';
    currentPhotoData = null;
  }

  // --- Render ---
  function renderGrid() {
    const grid = document.getElementById('bimGrid');
    let filtered = currentFilter === 'all'
      ? collection
      : collection.filter(b => b.line === currentFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state"><span class="big">🚃</span>Noch keine Bims hier.<br>Raus in die Stadt!</div>`;
      return;
    }

    grid.innerHTML = filtered.map(b => {
      const lineColor = LINE_COLORS[b.line] || '#6b7280';
      const lineLabel = b.line ? `<span class="bim-line-badge" style="background:${lineColor}">${b.line}</span>` : '';
      const countBadge = b.count > 1 ? `<span class="bim-count-badge">×${b.count}</span>` : '';

      const photoEl = b.photo
        ? `<img class="bim-photo" src="${b.photo}" alt="Bim ${b.number}" loading="lazy">`
        : `<div class="bim-photo-placeholder">🚃</div>`;

      return `
        <div class="bim-card">
          ${photoEl}
          <button class="bim-delete-btn" onclick="askDelete('${b.id}', '${b.number}')" title="Löschen">✕</button>
          <div class="bim-info">
            <div class="bim-number" style="color:${lineColor || 'var(--accent)'}">
              #${b.number} ${countBadge}
            </div>
            <div class="bim-meta">
              ${lineLabel}${b.line ? 'Linie ' + b.line + '<br>' : ''}
              ${b.location ? '📍 ' + b.location + '<br>' : ''}
              📅 ${b.date}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function updateStats() {
    const unique = new Set(collection.map(b => b.number)).size;
    document.getElementById('totalCount').textContent = unique;
    const pct = Math.round((unique / TOTAL_BIMS) * 100);
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressFill').style.width = pct + '%';
  }

  // --- Filter ---
  function setFilter(el) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    currentFilter = el.dataset.filter;
    renderGrid();
  }

  // --- Navigation ---
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    document.getElementById('nav-' + name).classList.add('active');
    if (name === 'collection') renderGrid();
  }

  // --- Toast ---
  function showToast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (type === 'already' ? ' already' : '') + ' show';
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  // --- Delete ---
  let pendingDeleteId = null;

  function askDelete(id, number) {
    pendingDeleteId = id;
    document.getElementById('confirmText').innerHTML = `Möchtest du <strong>Bim #${number}</strong> wirklich aus deiner Sammlung löschen?`;
    document.getElementById('confirmOverlay').classList.add('show');
  }

  function closeConfirm() {
    pendingDeleteId = null;
    document.getElementById('confirmOverlay').classList.remove('show');
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    collection = collection.filter(b => String(b.id) !== String(pendingDeleteId));
    save();
    renderGrid();
    updateStats();
    closeConfirm();
    showToast('Bim gelöscht 🗑️', 'already');
  }

  // --- Persist ---
  function save() {
    localStorage.setItem('bimdex', JSON.stringify(collection));
  }

  // PWA Install prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBanner').style.display = 'flex';
  });

  document.getElementById('installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('installBanner').style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    document.getElementById('installBanner').style.display = 'none';
  });

  init();
</script>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1">
<meta name="theme-color" content="#0B0E11">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Global Ticker</title>
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0B0E11;
    --panel:#12161B;
    --panel-2:#171C22;
    --line:#232932;
    --amber:#FFB000;
    --amber-dim:#8a6212;
    --green:#00D26A;
    --red:#FF5C5C;
    --text:#E7EAEE;
    --muted:#8B94A3;
    --muted-2:#5B6472;
    --radius:14px;
  }
  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}
  html,body{height:100%;}
  body{
    margin:0; background:var(--bg); color:var(--text);
    font-family:'Inter',sans-serif;
    padding-top:env(safe-area-inset-top);
    padding-bottom:env(safe-area-inset-bottom);
    overscroll-behavior-y:contain;
  }
  ::selection{background:var(--amber); color:#0B0E11;}
  .board{
    background-image:
      linear-gradient(var(--line) 1px, transparent 1px);
    background-size: 100% 3px;
    background-position: 0 0;
    opacity:0.035;
    position:fixed; inset:0; pointer-events:none; z-index:0;
  }
  header{
    position:sticky; top:0; z-index:10;
    background:linear-gradient(180deg, rgba(11,14,17,0.98), rgba(11,14,17,0.9));
    backdrop-filter:blur(6px);
    border-bottom:1px solid var(--line);
    padding:14px 16px 10px;
  }
  .headrow{display:flex; align-items:center; justify-content:space-between;}
  .brand{
    font-family:'Barlow Condensed', sans-serif;
    font-weight:700; font-size:26px; letter-spacing:0.14em;
    text-transform:uppercase; color:var(--text);
    display:flex; align-items:center; gap:8px;
  }
  .brand .dot{
    width:9px; height:9px; border-radius:50%;
    background:var(--muted-2);
    box-shadow:0 0 0 0 rgba(0,210,106,0);
  }
  .brand .dot.live{
    background:var(--green);
    box-shadow:0 0 8px 1px rgba(0,210,106,0.7);
    animation:pulseDot 2s infinite;
  }
  @keyframes pulseDot{
    0%,100%{opacity:1;} 50%{opacity:0.4;}
  }
  .clock{
    font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--muted);
    font-variant-numeric:tabular-nums;
  }
  .gear{
    background:none; border:1px solid var(--line); color:var(--muted);
    width:34px; height:34px; border-radius:10px; font-size:16px;
    display:flex; align-items:center; justify-content:center; cursor:pointer;
  }
  .subrow{
    display:flex; align-items:center; justify-content:space-between;
    margin-top:8px; font-size:11px; color:var(--muted-2);
    font-family:'JetBrains Mono',monospace; letter-spacing:0.03em;
  }

  main{position:relative; z-index:1; padding:14px 16px 100px; max-width:640px; margin:0 auto;}

  .add-panel{
    background:var(--panel); border:1px solid var(--line); border-radius:var(--radius);
    padding:12px; margin-bottom:16px;
  }
  .add-row{display:flex; gap:8px;}
  .add-row input[type=text]{
    flex:1; min-width:0;
    background:var(--panel-2); border:1px solid var(--line); color:var(--text);
    padding:11px 12px; border-radius:10px; font-size:15px;
    font-family:'JetBrains Mono',monospace;
  }
  .add-row input::placeholder{color:var(--muted-2); font-family:'Inter',sans-serif;}
  select{
    background:var(--panel-2); border:1px solid var(--line); color:var(--text);
    padding:11px 10px; border-radius:10px; font-size:13px; font-family:'Inter',sans-serif;
  }
  .btn{
    background:var(--amber); color:#1a1002; border:none; font-weight:600;
    padding:11px 16px; border-radius:10px; font-size:14px; cursor:pointer;
    white-space:nowrap;
  }
  .btn:active{transform:scale(0.97);}
  .btn-ghost{
    background:none; border:1px solid var(--line); color:var(--muted);
    padding:8px 12px; border-radius:8px; font-size:12px; cursor:pointer;
  }
  .hint{font-size:11px; color:var(--muted-2); margin-top:8px; line-height:1.5;}
  .hint b{color:var(--muted);}

  .toolbar{
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:10px; padding:0 2px;
  }
  .toolbar-left{display:flex; align-items:center; gap:8px; font-size:12px; color:var(--muted);}
  .toolbar select{padding:6px 8px; font-size:12px;}

  .empty{
    text-align:center; padding:60px 20px; color:var(--muted-2);
  }
  .empty .big{font-family:'Barlow Condensed',sans-serif; font-size:22px; letter-spacing:0.06em; color:var(--muted); text-transform:uppercase;}

  .card{
    background:var(--panel); border:1px solid var(--line); border-radius:var(--radius);
    padding:14px; margin-bottom:10px;
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    position:relative; overflow:hidden;
  }
  .card.stale{opacity:0.55;}
  .card .idcol{display:flex; flex-direction:column; gap:4px; min-width:0;}
  .sym-row{display:flex; align-items:center; gap:7px;}
  .sym{font-family:'JetBrains Mono',monospace; font-weight:700; font-size:16px; letter-spacing:0.02em;}
  .tag{
    font-size:9px; font-weight:700; letter-spacing:0.06em; padding:2px 6px; border-radius:5px;
    font-family:'Inter',sans-serif; text-transform:uppercase; border:1px solid var(--line); color:var(--muted);
  }
  .name{font-size:12px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;}
  .updated{font-size:10px; color:var(--muted-2); font-family:'JetBrains Mono',monospace;}

  .pricecol{text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:3px;}
  .price{
    font-family:'JetBrains Mono',monospace; font-weight:700; font-size:20px;
    font-variant-numeric:tabular-nums;
  }
  .price.up{color:var(--green);}
  .price.down{color:var(--red);}
  .price.flat{color:var(--text);}
  @keyframes flipIn{
    0%{transform:rotateX(90deg); opacity:0.2;}
    60%{transform:rotateX(-8deg); opacity:1;}
    100%{transform:rotateX(0deg); opacity:1;}
  }
  .price.flip{animation:flipIn 0.45s ease-out;}
  .chg{
    font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:500;
    padding:2px 7px; border-radius:6px; font-variant-numeric:tabular-nums;
  }
  .chg.up{color:var(--green); background:rgba(0,210,106,0.1);}
  .chg.down{color:var(--red); background:rgba(255,92,92,0.1);}
  .chg.flat{color:var(--muted); background:rgba(139,148,163,0.08);}

  .card .remove{
    position:absolute; top:6px; right:6px;
    width:22px; height:22px; border-radius:50%; border:none;
    background:transparent; color:var(--muted-2); font-size:14px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
  }
  .detail{
    display:none; margin-top:10px; padding-top:10px; border-top:1px dashed var(--line);
    font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted);
    grid-template-columns:1fr 1fr 1fr; gap:8px; width:100%;
  }
  .detail.show{display:grid;}
  .detail div b{display:block; color:var(--text); font-size:13px; margin-top:2px;}
  .card-wrap{display:flex; flex-direction:column;}
  .card-tap{display:flex; align-items:center; justify-content:space-between; width:100%; gap:10px;}

  .toast{
    position:fixed; left:50%; bottom:24px; transform:translateX(-50%);
    background:#1c1206; border:1px solid var(--amber-dim); color:var(--amber);
    padding:10px 16px; border-radius:10px; font-size:12.5px; max-width:88vw;
    box-shadow:0 8px 30px rgba(0,0,0,0.4); z-index:100; opacity:0; transition:opacity 0.25s;
    font-family:'Inter',sans-serif;
  }
  .toast.show{opacity:1;}

  .sheet-backdrop{
    position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:50;
    opacity:0; pointer-events:none; transition:opacity 0.2s;
  }
  .sheet-backdrop.show{opacity:1; pointer-events:auto;}
  .sheet{
    position:fixed; left:0; right:0; bottom:0; z-index:51;
    background:var(--panel); border-top:1px solid var(--line);
    border-radius:18px 18px 0 0; padding:18px 18px calc(18px + env(safe-area-inset-bottom));
    transform:translateY(100%); transition:transform 0.25s ease-out;
    max-height:80vh; overflow-y:auto;
  }
  .sheet.show{transform:translateY(0);}
  .sheet h3{
    font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:0.08em;
    font-size:18px; margin:0 0 14px;
  }
  .sheet label{display:block; font-size:12px; color:var(--muted); margin:14px 0 6px;}
  .sheet select, .sheet input{width:100%; padding:10px; font-size:14px;}
  .proxy-opt{
    display:flex; align-items:center; gap:10px; padding:10px; border:1px solid var(--line);
    border-radius:10px; margin-bottom:8px; cursor:pointer; font-size:13px;
  }
  .proxy-opt.active{border-color:var(--amber); background:rgba(255,176,0,0.06);}
  .proxy-opt .r{width:14px; height:14px; border-radius:50%; border:2px solid var(--muted-2); flex-shrink:0;}
  .proxy-opt.active .r{border-color:var(--amber); background:var(--amber);}
  .sheet-close{
    display:block; width:100%; margin-top:16px; background:var(--panel-2); border:1px solid var(--line);
    color:var(--text); padding:12px; border-radius:10px; font-size:14px; cursor:pointer;
  }
</style>
</head>
<body>
<div class="board"></div>

<header>
  <div class="headrow">
    <div class="brand"><span class="dot" id="liveDot"></span>Ticker</div>
    <div style="display:flex; align-items:center; gap:10px;">
      <span class="clock" id="clock">--:--:--</span>
      <button class="gear" id="settingsBtn" aria-label="Settings">&#9881;</button>
    </div>
  </div>
  <div class="subrow">
    <span id="statusText">idle</span>
    <span id="lastGlobal">never updated</span>
  </div>
</header>

<main>
  <div class="add-panel">
    <div class="add-row">
      <input type="text" id="codeInput" placeholder="Stock code, e.g. 2330 / AAPL / 600519" autocapitalize="characters" autocomplete="off">
      <select id="marketSelect">
        <option value="TW">Taiwan</option>
        <option value="US">NYSE / Nasdaq</option>
        <option value="SH">Shanghai</option>
        <option value="SZ">Shenzhen</option>
      </select>
    </div>
    <div class="add-row" style="margin-top:8px;">
      <button class="btn" id="addBtn" style="flex:1;">Add to board</button>
    </div>
    <div class="hint">Tip: type a code as-is for the market picked (e.g. <b>2330</b> + Taiwan &rarr; 2330.TW). You can also type a full symbol like <b>2330.TW</b>, <b>600519.SS</b> or <b>000001.SZ</b> directly &mdash; the market picker will be ignored.</div>
  </div>

  <div class="toolbar">
    <div class="toolbar-left">
      <span>Refresh</span>
      <select id="intervalSelect">
        <option value="15">15s</option>
        <option value="30" selected>30s</option>
        <option value="60">60s</option>
        <option value="0">Manual</option>
      </select>
    </div>
    <button class="btn-ghost" id="refreshNowBtn">Refresh now</button>
  </div>

  <div id="list"></div>
  <div class="empty" id="emptyState">
    <div class="big">Board is empty</div>
    <div style="margin-top:8px; font-size:13px;">Add a stock code above to start watching it.</div>
  </div>
</main>

<div class="sheet-backdrop" id="sheetBackdrop"></div>
<div class="sheet" id="settingsSheet">
  <h3>Settings</h3>
  <label>Data proxy (used to reach the free quote source from the browser)</label>
  <div id="proxyList"></div>
  <div class="hint" style="margin-top:6px;">These are free public relays with no sign-up. If quotes stop loading, switch to another one here.</div>
  <label style="margin-top:18px;">About this data</label>
  <div class="hint">Quotes come from a free public source (delayed roughly 15&ndash;20 minutes, matching what you asked for) and are provided as-is with no guarantee of uptime or accuracy. Not for trading decisions.</div>
  <button class="sheet-close" id="closeSheet">Done</button>
</div>

<div class="toast" id="toast"></div>

<script>
const STORAGE_KEY = 'ticker.watchlist.v1';
const PROXY_KEY = 'ticker.proxy.v1';

const PROXIES = [
  { name: 'AllOrigins', build: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}` },
  { name: 'CorsProxy.io', build: (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}` },
  { name: 'ThingProxy', build: (u) => `https://thingproxy.freeboard.io/fetch/${u}` },
];

const MARKET_SUFFIX = { TW: '.TW', US: '', SH: '.SS', SZ: '.SZ' };
const MARKET_LABEL = { TW: 'TWSE', US: 'US', SH: 'SSE', SZ: 'SZSE' };

let watchlist = loadWatchlist();
let proxyIndex = parseInt(localStorage.getItem(PROXY_KEY) || '0', 10);
let timer = null;
let lastPrices = {}; // key -> last displayed price, for flip detection

function loadWatchlist(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveWatchlist(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
}

function keyFor(item){ return item.symbol; }

function buildYahooSymbol(code, market){
  const trimmed = code.trim().toUpperCase();
  if(trimmed.includes('.')) return trimmed;
  return trimmed + (MARKET_SUFFIX[market] || '');
}

function toast(msg, ms=3200){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), ms);
}

async function fetchViaProxies(targetUrl){
  const order = [proxyIndex, ...PROXIES.map((_,i)=>i).filter(i=>i!==proxyIndex)];
  let lastErr = null;
  for(const idx of order){
    const p = PROXIES[idx];
    try{
      const res = await fetch(p.build(targetUrl), { cache: 'no-store' });
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      if(idx !== proxyIndex){
        proxyIndex = idx;
        localStorage.setItem(PROXY_KEY, String(proxyIndex));
      }
      return data;
    }catch(e){
      lastErr = e;
      continue;
    }
  }
  throw lastErr || new Error('All proxies failed');
}

async function fetchQuote(symbol){
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const data = await fetchViaProxies(url);
  const result = data && data.chart && data.chart.result && data.chart.result[0];
  if(!result) throw new Error('No data for ' + symbol);
  const meta = result.meta || {};
  const price = meta.regularMarketPrice;
  const prevClose = meta.previousClose ?? meta.chartPreviousClose;
  if(price == null || prevClose == null) throw new Error('Incomplete data for ' + symbol);
  const change = price - prevClose;
  const changePct = (change / prevClose) * 100;
  let volume = meta.regularMarketVolume;
  if(volume == null && result.indicators && result.indicators.quote && result.indicators.quote[0]){
    const vArr = result.indicators.quote[0].volume || [];
    volume = vArr.length ? vArr[vArr.length-1] : null;
  }
  return {
    symbol,
    name: meta.longName || meta.shortName || symbol,
    currency: meta.currency || '',
    price, prevClose, change, changePct,
    dayHigh: meta.regularMarketDayHigh,
    dayLow: meta.regularMarketDayLow,
    volume,
    marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000) : null,
  };
}

function fmtNum(n, digits=2){
  if(n == null || isNaN(n)) return '—';
  return Number(n).toLocaleString(undefined, {minimumFractionDigits:digits, maximumFractionDigits:digits});
}
function fmtVol(n){
  if(n == null || isNaN(n)) return '—';
  if(n >= 1e9) return (n/1e9).toFixed(2)+'B';
  if(n >= 1e6) return (n/1e6).toFixed(2)+'M';
  if(n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return String(n);
}
function fmtTime(d){
  if(!d) return '—';
  return d.toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}

function render(){
  const list = document.getElementById('list');
  const empty = document.getElementById('emptyState');
  if(watchlist.length === 0){
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = watchlist.map((item) => {
    const q = item.quote;
    const dirClass = q ? (q.change > 0 ? 'up' : q.change < 0 ? 'down' : 'flat') : 'flat';
    const arrow = q ? (q.change > 0 ? '▲' : q.change < 0 ? '▼' : '') : '';
    return `
    <div class="card-wrap">
      <div class="card ${q ? '' : 'stale'}" data-key="${item.symbol}">
        <button class="remove" data-remove="${item.symbol}" aria-label="Remove">&times;</button>
        <div class="card-tap" data-toggle="${item.symbol}">
          <div class="idcol">
            <div class="sym-row">
              <span class="sym">${item.symbol}</span>
              <span class="tag">${MARKET_LABEL[item.market] || ''}</span>
            </div>
            <div class="name">${q ? q.name : 'Loading…'}</div>
            <div class="updated">${q ? 'updated ' + fmtTime(item.updatedAt) : ''}</div>
          </div>
          <div class="pricecol">
            <div class="price ${dirClass}" id="price-${cssSafe(item.symbol)}">${q ? fmtNum(q.price) : '···'}</div>
            <div class="chg ${dirClass}">${q ? (arrow + ' ' + fmtNum(Math.abs(q.change)) + '  (' + fmtNum(Math.abs(q.changePct)) + '%)') : ''}</div>
          </div>
        </div>
        <div class="detail" id="detail-${cssSafe(item.symbol)}">
          <div>Prev close<b>${q ? fmtNum(q.prevClose) : '—'}</b></div>
          <div>Day high<b>${q ? fmtNum(q.dayHigh) : '—'}</b></div>
          <div>Day low<b>${q ? fmtNum(q.dayLow) : '—'}</b></div>
          <div>Volume<b>${q ? fmtVol(q.volume) : '—'}</b></div>
          <div>Currency<b>${q ? (q.currency || '—') : '—'}</b></div>
          <div>Market time<b>${q && q.marketTime ? fmtTime(q.marketTime) : '—'}</b></div>
        </div>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const sym = btn.getAttribute('data-remove');
      watchlist = watchlist.filter(w=>w.symbol !== sym);
      delete lastPrices[sym];
      saveWatchlist();
      render();
    });
  });
  list.querySelectorAll('[data-toggle]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const sym = el.getAttribute('data-toggle');
      const d = document.getElementById('detail-'+cssSafe(sym));
      if(d) d.classList.toggle('show');
    });
  });
}

function cssSafe(s){ return s.replace(/[^a-zA-Z0-9_-]/g,'_'); }

function flashPrice(symbol){
  const el = document.getElementById('price-'+cssSafe(symbol));
  if(!el) return;
  el.classList.remove('flip');
  void el.offsetWidth;
  el.classList.add('flip');
}

async function refreshAll(manual=false){
  if(watchlist.length === 0) return;
  document.getElementById('statusText').textContent = 'refreshing…';
  document.getElementById('liveDot').classList.remove('live');
  let anyOk = false;
  let anyErr = null;

  const results = await Promise.allSettled(watchlist.map(item => fetchQuote(item.symbol)));

  results.forEach((res, i) => {
    const item = watchlist[i];
    if(res.status === 'fulfilled'){
      const prevPrice = lastPrices[item.symbol];
      item.quote = res.value;
      item.updatedAt = new Date();
      anyOk = true;
      lastPrices[item.symbol] = res.value.price;
      if(prevPrice != null && prevPrice !== res.value.price){
        // flip handled after render, via requestAnimationFrame below
        item._justUpdated = true;
      }
    } else {
      anyErr = res.reason;
    }
  });

  render();
  requestAnimationFrame(()=>{
    watchlist.forEach(item=>{
      if(item._justUpdated){ flashPrice(item.symbol); item._justUpdated = false; }
    });
  });

  document.getElementById('lastGlobal').textContent = 'last updated ' + fmtTime(new Date());
  if(anyOk){
    document.getElementById('liveDot').classList.add('live');
    document.getElementById('statusText').textContent = 'connected';
  } else {
    document.getElementById('statusText').textContent = 'offline';
  }
  if(anyErr && manual){
    toast('Some quotes failed to load. Try a different proxy in Settings.');
  }
}

function resetTimer(){
  if(timer) clearInterval(timer);
  const secs = parseInt(document.getElementById('intervalSelect').value, 10);
  if(secs > 0){
    timer = setInterval(()=>refreshAll(false), secs * 1000);
  }
}

document.getElementById('addBtn').addEventListener('click', () => {
  const codeInput = document.getElementById('codeInput');
  const market = document.getElementById('marketSelect').value;
  const raw = codeInput.value.trim();
  if(!raw){ toast('Type a stock code first.'); return; }
  const symbol = buildYahooSymbol(raw, market);
  if(watchlist.some(w => w.symbol === symbol)){
    toast(symbol + ' is already on your board.');
    return;
  }
  watchlist.push({ symbol, market, quote:null, updatedAt:null });
  saveWatchlist();
  codeInput.value = '';
  render();
  refreshAll(true);
});
document.getElementById('codeInput').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') document.getElementById('addBtn').click();
});
document.getElementById('refreshNowBtn').addEventListener('click', ()=>refreshAll(true));
document.getElementById('intervalSelect').addEventListener('change', resetTimer);

function tickClock(){
  document.getElementById('clock').textContent = new Date().toLocaleTimeString();
}
setInterval(tickClock, 1000);
tickClock();

// Settings sheet
const sheet = document.getElementById('settingsSheet');
const backdrop = document.getElementById('sheetBackdrop');
function renderProxyList(){
  const el = document.getElementById('proxyList');
  el.innerHTML = PROXIES.map((p, i) => `
    <div class="proxy-opt ${i===proxyIndex?'active':''}" data-proxy="${i}">
      <div class="r"></div><div>${p.name}</div>
    </div>`).join('');
  el.querySelectorAll('[data-proxy]').forEach(o=>{
    o.addEventListener('click', ()=>{
      proxyIndex = parseInt(o.getAttribute('data-proxy'),10);
      localStorage.setItem(PROXY_KEY, String(proxyIndex));
      renderProxyList();
    });
  });
}
document.getElementById('settingsBtn').addEventListener('click', ()=>{
  renderProxyList();
  sheet.classList.add('show');
  backdrop.classList.add('show');
});
function closeSheet(){
  sheet.classList.remove('show');
  backdrop.classList.remove('show');
}
document.getElementById('closeSheet').addEventListener('click', closeSheet);
backdrop.addEventListener('click', closeSheet);

// init
render();
if(watchlist.length){ refreshAll(false); }
resetTimer();

if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
}
</script>
</body>
</html>

// ---------- Storage helpers ----------
const STORE_KEY = 'ticker.watchlist.v1';
const SETTINGS_KEY = 'ticker.settings.v1';

function loadWatchlist(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch(e){ return []; }
}
function saveWatchlist(list){
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}
function loadSettings(){
  try{
    return Object.assign(
      { finnhubKey: '', proxyUrl: 'https://api.allorigins.win/raw?url=', twProxy: false },
      JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
    );
  }catch(e){
    return { finnhubKey: '', proxyUrl: 'https://api.allorigins.win/raw?url=', twProxy: false };
  }
}
function saveSettings(s){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }

let watchlist = loadWatchlist();     // [{market, code}]
let settings = loadSettings();
let lastPrices = {};                 // key -> last price, for flash effect

// ---------- DOM refs ----------
const $ = (id) => document.getElementById(id);
const watchlistEl = $('watchlist');
const emptyState = $('emptyState');
const marketSelect = $('marketSelect');
const codeInput = $('codeInput');
const addBtn = $('addBtn');
const addError = $('addError');
const lastUpdatedEl = $('lastUpdated');
const autoRefreshCb = $('autoRefresh');
const refreshAllBtn = $('refreshAllBtn');

const settingsBtn = $('settingsBtn');
const settingsOverlay = $('settingsOverlay');
const closeSettings = $('closeSettings');
const saveSettingsBtn = $('saveSettings');
const finnhubKeyInput = $('finnhubKey');
const proxyUrlInput = $('proxyUrl');
const twProxyToggle = $('twProxyToggle');

// ---------- Settings UI ----------
function openSettings(){
  finnhubKeyInput.value = settings.finnhubKey;
  proxyUrlInput.value = settings.proxyUrl;
  twProxyToggle.checked = settings.twProxy;
  settingsOverlay.hidden = false;
}
settingsBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', () => settingsOverlay.hidden = true);
settingsOverlay.addEventListener('click', (e) => { if(e.target === settingsOverlay) settingsOverlay.hidden = true; });
saveSettingsBtn.addEventListener('click', () => {
  settings.finnhubKey = finnhubKeyInput.value.trim();
  settings.proxyUrl = proxyUrlInput.value.trim() || 'https://api.allorigins.win/raw?url=';
  settings.twProxy = twProxyToggle.checked;
  saveSettings(settings);
  settingsOverlay.hidden = true;
  refreshAll();
});

// ---------- Add stock ----------
addBtn.addEventListener('click', addStock);
codeInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') addStock(); });

function addStock(){
  const market = marketSelect.value;
  const raw = codeInput.value.trim();
  addError.hidden = true;
  if(!raw){ return; }
  const code = normalizeCode(market, raw);
  if(!code){
    addError.textContent = 'Please enter a valid stock code for the selected market.';
    addError.hidden = false;
    return;
  }
  if(watchlist.some(s => s.market === market && s.code === code)){
    addError.textContent = 'That stock is already on your list.';
    addError.hidden = false;
    return;
  }
  watchlist.push({ market, code });
  saveWatchlist(watchlist);
  codeInput.value = '';
  renderSkeleton();
  fetchOne(market, code);
}

function normalizeCode(market, raw){
  const v = raw.toUpperCase().replace(/\s+/g, '');
  if(market === 'US'){
    return /^[A-Z.\-]{1,10}$/.test(v) ? v : null;
  }
  // TW, SH, SZ all use numeric codes
  return /^[0-9]{4,6}$/.test(v) ? v : null;
}

// ---------- Rendering ----------
function keyFor(s){ return s.market + ':' + s.code; }

function renderSkeleton(){
  emptyState.hidden = watchlist.length > 0;
  // remove cards no longer in watchlist
  [...watchlistEl.querySelectorAll('.stock-card')].forEach(el => {
    if(!watchlist.some(s => keyFor(s) === el.dataset.key)) el.remove();
  });
  watchlist.forEach(s => {
    const key = keyFor(s);
    if(!document.querySelector(`[data-key="${CSS.escape(key)}"]`)){
      const card = document.createElement('div');
      card.className = `stock-card market-${s.market}`;
      card.dataset.key = key;
      card.innerHTML = `
        <div class="card-main">
          <div class="card-top">
            <span class="card-code">${s.code}</span>
            <span class="card-name">Loading…</span>
            <span class="card-tag">${marketLabel(s.market)}</span>
          </div>
          <div class="card-price-row">
            <span class="card-price">—</span>
            <span class="card-change">—</span>
          </div>
          <div class="card-stats"></div>
          <div class="card-error" hidden></div>
        </div>
        <div class="card-meta">
          <button class="remove-btn" aria-label="Remove">✕</button>
          <span class="card-time"></span>
        </div>
      `;
      card.querySelector('.remove-btn').addEventListener('click', () => removeStock(s));
      watchlistEl.appendChild(card);
    }
  });
}

function marketLabel(m){
  return { TW:'Taiwan', US:'US', SH:'Shanghai', SZ:'Shenzhen' }[m] || m;
}

function removeStock(s){
  watchlist = watchlist.filter(x => !(x.market === s.market && x.code === s.code));
  saveWatchlist(watchlist);
  renderSkeleton();
}

function renderQuote(s, q, errorMsg){
  const key = keyFor(s);
  const card = document.querySelector(`[data-key="${CSS.escape(key)}"]`);
  if(!card) return;
  const errEl = card.querySelector('.card-error');

  if(errorMsg){
    errEl.hidden = false;
    errEl.textContent = errorMsg;
    return;
  }
  errEl.hidden = true;

  card.querySelector('.card-name').textContent = q.name || s.code;
  card.querySelector('.card-price').textContent = fmtNum(q.price);

  const changeEl = card.querySelector('.card-change');
  const sign = q.change > 0 ? '+' : '';
  changeEl.textContent = `${sign}${fmtNum(q.change)} (${sign}${fmtNum(q.changePercent)}%)`;
  changeEl.className = 'card-change ' + (q.change > 0 ? 'up' : q.change < 0 ? 'down' : '');

  card.querySelector('.card-stats').innerHTML = `
    <span>O <b>${fmtNum(q.open)}</b></span>
    <span>H <b>${fmtNum(q.high)}</b></span>
    <span>L <b>${fmtNum(q.low)}</b></span>
    <span>Prev <b>${fmtNum(q.prevClose)}</b></span>
  `;
  card.querySelector('.card-time').textContent = q.time || '';

  // flash effect on price change
  const prev = lastPrices[key];
  if(prev !== undefined && q.price !== undefined && prev !== q.price){
    card.classList.remove('flash-up','flash-down');
    void card.offsetWidth; // reflow to restart animation
    card.classList.add(q.price > prev ? 'flash-up' : 'flash-down');
    setTimeout(() => card.classList.remove('flash-up','flash-down'), 1200);
  }
  lastPrices[key] = q.price;
}

function fmtNum(n){
  if(n === undefined || n === null || isNaN(n)) return '—';
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

// ---------- Fetching per market ----------
async function fetchOne(market, code){
  const s = { market, code };
  try{
    let q;
    if(market === 'TW') q = await fetchTaiwan(code);
    else if(market === 'US') q = await fetchUS(code);
    else if(market === 'SH') q = await fetchChina('sh', code);
    else if(market === 'SZ') q = await fetchChina('sz', code);
    renderQuote(s, q, null);
  }catch(e){
    renderQuote(s, null, e.message || 'Failed to load quote.');
  }
}

async function refreshAll(){
  if(watchlist.length === 0) return;
  await Promise.all(watchlist.map(s => fetchOne(s.market, s.code)));
  lastUpdatedEl.textContent = 'Updated ' + new Date().toLocaleTimeString();
}

// -- Taiwan (TWSE / TPEx) via mis.twse.com.tw --
async function fetchTaiwan(code){
  const bases = [`tse_${code}.tw`, `otc_${code}.tw`];
  for(const ex of bases){
    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${ex}&json=1&_=${Date.now()}`;
    const finalUrl = settings.twProxy ? settings.proxyUrl + encodeURIComponent(url) : url;
    let data;
    try{
      const res = await fetch(finalUrl);
      data = await res.json();
    }catch(e){ continue; }
    const row = data && data.msgArray && data.msgArray[0];
    if(row && row.z && row.z !== '-'){
      const price = parseFloat(row.z);
      const prevClose = parseFloat(row.y);
      return {
        name: row.n || code,
        price,
        prevClose,
        change: price - prevClose,
        changePercent: prevClose ? ((price - prevClose) / prevClose * 100) : 0,
        open: parseFloat(row.o),
        high: parseFloat(row.h),
        low: parseFloat(row.l),
        time: row.t || ''
      };
    }
  }
  throw new Error('No data found for this code on TWSE/TPEx. If this keeps happening, try enabling "proxy for Taiwan" in Settings.');
}

// -- US (NYSE / Nasdaq) via Finnhub --
async function fetchUS(code){
  if(!settings.finnhubKey){
    throw new Error('Add a free Finnhub API key in Settings to load US quotes.');
  }
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(code)}&token=${settings.finnhubKey}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Finnhub request failed (check your API key).');
  const d = await res.json();
  if(d.c === undefined || d.c === 0){
    throw new Error('No data found for this symbol.');
  }
  return {
    name: code,
    price: d.c,
    prevClose: d.pc,
    change: d.d,
    changePercent: d.dp,
    open: d.o,
    high: d.h,
    low: d.l,
    time: new Date(d.t * 1000).toLocaleTimeString()
  };
}

// -- China (Shanghai / Shenzhen) via Sina, through CORS proxy --
async function fetchChina(prefix, code){
  const target = `https://hq.sinajs.cn/list=${prefix}${code}`;
  const url = settings.proxyUrl + encodeURIComponent(target);
  const res = await fetch(url);
  if(!res.ok) throw new Error('Proxy request failed. Try a different proxy in Settings.');
  const text = await res.text();
  const match = text.match(/"(.*)"/);
  if(!match) throw new Error('No data returned. The stock code may be invalid, or the data feed is temporarily unavailable.');
  const parts = match[1].split(',');
  if(parts.length < 32) throw new Error('Unexpected data format from feed.');
  const name = parts[0] || code;
  const open = parseFloat(parts[1]);
  const prevClose = parseFloat(parts[2]);
  const price = parseFloat(parts[3]);
  const high = parseFloat(parts[4]);
  const low = parseFloat(parts[5]);
  const date = parts[30];
  const time = parts[31];
  return {
    name,
    price,
    prevClose,
    change: price - prevClose,
    changePercent: prevClose ? ((price - prevClose) / prevClose * 100) : 0,
    open, high, low,
    time: `${date} ${time}`
  };
}

// ---------- Auto refresh loop ----------
let refreshTimer = null;
function scheduleRefresh(){
  if(refreshTimer) clearInterval(refreshTimer);
  if(autoRefreshCb.checked){
    refreshTimer = setInterval(refreshAll, 20000);
  }
}
autoRefreshCb.addEventListener('change', scheduleRefresh);
refreshAllBtn.addEventListener('click', refreshAll);

// ---------- Init ----------
renderSkeleton();
refreshAll();
scheduleRefresh();

// ---------- Service worker for installability ----------
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

# Ticker — Multi-Market Stock Watch

A web app (PWA) for tracking stocks from Taiwan (TWSE/TPEx), US (NYSE/Nasdaq), and China
(Shanghai/Shenzhen) — installable on your Android phone like a regular app.

Quotes refresh every 20 seconds. This is **not millisecond real-time** — expect anywhere
from a few seconds to ~15-20 minutes of delay depending on the market and data source.

## What's in this folder
- `index.html`, `style.css`, `app.js` — the app itself
- `manifest.json`, `sw.js`, `icons/` — make it installable on Android
- No build step, no server code needed. It's just files.

## Step 1: Put it on the internet (required — phones can't install from a folder)

Easiest no-code option: **Netlify Drop**
1. Go to https://app.netlify.com/drop in a browser
2. Drag this whole folder onto the page
3. You'll get a live URL like `https://random-name-123.netlify.app`

(Alternative if you already use GitHub: create a repo, upload these files, enable
GitHub Pages in Settings → Pages. You'll get a URL like `https://yourname.github.io/repo`.)

## Step 2: Install it on your Android phone
1. Open the URL from Step 1 in **Chrome** on your phone
2. Tap the **⋮** menu → **Add to Home screen** / **Install app**
3. It now opens full-screen like a normal app, with its own icon

## Step 3: Get a free API key for US stocks
US stock data (NYSE/Nasdaq) uses Finnhub, which needs a free key:
1. Go to https://finnhub.io/register — sign up (no credit card)
2. Copy your API key from the dashboard
3. In the Ticker app, tap the **⚙ Settings** icon and paste it in

Taiwan and China data sources don't need a key.

## Notes and limitations (please read)
- **China (Shanghai/Shenzhen) data** comes from a public Chinese finance feed that doesn't
  allow direct browser access, so the app routes it through a free public CORS proxy.
  These free proxies occasionally go down or get rate-limited. If China quotes stop
  loading, open Settings and try swapping in a different proxy URL (search "public CORS
  proxy" for alternatives) — the app is built so you can just paste in a new one.
- **Taiwan data** usually works directly without a proxy. If it stops working, there's a
  toggle in Settings to route it through the same proxy as China.
- **Stock codes**: Taiwan and China use numeric codes (e.g. `2330` for TSMC, `600519` for
  Kweichow Moutai — pick Shanghai or Shenzhen depending on which exchange it's listed on).
  US uses ticker letters (e.g. `AAPL`).
- This is a personal-use tool built on free/public data sources — not suited for anything
  where stale or momentarily-unavailable data would cause real harm (e.g. active trading
  decisions with tight timing).
- Your watchlist and settings are stored only on your phone (browser local storage) —
  nothing is sent to any server other than the stock data providers themselves.

## Customizing
Everything is plain HTML/CSS/JS — no framework, no build step. Open `app.js` to change
how data is fetched, or `style.css` to change colors/layout.

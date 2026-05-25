const express = require('express');
const RSSParser = require('rss-parser');
const app = express();
const parser = new RSSParser();

const FEEDS = {
  gold: ['https://www.mining.com/feed/', 'https://kingworldnews.com/feed/'],
  silver: ['https://www.mining.com/feed/', 'https://kingworldnews.com/feed/'],
  forex: ['https://www.forexlive.com/feed/news'],
  oil: ['https://oilprice.com/rss/main'],
  crypto: ['https://cointelegraph.com/rss'],
  economy: ['https://www.forexlive.com/feed/news']
};

const KEYWORDS = {
  gold: ['gold', 'XAU', 'bullion', 'precious metals'],
  silver: ['silver', 'XAG'],
  forex: ['forex', 'dollar', 'EUR', 'USD', 'exchange rate', 'currency'],
  oil: ['oil', 'crude', 'OPEC', 'brent', 'WTI', 'petroleum'],
  crypto: ['bitcoin', 'crypto', 'ethereum', 'BTC', 'ETH', 'blockchain'],
  economy: ['economy', 'GDP', 'inflation', 'Fed', 'interest rate', 'recession']
};

const icons = { gold:'🥇', silver:'🥈', forex:'💱', oil:'🛢️', crypto:'₿', economy:'📈' };
const labels = { gold:'GOLD', silver:'SILVER', forex:'FOREX', oil:'OIL', crypto:'CRYPTO', economy:'ECONOMY' };

const prices = {
  gold: { price:3285.40, change:+12.30, percent:+0.38 },
  silver: { price:32.45, change:-0.15, percent:-0.46 },
  forex: { price:1.0842, change:+0.0023, percent:+0.21, label:'EUR/USD' },
  oil: { price:78.92, change:-1.20, percent:-1.50 },
  crypto: { price:67450, change:+1230, percent:+1.86, label:'BTC/USD' },
  economy: { price:5525, change:+18, percent:+0.33, label:'S&P 500' }
};

let news = { gold:[], silver:[], forex:[], oil:[], crypto:[], economy:[] };

async function fetchNews() {
  for (const category in FEEDS) {
    let results = [];
    for (const url of FEEDS[category]) {
      try {
        const feed = await parser.parseURL(url);
        const filtered = feed.items.filter(item => {
          const text = (item.title + ' ' + (item.contentSnippet || '')).toLowerCase();
          return KEYWORDS[category].some(kw => text.includes(kw.toLowerCase()));
        });
        results = results.concat(filtered.map(item => ({
          title: item.title, link: item.link, date: item.pubDate, source: feed.title
        })));
      } catch (err) { console.log(`Error: ${url} - ${err.message}`); }
    }
    news[category] = results.sort((a,b) => new Date(b.date) - new Date(a.date));
    console.log(`${category}: ${results.length} news found`);
  }
}

fetchNews();
setInterval(fetchNews, 5 * 60 * 1000);

app.get('/', (req, res) => {
  const priceCards = Object.keys(prices).map(cat => {
    const p = prices[cat];
    const isUp = p.change >= 0;
    const color = isUp ? '#00ff88' : '#ff4444';
    const arrow = isUp ? '▲' : '▼';
    return `<a href="/${cat}" class="price-card">
      <div class="card-icon">${icons[cat]}</div>
      <div class="card-label">${p.label || labels[cat]}</div>
      <div class="card-price" style="color:${color}">
        ${cat==='crypto' ? '$'+p.price.toLocaleString() : cat==='forex' ? p.price.toFixed(4) : '$'+p.price.toFixed(2)}
      </div>
      <div class="card-change" style="color:${color}">${arrow} ${Math.abs(p.change).toFixed(2)} (${isUp?'+':''}${p.percent.toFixed(2)}%)</div>
    </a>`;
  }).join('');

  const menuItems = Object.keys(labels).map(cat => `
    <a href="/${cat}" class="menu-item">
      ${icons[cat]} ${labels[cat]}
      <span class="news-count">${news[cat].length}</span>
    </a>`).join('');

  res.send(`<!DOCTYPE html><html><head><title>Trading News Platform</title>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#0a0a1a 0%,#0d1b2a 50%,#0a0a1a 100%);color:white;min-height:100vh}
    header{background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(240,165,0,0.3);padding:20px 40px;display:flex;align-items:center;gap:15px}
    header h1{font-size:24px;color:#f0a500;letter-spacing:2px}
    header span{font-size:13px;color:#888}
    .live-dot{width:8px;height:8px;background:#00ff88;border-radius:50%;animation:pulse 1.5s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
    .section{padding:25px 40px}
    .section-title{color:#888;font-size:11px;letter-spacing:3px;margin-bottom:15px}
    .prices-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
    .price-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;text-decoration:none;transition:all 0.3s;display:block}
    .price-card:hover{background:rgba(240,165,0,0.1);border-color:rgba(240,165,0,0.4);transform:translateY(-2px)}
    .card-icon{font-size:22px;margin-bottom:8px}
    .card-label{font-size:11px;color:#888;margin-bottom:4px}
    .card-price{font-size:15px;font-weight:bold;margin-bottom:4px}
    .card-change{font-size:12px}
    .menu-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
    .menu-item{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;text-decoration:none;color:white;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:bold;letter-spacing:1px;transition:all 0.3s}
    .menu-item:hover{background:rgba(240,165,0,0.15);border-color:#f0a500;color:#f0a500}
    .news-count{margin-left:auto;background:rgba(240,165,0,0.2);color:#f0a500;padding:2px 8px;border-radius:20px;font-size:11px}
    .latest-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .latest-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;transition:all 0.3s}
    .latest-item:hover{border-color:rgba(240,165,0,0.3)}
    .cat-tag{font-size:10px;letter-spacing:1px;color:#f0a500;margin-bottom:8px}
    .latest-item a{color:white;text-decoration:none;font-size:13px;line-height:1.5;display:block;margin-bottom:8px}
    .latest-item a:hover{color:#f0a500}
    .meta{font-size:11px;color:#555}
    footer{text-align:center;padding:20px;color:#333;font-size:12px;border-top:1px solid rgba(255,255,255,0.05)}
  </style></head><body>
  <header>
    <div class="live-dot"></div>
    <h1>📊 TRADING NEWS PLATFORM</h1>
    <span>Live market news & data</span>
  </header>
  <div class="section">
    <div class="section-title">LIVE PRICES</div>
    <div class="prices-grid">${priceCards}</div>
  </div>
  <div class="section">
    <div class="section-title">CATEGORIES</div>
    <div class="menu-grid">${menuItems}</div>
  </div>
  <div class="section">
    <div class="section-title">LATEST NEWS</div>
    <div class="latest-grid">
      ${Object.keys(news).flatMap(cat => news[cat].slice(0,2).map(item => `
        <div class="latest-item">
          <div class="cat-tag">${icons[cat]} ${labels[cat]}</div>
          <a href="${item.link}" target="_blank">${item.title}</a>
          <div class="meta">📅 ${new Date(item.date).toLocaleString()} | 📰 ${item.source}</div>
        </div>`)).join('')}
    </div>
  </div>
  <footer>Trading News Platform © 2026 | Updates every 5 minutes</footer>
  </body></html>`);
});

app.get('/:category', (req, res) => {
  const category = req.params.category;
  if (!news[category]) return res.redirect('/');
  const items = news[category];
  const p = prices[category];
  const isUp = p && p.change >= 0;
  const color = isUp ? '#00ff88' : '#ff4444';

  res.send(`<!DOCTYPE html><html><head>
  <title>${labels[category]} News</title><meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#0a0a1a 0%,#0d1b2a 50%,#0a0a1a 100%);color:white;min-height:100vh}
    header{background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(240,165,0,0.3);padding:20px 40px;display:flex;align-items:center;gap:15px}
    header h1{font-size:22px;color:#f0a500}
    .back{color:#888;text-decoration:none;font-size:13px}
    .back:hover{color:#f0a500}
    .price-banner{background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.06);padding:20px 40px;display:flex;align-items:center;gap:30px}
    .big-price{font-size:36px;font-weight:bold;color:${color}}
    .big-change{font-size:16px;color:${color}}
    .source-tag{background:rgba(240,165,0,0.1);border:1px solid rgba(240,165,0,0.2);color:#f0a500;padding:3px 10px;border-radius:20px;font-size:11px;display:inline-block;margin:0 4px 4px 0}
    .news-list{padding:30px 40px}
    .news-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-left:3px solid #f0a500;border-radius:10px;padding:18px 20px;margin-bottom:12px;transition:all 0.3s}
    .news-item:hover{background:rgba(240,165,0,0.06);transform:translateX(4px)}
    .news-item a{color:white;text-decoration:none;font-size:15px;font-weight:500;line-height:1.5;display:block;margin-bottom:8px}
    .news-item a:hover{color:#f0a500}
    .meta{display:flex;gap:15px;font-size:12px;color:#555}
    footer{text-align:center;padding:20px;color:#333;font-size:12px}
  </style></head><body>
  <header>
    <a href="/" class="back">← Back</a>
    <h1>${icons[category]} ${labels[category]} News</h1>
    <span style="color:#555;font-size:13px;margin-left:auto">${items.length} articles</span>
  </header>
  ${p ? `<div class="price-banner">
    <div>
      <div style="font-size:12px;color:#888;margin-bottom:4px">CURRENT PRICE</div>
      <div class="big-price">${category==='crypto'?'$'+p.price.toLocaleString():category==='forex'?p.price.toFixed(4):'$'+p.price.toFixed(2)}</div>
    </div>
    <div>
      <div style="font-size:12px;color:#888;margin-bottom:4px">24H CHANGE</div>
      <div class="big-change">${isUp?'▲':'▼'} ${Math.abs(p.change).toFixed(2)} (${isUp?'+':''}${p.percent.toFixed(2)}%)</div>
    </div>
    <div>
      <div style="font-size:12px;color:#888;margin-bottom:8px">NEWS SOURCES</div>
      ${[...new Set(items.map(i=>i.source))].map(s=>`<span class="source-tag">📰 ${s}</span>`).join('')}
    </div>
  </div>` : ''}
  <div class="news-list">
    ${items.length===0 ? '<p style="color:#555">No news yet. Refreshing every 5 minutes...</p>' :
      items.map(item=>`
        <div class="news-item">
          <a href="${item.link}" target="_blank">${item.title}</a>
          <div class="meta">
            <span>📅 ${new Date(item.date).toLocaleString()}</span>
            <span>📰 ${item.source}</span>
          </div>
        </div>`).join('')}
  </div>
  <footer>Trading News Platform © 2026 | Updates every 5 minutes</footer>
  </body></html>`);
});

app.listen(3000, () => {
  console.log('✅ Server started: http://localhost:3000');
});
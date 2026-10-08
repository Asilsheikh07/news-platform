# Trading News Platform

**Live market headlines in one place.** A lightweight Node.js app that pulls the latest news from trusted RSS feeds and sorts it into trading categories by keyword.

## Categories

| Category | Sources | Matched keywords |
|:--|:--|:--|
| Gold | Mining.com, King World News | gold, XAU, bullion, precious metals |
| Silver | Mining.com, King World News | silver, XAG |
| Forex | ForexLive | forex, dollar, EUR, USD, exchange rate |
| Oil | OilPrice.com | oil, crude, OPEC, Brent, WTI |
| Crypto | Cointelegraph | bitcoin, ethereum, BTC, ETH, blockchain |
| Economy | ForexLive | GDP, inflation, Fed, interest rate, recession |

## Tech stack

Node.js · Express · rss-parser · axios · cheerio

## Run locally

```bash
git clone https://github.com/Asilsheikh07/news-platform.git
cd news-platform
npm install
node index.js
```

Open http://localhost:3000 for the dashboard, or a category page such as `/gold`, `/forex` or `/crypto`.

## Author

Built by **Asil**, web developer and AI engineer.
[Instagram](https://instagram.com/asilsheikh) · [Telegram](https://t.me/asilsheikh) · [infoaurasil@gmail.com](mailto:infoaurasil@gmail.com)

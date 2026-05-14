# Autonomous Arbitrage & Leverage Trading Agent

**Crypto-Stocks** is an autonomous trading agent system designed to identify and capitalize on arbitrage opportunities across crypto exchanges and stock data providers. The system uses real-time price monitoring, leverage calculations, and AI-driven sentiment analysis to target **20-30% returns**.

**Core Strategies:**

- **Cross-Exchange Arbitrage**: Price gaps between exchanges
- **Leveraged Trading**: 5x, 10x, 20x multipliers on high-probability opportunities
- **Risk Management**: Kill switch, margin monitoring, PDT compliance
- **AI Sentiment**: Long-term analysis using Gemini 2.0 Flash

**Stack:** TypeScript, Node.js, CCXT, Drizzle ORM, PostgreSQL (Railway), OpenRouter

---

## 🏗️ Project Structure

```
/agent
├── src/
│   ├── agents/
│   │   ├── crypto/
│   │   │   ├── arbitrage.ts    # WebSocket listener (CCXT Pro)
│   │   │   ├── leverage.ts     # ROI calculator (5x, 10x, 20x)
│   │   │   └── index.ts        # Crypto agents runner
│   │   └── stocks/
│   │       ├── arbitrage.ts    # Price gap scanner (Alpha Vantage/Polygon)
│   │       ├── leverage.ts     # Margin/PDT rule tracker
│   │       ├── long-term.ts    # AI sentiment analysis
│   │       └── index.ts        # Stock agents runner
│   ├── database/
│   │   └── migrations.sql      # SQL schema for Railway
│   ├── db/
│   │   ├── schema.ts           # Drizzle ORM schema
│   │   └── index.ts            # Database connection
│   └── index.ts                # Main entry point
├── package.json
└── drizzle.config.ts
```

---

## 📊 Database Schema

The system uses **4 core tables** on Railway PostgreSQL:

### 1. `market_depth`

Real-time pricing data from exchanges and data providers

- Exchange name, symbol, best bid/ask, timestamp
- Indexes on symbol/timestamp for fast queries

### 2. `leverage_opportunities`

Detected arbitrage opportunities with leverage calculations

- Asset type (crypto/stock), price gap %, leverage multiplier
- Projected ROI after fees, status tracking

### 3. `risk_management`

Kill switch and performance tracking (singleton table)

- Consecutive losses counter
- Total P/L, win rate, kill switch status
- Auto-activates after 3 losses in 24 hours

### 4. `execution_log`

History of all simulated/real trades

- Buy/sell actions, fees paid, profit/loss
- Links to opportunities for backtesting

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ (or use Docker)
- Railway PostgreSQL database
- API Keys (optional but recommended):
  - OpenRouter (for AI sentiment analysis)
  - Alpha Vantage (for stock prices)
  - Polygon.io (for stock prices)

### 2. Installation

```bash
cd agent
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Database (Railway)
DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Optional: Stock Data APIs
ALPHA_VANTAGE_API_KEY="your_key_here"
POLYGON_API_KEY="your_key_here"

# Optional: AI Analysis
OPENROUTER_API_KEY="your_key_here"

# Agent Control (default: both enabled)
RUN_CRYPTO=true
RUN_STOCKS=true
```

### 4. Database Migration

Run the SQL migration on Railway:

```bash
npm run db:migrate
```

Or manually run [agent/src/database/migrations.sql](agent/src/database/migrations.sql) in Railway's PostgreSQL console.

### 5. Run the Agents

**Run all agents:**

```bash
npm run dev
```

**Run crypto only:**

```bash
npm run run:crypto
```

**Run stocks only:**

```bash
npm run run:stocks
```

---

## 🎯 How It Works

### Crypto Agents

**Arbitrage Agent:**

- Monitors BTC/USDT on Coinbase & Kraken via WebSocket
- Detects price gaps between exchanges
- Logs data to `market_depth` table every tick

**Leverage Agent:**

- Scans `market_depth` every 10 seconds
- Calculates ROI with 5x, 10x, 20x leverage
- Logs opportunities hitting 20-30% target (after 0.2% fees)
- Respects kill switch (3 losses in 24h)

### Stock Agents

**Arbitrage Agent:**

- Polls Alpha Vantage & Polygon every 60 seconds
- Detects price gaps between data providers
- Logs data for top stocks (AAPL, MSFT, GOOGL, TSLA, NVDA)

**Leverage Agent:**

- Scans for stock arbitrage opportunities
- Enforces PDT rules (Pattern Day Trader)
  - Accounts <$25k: Max 3 day trades per 5 days, 2x leverage
  - Accounts ≥$25k: Unlimited day trades, 4x leverage
- Calculates ROI with available leverage

**Long-Term Agent:**

- AI-driven sentiment analysis (Gemini 2.0 Flash)
- Analyzes market trends, fundamentals, technical indicators
- Provides buy/sell/hold recommendations
- Runs every hour for configured symbols

---

## ⚠️ Risk Management

### Kill Switch

Automatically triggered when:

- **3 consecutive losses** within 24 hours
- Prevents further opportunity logging
- Must be manually reset after review

### Margin Protection

- Real-time liquidation price monitoring (planned)
- Slippage checks before execution
- Position sizing based on account balance

### Simulated Trading

All trades are **simulated by default** for safety:

- Logs to `execution_log` table
- No real money at risk
- Perfect for backtesting and validation

---

## 📈 Deployment (Raspberry Pi)

### 1. Setup on Raspberry Pi

```bash
# Clone the repository
git clone git@github.com:ChrisForti/crypto-stocks.git
cd crypto-stocks/agent

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Add your DATABASE_URL and API keys
```

### 2. Run Database Migrations

```bash
npm run db:migrate
```

### 3. Start with PM2 (Background Process)

```bash
# Install PM2 globally
npm install -g pm2

# Start all agents
pm2 start npm --name "arbitrage-agent" -- run start

# Or use tsx for development
pm2 start tsx --name "arbitrage-agent" -- src/index.ts

# View logs
pm2 logs arbitrage-agent

# Monitor status
pm2 status

# Restart
pm2 restart arbitrage-agent
```

### 4. Auto-Start on Boot

```bash
# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
# Follow the instructions printed
```

---

## 🔧 Configuration Options

### Environment Variables

| Variable                | Description                          | Required | Default |
| ----------------------- | ------------------------------------ | -------- | ------- |
| `DATABASE_URL`          | Railway PostgreSQL connection string | ✅ Yes   | -       |
| `RUN_CRYPTO`            | Enable crypto agents                 | ❌ No    | `true`  |
| `RUN_STOCKS`            | Enable stock agents                  | ❌ No    | `true`  |
| `OPENROUTER_API_KEY`    | OpenRouter API for AI analysis       | ❌ No    | -       |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage for stock prices       | ❌ No    | -       |
| `POLYGON_API_KEY`       | Polygon.io for stock prices          | ❌ No    | -       |

---

## 📊 Monitoring & Analytics

### View Statistics

The agents log all opportunities to the database. Query them:

```sql
-- View recent opportunities
SELECT * FROM leverage_opportunities
WHERE projected_roi_pct >= 20
ORDER BY created_at DESC
LIMIT 20;

-- Check kill switch status
SELECT * FROM risk_management;

-- View win rate
SELECT
  asset_type,
  COUNT(*) as total_trades,
  SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins,
  AVG(profit_loss) as avg_profit
FROM execution_log
GROUP BY asset_type;
```

### Export for AI Audit

After 48 hours of simulation:

```sql
-- Export opportunities to CSV
COPY (
  SELECT * FROM leverage_opportunities
  WHERE created_at > NOW() - INTERVAL '48 hours'
) TO '/tmp/opportunities.csv' CSV HEADER;
```

Feed this to Gemini 2.0:

> "Which of these opportunities were actually executable during high-volatility periods?"

---

## ⚠️ Disclaimer

**This software is for educational and research purposes only.**

- Trading with leverage involves **significant risk** of total capital loss
- All trades are simulated by default - no real execution
- Always test thoroughly before considering live trading
- Past performance does not guarantee future results
- Consult a financial advisor before making investment decisions

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

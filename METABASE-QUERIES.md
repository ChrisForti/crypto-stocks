# Metabase SQL Queries for Crypto-Stocks Dashboard

## 📈 1. BTC Price Trends (Line Chart)
**Chart Type:** Line Chart | X-axis: time | Y-axis: price | Series: exchange_name

```sql
SELECT 
    DATE_TRUNC('hour', timestamp) as time,
    exchange_name,
    AVG((best_bid::numeric + best_ask::numeric) / 2) as price
FROM market_depth
WHERE symbol = 'BTC/USDT'
GROUP BY DATE_TRUNC('hour', timestamp), exchange_name
ORDER BY time DESC;
```

---

## 💹 2. Crypto Arbitrage Opportunities (Bar Chart)
**Chart Type:** Bar Chart | X-axis: trade_route | Y-axis: profit_percent

```sql
WITH latest_prices AS (
  SELECT DISTINCT ON (symbol, exchange_name)
    symbol,
    exchange_name,
    best_bid::numeric as bid,
    best_ask::numeric as ask,
    timestamp
  FROM market_depth
  WHERE symbol = 'BTC/USDT'
  ORDER BY symbol, exchange_name, timestamp DESC
)
SELECT 
    'Buy ' || a.exchange_name || ' → Sell ' || b.exchange_name as trade_route,
    '$' || ROUND(b.bid - a.ask, 2) as profit_per_btc,
    ROUND(((b.bid - a.ask) / a.ask * 100)::numeric, 4) || '%' as profit_percent,
    a.ask as buy_price,
    b.bid as sell_price
FROM latest_prices a
CROSS JOIN latest_prices b
WHERE a.exchange_name < b.exchange_name
  AND b.bid > a.ask
ORDER BY (b.bid - a.ask) / a.ask DESC;
```

---

## 📊 3. Stock Prices Over Time (Line Chart)
**Chart Type:** Line Chart | X-axis: time | Y-axis: price | Series: symbol

```sql
SELECT 
    timestamp as time,
    symbol,
    (best_bid::numeric + best_ask::numeric) / 2 as price
FROM market_depth
WHERE exchange_name = 'alphavantage'
ORDER BY timestamp DESC;
```

---

## 💰 4. Latest Stock Prices (Number Cards / Table)
**Chart Type:** Number Cards or Table

```sql
SELECT 
    symbol,
    '$' || ROUND((best_bid::numeric + best_ask::numeric) / 2, 2) as current_price,
    ROUND(best_ask::numeric - best_bid::numeric, 2) as spread
FROM market_depth
WHERE exchange_name = 'alphavantage'
  AND timestamp = (
    SELECT MAX(timestamp) 
    FROM market_depth 
    WHERE exchange_name = 'alphavantage'
  )
ORDER BY symbol;
```

---

## 🔄 5. BTC Price Comparison (Latest - Table)
**Chart Type:** Table showing real-time exchange comparison

```sql
SELECT 
    exchange_name,
    '$' || ROUND(best_bid::numeric, 2) as bid,
    '$' || ROUND(best_ask::numeric, 2) as ask,
    ROUND((best_ask::numeric - best_bid::numeric) / best_bid::numeric * 100, 3) || '%' as spread_pct,
    timestamp
FROM market_depth
WHERE symbol = 'BTC/USDT'
  AND timestamp >= (SELECT MAX(timestamp) - INTERVAL '10 minutes' FROM market_depth WHERE symbol = 'BTC/USDT')
ORDER BY timestamp DESC;
```

---

## 🧠 6. AI Stock Recommendations (Table)
**Chart Type:** Table with filters on recommendation, sentiment, risk_level

```sql
SELECT 
    symbol,
    sentiment,
    confidence || '%' as confidence,
    recommendation,
    '$' || target_price as target,
    risk_level,
    time_horizon,
    LEFT(reasoning, 150) || '...' as summary,
    timestamp as analyzed
FROM sentiment_analysis
ORDER BY timestamp DESC;
```

---

## 🎨 7. Market Opportunities (Table)
**Chart Type:** Table showing craft/product opportunities

```sql
SELECT 
    craft_type,
    opportunity as product,
    price_point,
    market_sentiment,
    target_buyer_persona as target_market
FROM market_opportunities
WHERE market_sentiment IN ('Strong Growth', 'High Growth', 'Growing Demand')
ORDER BY craft_type, opportunity;
```

---

## 📅 8. Data Collection Activity (Bar Chart)
**Chart Type:** Bar Chart | X-axis: date | Y-axis: records_collected | Series: exchange_name

```sql
SELECT 
    DATE(timestamp) as date,
    exchange_name,
    COUNT(*) as records_collected
FROM market_depth
GROUP BY DATE(timestamp), exchange_name
ORDER BY date DESC, exchange_name;
```

---

## 💎 9. Market Opportunities by Type (Pie Chart)
**Chart Type:** Pie or Donut Chart

```sql
SELECT 
    craft_type,
    COUNT(*) as count
FROM market_opportunities
WHERE craft_type IS NOT NULL
GROUP BY craft_type
ORDER BY count DESC;
```

---

## 🎯 10. Top Stock Picks (Number Cards)
**Chart Type:** Number Card (create one query per metric)

**Best BUY Recommendation:**
```sql
SELECT 
    symbol || ' - ' || confidence || '% confident' as top_pick,
    '$' || target_price as target
FROM sentiment_analysis
WHERE recommendation = 'BUY'
ORDER BY confidence DESC, timestamp DESC
LIMIT 1;
```

**Best Arbitrage Opportunity:**
```sql
WITH latest_prices AS (
  SELECT DISTINCT ON (symbol, exchange_name)
    symbol, exchange_name, best_bid::numeric as bid, best_ask::numeric as ask
  FROM market_depth
  WHERE symbol = 'BTC/USDT'
  ORDER BY symbol, exchange_name, timestamp DESC
)
SELECT 
    ROUND(MAX((b.bid - a.ask) / a.ask * 100)::numeric, 3) || '%' as best_arbitrage
FROM latest_prices a
CROSS JOIN latest_prices b
WHERE a.exchange_name < b.exchange_name
  AND b.bid > a.ask;
```

**Total Records Today:**
```sql
SELECT COUNT(*) as records_today
FROM market_depth
WHERE timestamp >= CURRENT_DATE;
```

---

## 📉 11. BTC Spread Analysis Over Time (Area Chart)
**Chart Type:** Area Chart | X-axis: time | Y-axis: spread_pct | Series: exchange_name

```sql
SELECT 
    DATE_TRUNC('hour', timestamp) as time,
    exchange_name,
    AVG((best_ask::numeric - best_bid::numeric) / best_bid::numeric * 100) as spread_pct
FROM market_depth
WHERE symbol = 'BTC/USDT'
GROUP BY DATE_TRUNC('hour', timestamp), exchange_name
ORDER BY time DESC;
```

---

## 🚀 12. Bullish Stocks Count (Number Card)
**Chart Type:** Number Card

```sql
SELECT COUNT(*) as bullish_stocks
FROM sentiment_analysis
WHERE sentiment = 'bullish'
  AND recommendation = 'BUY';
```

---

## 🎨 Recommended Dashboard Layout:

### Row 1 - Key Metrics (Number Cards)
- Top Stock Pick (#10)
- Best Arbitrage % (#10)
- Records Today (#10)
- Bullish Stocks (#12)

### Row 2 - Investment Signals (Tables)
- AI Stock Recommendations (#6)
- Latest Stock Prices (#4)

### Row 3 - Arbitrage & Opportunities (Tables)
- Crypto Arbitrage Opportunities (#2)
- BTC Price Comparison (#5)

### Row 4 - Price Trends (Line Charts)
- BTC Price Trends (#1)
- Stock Prices Over Time (#3)

### Row 5 - Analysis (Pie + Area Charts)
- Market Opportunities by Type (#9)
- BTC Spread Analysis (#11)

### Row 6 - Activity Monitor (Bar Chart)
- Data Collection Activity (#8)

---

## 🔧 Tips for Metabase:

1. **Auto-refresh:** Set queries to refresh every 1-5 minutes for real-time data
2. **Filters:** Add dropdown filters for:
   - Symbol (BTC/USDT, AAPL, MSFT, etc.)
   - Date range
   - Exchange name
   - Sentiment type
3. **Conditional formatting:** Use colors for:
   - Green = BUY recommendations
   - Yellow = HOLD
   - Red = negative arbitrage
4. **Drill-through:** Link cards to detailed views
5. **Export:** Enable CSV/Excel export for analysis

---

## 📦 Database Connection String (for reference):
```
Host: zephyr.proxy.rlwy.net
Port: 35104
Database: railway
Username: postgres
Password: HkplOOTmahcgCpApJTzJMjwFsTUjTCxj
```

Full connection string:
```
postgresql://postgres:HkplOOTmahcgCpApJTzJMjwFsTUjTCxj@zephyr.proxy.rlwy.net:35104/railway
```

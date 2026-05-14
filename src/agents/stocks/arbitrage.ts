/**
 * Stock Arbitrage Agent
 *
 * Price gap scanner using Alpha Vantage and Polygon.io APIs
 * Monitors stock prices across different data providers
 * Identifies price discrepancies and potential arbitrage opportunities
 */

import { db } from "../../db";
import { marketDepth } from "../../db/schema";

interface StockPrice {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: Date;
  source: string;
}

class StockArbitrageAgent {
  private readonly ALPHA_VANTAGE_KEY: string;
  private readonly POLYGON_KEY: string;
  private readonly CHECK_INTERVAL = 60000; // 60 seconds (API rate limits)
  private readonly SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "AMD"];
  private isRunning: boolean;

  constructor() {
    this.ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || "";
    this.POLYGON_KEY = process.env.POLYGON_API_KEY || "";
    this.isRunning = false;

    if (!this.ALPHA_VANTAGE_KEY && !this.POLYGON_KEY) {
      console.warn(
        "⚠️  No API keys found. Set ALPHA_VANTAGE_API_KEY or POLYGON_API_KEY",
      );
    }
  }

  /**
   * Start monitoring stock prices
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Stock Arbitrage Agent already running");
      return;
    }

    this.isRunning = true;
    console.log("📈 Starting Stock Arbitrage Agent...");
    console.log(`   Monitoring: ${this.SYMBOLS.join(", ")}`);
    console.log(`   Update Interval: ${this.CHECK_INTERVAL / 1000}s\n`);

    while (this.isRunning) {
      try {
        for (const symbol of this.SYMBOLS) {
          await this.scanSymbol(symbol);
          // Small delay between symbols to avoid rate limits
          await this.sleep(2000);
        }

        await this.sleep(this.CHECK_INTERVAL);
      } catch (error) {
        console.error("❌ Error in stock monitoring loop:", error);
        await this.sleep(this.CHECK_INTERVAL);
      }
    }
  }

  /**
   * Scan a single symbol across multiple sources
   */
  private async scanSymbol(symbol: string) {
    try {
      const prices: StockPrice[] = [];

      // Fetch from Alpha Vantage
      if (this.ALPHA_VANTAGE_KEY) {
        const avPrice = await this.fetchAlphaVantage(symbol);
        if (avPrice) prices.push(avPrice);
      }

      // Fetch from Polygon
      if (this.POLYGON_KEY) {
        const polyPrice = await this.fetchPolygon(symbol);
        if (polyPrice) prices.push(polyPrice);
      }

      if (prices.length === 0) {
        console.log(`⚠️  No data available for ${symbol}`);
        return;
      }

      // Log prices
      for (const price of prices) {
        console.log(
          `📊 ${symbol} (${price.source}) | ` +
            `Price: $${price.price.toFixed(2)} | ` +
            `Bid: $${price.bid.toFixed(2)} | ` +
            `Ask: $${price.ask.toFixed(2)}`,
        );

        // Store in database
        await this.storePrice(price);
      }

      // Detect price gaps between sources
      if (prices.length > 1) {
        await this.detectPriceGap(symbol, prices);
      }
    } catch (error) {
      console.error(`Error scanning ${symbol}:`, error);
    }
  }

  /**
   * Fetch price from Alpha Vantage
   */
  private async fetchAlphaVantage(symbol: string): Promise<StockPrice | null> {
    try {
      const url =
        `https://www.alphavantage.co/query?` +
        `function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data["Global Quote"]) {
        const quote = data["Global Quote"];
        const price = parseFloat(quote["05. price"] || "0");
        const volume = parseInt(quote["06. volume"] || "0");

        // Alpha Vantage doesn't provide bid/ask in free tier
        // Estimate based on typical spread (0.01%)
        const spread = price * 0.0001;
        const bid = price - spread;
        const ask = price + spread;

        return {
          symbol,
          price,
          bid,
          ask,
          volume,
          timestamp: new Date(),
          source: "alphavantage",
        };
      }

      return null;
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch price from Polygon.io
   */
  private async fetchPolygon(symbol: string): Promise<StockPrice | null> {
    try {
      const url = `https://api.polygon.io/v2/last/nbbo/${symbol}?apiKey=${this.POLYGON_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        const result = data.results;
        const bid = result.P || 0; // Bid price
        const ask = result.p || 0; // Ask price
        const price = (bid + ask) / 2; // Mid price

        return {
          symbol,
          price,
          bid,
          ask,
          volume: 0, // NBBO doesn't include volume
          timestamp: new Date(result.t),
          source: "polygon",
        };
      }

      // Fallback to snapshot endpoint
      const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${this.POLYGON_KEY}`;
      const snapshotResponse = await fetch(snapshotUrl);
      const snapshotData = await snapshotResponse.json();

      if (snapshotData.ticker) {
        const ticker = snapshotData.ticker;
        const last = ticker.lastTrade?.p || 0;
        const quote = ticker.lastQuote;
        const bid = quote?.P || last;
        const ask = quote?.p || last;

        return {
          symbol,
          price: last,
          bid,
          ask,
          volume: ticker.day?.v || 0,
          timestamp: new Date(),
          source: "polygon",
        };
      }

      return null;
    } catch (error) {
      console.error(`Polygon error for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Store price in database
   */
  private async storePrice(price: StockPrice) {
    try {
      await db.insert(marketDepth).values({
        exchangeName: price.source,
        symbol: price.symbol,
        bestBid: price.bid.toString(),
        bestAsk: price.ask.toString(),
        timestamp: price.timestamp,
      });
    } catch (error) {
      console.error(`Failed to store price for ${price.symbol}:`, error);
    }
  }

  /**
   * Detect price gaps between sources
   */
  private async detectPriceGap(symbol: string, prices: StockPrice[]) {
    try {
      if (prices.length < 2) return;

      // Find min and max prices
      const minPrice = Math.min(...prices.map((p) => p.price));
      const maxPrice = Math.max(...prices.map((p) => p.price));
      const gap = maxPrice - minPrice;
      const gapPct = (gap / minPrice) * 100;

      if (gapPct > 0.1) {
        // Only log if gap > 0.1%
        const minSource = prices.find((p) => p.price === minPrice)?.source;
        const maxSource = prices.find((p) => p.price === maxPrice)?.source;

        console.log(
          `\n🎯 PRICE GAP DETECTED - ${symbol}\n` +
            `   ${minSource}: $${minPrice.toFixed(2)}\n` +
            `   ${maxSource}: $${maxPrice.toFixed(2)}\n` +
            `   Gap: ${gapPct.toFixed(4)}%\n`,
        );
      }
    } catch (error) {
      console.error(`Error detecting price gap for ${symbol}:`, error);
    }
  }

  /**
   * Add custom symbol to watch list
   */
  addSymbol(symbol: string) {
    if (!this.SYMBOLS.includes(symbol.toUpperCase())) {
      this.SYMBOLS.push(symbol.toUpperCase());
      console.log(`✅ Added ${symbol} to watch list`);
    }
  }

  /**
   * Remove symbol from watch list
   */
  removeSymbol(symbol: string) {
    const index = this.SYMBOLS.indexOf(symbol.toUpperCase());
    if (index > -1) {
      this.SYMBOLS.splice(index, 1);
      console.log(`✅ Removed ${symbol} from watch list`);
    }
  }

  /**
   * Get current watch list
   */
  getWatchList(): string[] {
    return [...this.SYMBOLS];
  }

  /**
   * Stop the agent
   */
  stop() {
    console.log("\n🛑 Stopping Stock Arbitrage Agent...");
    this.isRunning = false;
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const stockArbitrageAgent = new StockArbitrageAgent();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Received SIGINT signal");
  stockArbitrageAgent.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Received SIGTERM signal");
  stockArbitrageAgent.stop();
  process.exit(0);
});

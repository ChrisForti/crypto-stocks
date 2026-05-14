/**
 * Crypto Arbitrage Agent
 *
 * WebSocket listener using CCXT Pro for real-time price monitoring
 * Tracks BTC/USDT spreads across Coinbase and Kraken
 * Upserts data to Railway PostgreSQL market_depth table
 */

import ccxt from "ccxt";
import { db } from "../../db";
import { marketDepth } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";

interface PriceData {
  exchange: string;
  symbol: string;
  bid: number;
  ask: number;
  timestamp: Date;
}

class CryptoArbitrageAgent {
  private exchanges: Map<string, ccxt.Exchange>;
  private symbols: string[];
  private isRunning: boolean;

  constructor() {
    this.exchanges = new Map();
    this.symbols = ["BTC/USDT"];
    this.isRunning = false;
  }

  /**
   * Initialize exchanges with WebSocket support (CCXT Pro)
   */
  async initialize() {
    console.log("🚀 Initializing Crypto Arbitrage Agent...");

    try {
      // Initialize Coinbase Pro (ccxt.pro required for WebSocket)
      const coinbase = new ccxt.coinbase({
        enableRateLimit: true,
      });

      // Initialize Kraken
      const kraken = new ccxt.kraken({
        enableRateLimit: true,
      });

      this.exchanges.set("coinbase", coinbase);
      this.exchanges.set("kraken", kraken);

      console.log("✅ Exchanges initialized: Coinbase, Kraken");
    } catch (error) {
      console.error("❌ Failed to initialize exchanges:", error);
      throw error;
    }
  }

  /**
   * Watch order book for a specific exchange and symbol
   */
  private async watchOrderBook(exchangeName: string, symbol: string) {
    const exchange = this.exchanges.get(exchangeName);
    if (!exchange) {
      console.error(`Exchange ${exchangeName} not found`);
      return;
    }

    try {
      // For CCXT Pro (WebSocket), use watchOrderBook
      // For standard CCXT (REST), use fetchOrderBook in a loop
      const hasWatchOrderBook = exchange.has["watchOrderBook"];

      while (this.isRunning) {
        try {
          let orderBook;

          if (hasWatchOrderBook) {
            // WebSocket method (CCXT Pro)
            orderBook = await exchange.watchOrderBook(symbol);
          } else {
            // Fallback to REST API polling
            orderBook = await exchange.fetchOrderBook(symbol);
            // Add delay for REST API to avoid rate limits
            await this.sleep(5000); // 5 seconds between polls
          }

          if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
            const priceData: PriceData = {
              exchange: exchangeName,
              symbol: symbol,
              bid: orderBook.bids[0][0], // Best bid price
              ask: orderBook.asks[0][0], // Best ask price
              timestamp: new Date(orderBook.timestamp || Date.now()),
            };

            await this.upsertMarketDepth(priceData);

            // Log the spread
            const spread = priceData.ask - priceData.bid;
            const spreadPct = (spread / priceData.bid) * 100;
            console.log(
              `📊 ${exchangeName.toUpperCase()} ${symbol} | ` +
                `Bid: $${priceData.bid.toFixed(2)} | ` +
                `Ask: $${priceData.ask.toFixed(2)} | ` +
                `Spread: ${spreadPct.toFixed(4)}%`,
            );
          }
        } catch (innerError) {
          console.error(
            `Error watching ${exchangeName} ${symbol}:`,
            innerError,
          );
          // Wait before retrying
          await this.sleep(10000);
        }
      }
    } catch (error) {
      console.error(
        `Fatal error in watchOrderBook for ${exchangeName}:`,
        error,
      );
    }
  }

  /**
   * Upsert market depth data to database
   */
  private async upsertMarketDepth(data: PriceData) {
    try {
      await db.insert(marketDepth).values({
        exchangeName: data.exchange,
        symbol: data.symbol,
        bestBid: data.bid.toString(),
        bestAsk: data.ask.toString(),
        timestamp: data.timestamp,
      });

      // Optional: Check for arbitrage opportunities across exchanges
      await this.detectArbitrageOpportunity(data.symbol);
    } catch (error) {
      console.error("Failed to upsert market depth:", error);
    }
  }

  /**
   * Detect arbitrage opportunities by comparing prices across exchanges
   */
  private async detectArbitrageOpportunity(symbol: string) {
    try {
      // Get latest prices from all exchanges for this symbol
      const latestPrices = await db
        .select()
        .from(marketDepth)
        .where(eq(marketDepth.symbol, symbol))
        .orderBy(sql`${marketDepth.timestamp} DESC`)
        .limit(10);

      if (latestPrices.length < 2) return;

      // Find lowest ask and highest bid across exchanges
      let lowestAsk = { exchange: "", price: Infinity, timestamp: new Date() };
      let highestBid = { exchange: "", price: 0, timestamp: new Date() };

      for (const price of latestPrices) {
        const ask = parseFloat(price.bestAsk);
        const bid = parseFloat(price.bestBid);

        if (ask < lowestAsk.price) {
          lowestAsk = {
            exchange: price.exchangeName,
            price: ask,
            timestamp: price.timestamp || new Date(),
          };
        }

        if (bid > highestBid.price) {
          highestBid = {
            exchange: price.exchangeName,
            price: bid,
            timestamp: price.timestamp || new Date(),
          };
        }
      }

      // Calculate arbitrage opportunity
      if (
        highestBid.price > lowestAsk.price &&
        lowestAsk.exchange !== highestBid.exchange
      ) {
        const gap = highestBid.price - lowestAsk.price;
        const gapPct = (gap / lowestAsk.price) * 100;

        if (gapPct > 0.1) {
          // Only log if gap > 0.1%
          console.log(
            `\n🎯 ARBITRAGE OPPORTUNITY DETECTED!\n` +
              `   Buy at ${lowestAsk.exchange}: $${lowestAsk.price.toFixed(2)}\n` +
              `   Sell at ${highestBid.exchange}: $${highestBid.price.toFixed(2)}\n` +
              `   Gap: ${gapPct.toFixed(4)}%\n`,
          );
        }
      }
    } catch (error) {
      console.error("Error detecting arbitrage opportunity:", error);
    }
  }

  /**
   * Start monitoring all symbols across all exchanges
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Agent already running");
      return;
    }

    this.isRunning = true;
    console.log("🎬 Starting Crypto Arbitrage Agent...");

    const watchers: Promise<void>[] = [];

    for (const [exchangeName] of this.exchanges) {
      for (const symbol of this.symbols) {
        console.log(`👀 Watching ${exchangeName.toUpperCase()} - ${symbol}`);
        watchers.push(this.watchOrderBook(exchangeName, symbol));
      }
    }

    // Wait for all watchers (they run indefinitely)
    await Promise.all(watchers);
  }

  /**
   * Stop the agent gracefully
   */
  async stop() {
    console.log("🛑 Stopping Crypto Arbitrage Agent...");
    this.isRunning = false;

    // Close all exchange connections
    for (const [name, exchange] of this.exchanges) {
      try {
        if (exchange.close) {
          await exchange.close();
        }
        console.log(`✅ Closed ${name} connection`);
      } catch (error) {
        console.error(`Error closing ${name}:`, error);
      }
    }
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const cryptoArbitrageAgent = new CryptoArbitrageAgent();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Received SIGINT signal");
  await cryptoArbitrageAgent.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n👋 Received SIGTERM signal");
  await cryptoArbitrageAgent.stop();
  process.exit(0);
});

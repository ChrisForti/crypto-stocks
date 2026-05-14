/**
 * Stock Leverage Agent
 *
 * Margin and PDT (Pattern Day Trader) rule tracker
 * Calculates leveraged ROI for stock arbitrage opportunities
 * Enforces day trading rules and margin requirements
 */

import { db } from "../../db";
import {
  marketDepth,
  leverageOpportunities,
  executionLog,
  riskManagement,
} from "../../db/schema";
import { sql, desc, eq, gte, and } from "drizzle-orm";

interface StockOpportunity {
  symbol: string;
  buySource: string;
  sellSource: string;
  buyPrice: number;
  sellPrice: number;
  rawGapPct: number;
}

interface MarginRequirements {
  accountValue: number;
  dayTradeCount: number;
  isPDT: boolean;
  maxLeverage: number;
  canDayTrade: boolean;
  remainingDayTrades: number;
}

class StockLeverageAgent {
  private readonly FEE_PCT = 0.1; // 0.1% trading fee (typical for stocks)
  private readonly CAPITAL = 1000; // $1000 simulated capital
  private readonly MIN_ROI = 20; // Minimum 20% ROI
  private readonly MAX_ROI = 30; // Maximum 30% ROI
  private readonly PDT_THRESHOLD = 25000; // $25k PDT rule threshold
  private readonly MAX_DAY_TRADES = 3; // Max day trades in 5 days for accounts < $25k

  private isRunning: boolean;
  private checkInterval: number;
  private accountValue: number;
  private dayTradeCount: number;
  private lastResetDate: Date;

  constructor(checkIntervalSeconds = 30) {
    this.isRunning = false;
    this.checkInterval = checkIntervalSeconds * 1000;
    this.accountValue = this.CAPITAL;
    this.dayTradeCount = 0;
    this.lastResetDate = new Date();
  }

  /**
   * Start monitoring for stock leverage opportunities
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Stock Leverage Agent already running");
      return;
    }

    this.isRunning = true;
    console.log("📊 Starting Stock Leverage Agent...");
    console.log(`   Capital: $${this.CAPITAL}`);
    console.log(`   Target ROI: ${this.MIN_ROI}%-${this.MAX_ROI}%`);
    console.log(`   Fee: ${this.FEE_PCT}%`);

    const marginReq = this.getMarginRequirements();
    console.log(
      `   Account Status: ${marginReq.isPDT ? "PDT Account (>$25k)" : "Limited Day Trading"}`,
    );
    console.log(`   Max Leverage: ${marginReq.maxLeverage}x`);
    console.log(`   Day Trades Remaining: ${marginReq.remainingDayTrades}\n`);

    while (this.isRunning) {
      try {
        // Reset day trade counter every 5 business days
        this.checkDayTradeReset();

        // Check kill switch
        const canTrade = await this.checkKillSwitch();

        if (!canTrade) {
          console.log(
            "🛑 Kill Switch ACTIVE - No opportunities will be logged",
          );
          await this.sleep(this.checkInterval);
          continue;
        }

        // Check margin requirements
        const marginReq = this.getMarginRequirements();

        if (!marginReq.canDayTrade) {
          console.log("⚠️  Day trade limit reached. Waiting for reset...");
          await this.sleep(this.checkInterval);
          continue;
        }

        // Find stock arbitrage opportunities
        const opportunities = await this.findStockOpportunities();

        if (opportunities.length > 0) {
          console.log(
            `\n🔍 Found ${opportunities.length} stock opportunity(ies)\n`,
          );

          for (const opp of opportunities) {
            await this.evaluateLeverage(opp, marginReq);
          }
        }

        await this.sleep(this.checkInterval);
      } catch (error) {
        console.error("❌ Error in stock leverage monitoring loop:", error);
        await this.sleep(this.checkInterval);
      }
    }
  }

  /**
   * Get current margin requirements and PDT status
   */
  private getMarginRequirements(): MarginRequirements {
    const isPDT = this.accountValue >= this.PDT_THRESHOLD;
    const maxLeverage = isPDT ? 4 : 2; // 4x for PDT accounts, 2x for cash accounts
    const remainingDayTrades = isPDT
      ? 999
      : Math.max(0, this.MAX_DAY_TRADES - this.dayTradeCount);
    const canDayTrade = isPDT || this.dayTradeCount < this.MAX_DAY_TRADES;

    return {
      accountValue: this.accountValue,
      dayTradeCount: this.dayTradeCount,
      isPDT,
      maxLeverage,
      canDayTrade,
      remainingDayTrades,
    };
  }

  /**
   * Check if day trade counter should reset (every 5 business days)
   */
  private checkDayTradeReset() {
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - this.lastResetDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Reset every 5 days (simplified - should account for business days)
    if (daysDiff >= 5) {
      const oldCount = this.dayTradeCount;
      this.dayTradeCount = 0;
      this.lastResetDate = now;

      if (oldCount > 0) {
        console.log(`🔄 Day trade counter reset (was ${oldCount})\n`);
      }
    }
  }

  /**
   * Check kill switch status
   */
  private async checkKillSwitch(): Promise<boolean> {
    try {
      const [risk] = await db.select().from(riskManagement).limit(1);

      if (!risk) {
        await db.insert(riskManagement).values({
          killSwitchActive: false,
          consecutiveLosses: 0,
          totalSimulatedTrades: 0,
          totalWins: 0,
          totalLosses: 0,
        });
        return true;
      }

      return !risk.killSwitchActive;
    } catch (error) {
      console.error("Error checking kill switch:", error);
      return false;
    }
  }

  /**
   * Find stock arbitrage opportunities
   */
  private async findStockOpportunities(): Promise<StockOpportunity[]> {
    try {
      // Get recent market depth data for stocks (last 2 minutes)
      const recentData = await db
        .select()
        .from(marketDepth)
        .where(
          and(
            gte(marketDepth.timestamp, sql`NOW() - INTERVAL '2 minutes'`),
            // Filter for stock data sources
            sql`${marketDepth.exchangeName} IN ('alphavantage', 'polygon')`,
          ),
        )
        .orderBy(desc(marketDepth.timestamp));

      if (recentData.length < 2) {
        return [];
      }

      // Group by symbol
      const bySymbol = new Map<string, typeof recentData>();
      for (const data of recentData) {
        if (!bySymbol.has(data.symbol)) {
          bySymbol.set(data.symbol, []);
        }
        bySymbol.get(data.symbol)!.push(data);
      }

      const opportunities: StockOpportunity[] = [];

      // Find price gaps for each symbol
      for (const [symbol, prices] of bySymbol) {
        const sources = new Set(prices.map((p) => p.exchangeName));

        if (sources.size < 2) continue;

        let lowestAsk = { source: "", price: Infinity };
        let highestBid = { source: "", price: 0 };

        for (const price of prices) {
          const ask = parseFloat(price.bestAsk);
          const bid = parseFloat(price.bestBid);

          if (ask < lowestAsk.price) {
            lowestAsk = { source: price.exchangeName, price: ask };
          }

          if (bid > highestBid.price) {
            highestBid = { source: price.exchangeName, price: bid };
          }
        }

        if (
          highestBid.price > lowestAsk.price &&
          lowestAsk.source !== highestBid.source
        ) {
          const gap = highestBid.price - lowestAsk.price;
          const gapPct = (gap / lowestAsk.price) * 100;

          if (gapPct > 0.05) {
            opportunities.push({
              symbol,
              buySource: lowestAsk.source,
              sellSource: highestBid.source,
              buyPrice: lowestAsk.price,
              sellPrice: highestBid.price,
              rawGapPct: parseFloat(gapPct.toFixed(4)),
            });
          }
        }
      }

      return opportunities;
    } catch (error) {
      console.error("Error finding stock opportunities:", error);
      return [];
    }
  }

  /**
   * Evaluate leverage for a stock opportunity
   */
  private async evaluateLeverage(
    opportunity: StockOpportunity,
    marginReq: MarginRequirements,
  ) {
    console.log(`📊 ${opportunity.symbol}`);
    console.log(
      `   Buy:  ${opportunity.buySource} @ $${opportunity.buyPrice.toFixed(2)}`,
    );
    console.log(
      `   Sell: ${opportunity.sellSource} @ $${opportunity.sellPrice.toFixed(2)}`,
    );
    console.log(`   Raw Gap: ${opportunity.rawGapPct}%`);
    console.log(
      `   Max Leverage: ${marginReq.maxLeverage}x (${marginReq.isPDT ? "PDT" : "Standard"})`,
    );

    // Test different leverage levels up to max
    const leverageOptions = [1, 2];
    if (marginReq.maxLeverage >= 4) {
      leverageOptions.push(4);
    }

    for (const leverage of leverageOptions) {
      const calc = this.calculateLeverageROI(opportunity.rawGapPct, leverage);

      const emoji = calc.meetsTarget ? "✅" : "❌";
      console.log(
        `   ${emoji} ${leverage}x Leverage: ${calc.projectedRoiPct.toFixed(2)}% ROI ` +
          `($${calc.projectedProfit.toFixed(2)} profit)`,
      );

      if (calc.meetsTarget) {
        await this.logOpportunity(opportunity, leverage, calc);
        this.dayTradeCount++; // Increment day trade counter
      }
    }

    console.log("");
  }

  /**
   * Calculate leveraged ROI after fees
   */
  private calculateLeverageROI(rawGapPct: number, leverage: number) {
    const leveragedReturn = rawGapPct * leverage;
    const totalFeePct = this.FEE_PCT * 2; // Buy + Sell
    const roiAfterFees = leveragedReturn - totalFeePct;
    const profit = this.CAPITAL * (roiAfterFees / 100);
    const meetsTarget =
      roiAfterFees >= this.MIN_ROI && roiAfterFees <= this.MAX_ROI;

    return {
      multiplier: leverage,
      projectedRoiPct: parseFloat(roiAfterFees.toFixed(2)),
      projectedProfit: parseFloat(profit.toFixed(2)),
      meetsTarget,
    };
  }

  /**
   * Log opportunity to database
   */
  private async logOpportunity(
    opportunity: StockOpportunity,
    leverage: number,
    calc: { projectedRoiPct: number; projectedProfit: number },
  ) {
    try {
      const [inserted] = await db
        .insert(leverageOpportunities)
        .values({
          assetType: "stock",
          symbol: opportunity.symbol,
          exchangeA: opportunity.buySource,
          exchangeB: opportunity.sellSource,
          rawGapPct: opportunity.rawGapPct.toString(),
          leverageMult: leverage,
          projectedRoiPct: calc.projectedRoiPct.toString(),
          feePct: this.FEE_PCT.toString(),
          capitalUsed: this.CAPITAL.toString(),
          status: "detected",
        })
        .returning();

      console.log(`   💾 Logged opportunity ID: ${inserted.id}`);
      console.log(
        `   📅 Day trades used: ${this.dayTradeCount}/${this.MAX_DAY_TRADES}\n`,
      );

      await this.simulateExecution(inserted.id, opportunity, calc);
    } catch (error) {
      console.error("   ❌ Failed to log opportunity:", error);
    }
  }

  /**
   * Simulate trade execution
   */
  private async simulateExecution(
    opportunityId: number,
    opportunity: StockOpportunity,
    calc: { projectedProfit: number },
  ) {
    try {
      const feePaid = this.CAPITAL * (this.FEE_PCT / 100);

      await db.insert(executionLog).values({
        opportunityId,
        action: "simulated_buy",
        exchange: opportunity.buySource,
        symbol: opportunity.symbol,
        price: opportunity.buyPrice.toString(),
        amount: (this.CAPITAL / opportunity.buyPrice).toString(),
        feePaid: feePaid.toString(),
        profitLoss: null,
        notes: `Stock simulated buy - PDT compliant`,
      });

      await db.insert(executionLog).values({
        opportunityId,
        action: "simulated_sell",
        exchange: opportunity.sellSource,
        symbol: opportunity.symbol,
        price: opportunity.sellPrice.toString(),
        amount: (this.CAPITAL / opportunity.buyPrice).toString(),
        feePaid: feePaid.toString(),
        profitLoss: calc.projectedProfit.toString(),
        notes: `Stock simulated sell - Day trade #${this.dayTradeCount}`,
      });
    } catch (error) {
      console.error("   ❌ Failed to simulate execution:", error);
    }
  }

  /**
   * Get PDT status
   */
  getPDTStatus() {
    const marginReq = this.getMarginRequirements();

    console.log("\n📋 PDT STATUS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Account Value: $${marginReq.accountValue.toFixed(2)}`);
    console.log(
      `PDT Status: ${marginReq.isPDT ? "✅ PDT Account" : "⚠️  Limited Account"}`,
    );
    console.log(`Max Leverage: ${marginReq.maxLeverage}x`);
    console.log(
      `Day Trades: ${marginReq.dayTradeCount}/${marginReq.isPDT ? "∞" : this.MAX_DAY_TRADES}`,
    );
    console.log(`Can Day Trade: ${marginReq.canDayTrade ? "✅ Yes" : "❌ No"}`);
    console.log(`Remaining: ${marginReq.remainingDayTrades} trades`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }

  /**
   * Stop the agent
   */
  stop() {
    console.log("\n🛑 Stopping Stock Leverage Agent...");
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
export const stockLeverageAgent = new StockLeverageAgent();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Received SIGINT signal");
  stockLeverageAgent.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Received SIGTERM signal");
  stockLeverageAgent.stop();
  process.exit(0);
});

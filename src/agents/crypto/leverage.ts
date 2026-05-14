/**
 * Crypto Leverage Agent
 *
 * Monitors market_depth table for price gaps
 * Calculates ROI using 5x, 10x, and 20x leverage
 * Logs opportunities that hit 20-30% ROI target after fees
 * Includes Kill Switch for risk management
 */

import { db } from "../../db";
import {
  marketDepth,
  leverageOpportunities,
  executionLog,
  riskManagement,
} from "../../db/schema";
import { sql, desc, eq, and, gte } from "drizzle-orm";

interface ArbitrageOpportunity {
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  rawGapPct: number;
}

interface LeverageCalculation {
  multiplier: number;
  projectedRoiPct: number;
  projectedProfit: number;
  meetsTarget: boolean;
}

class CryptoLeverageAgent {
  private readonly FEE_PCT = 0.2; // 0.2% trading fee
  private readonly CAPITAL = 1000; // $1000 simulated capital
  private readonly MIN_ROI = 20; // Minimum 20% ROI
  private readonly MAX_ROI = 30; // Maximum 30% ROI
  private readonly LEVERAGE_MULTIPLIERS = [5, 10, 20];
  private isRunning: boolean;
  private checkInterval: number;

  constructor(checkIntervalSeconds = 10) {
    this.isRunning = false;
    this.checkInterval = checkIntervalSeconds * 1000;
  }

  /**
   * Start monitoring for leverage opportunities
   */
  async start() {
    if (this.isRunning) {
      console.log("⚠️  Leverage Agent already running");
      return;
    }

    this.isRunning = true;
    console.log("💰 Starting Crypto Leverage Agent...");
    console.log(`   Capital: $${this.CAPITAL}`);
    console.log(`   Target ROI: ${this.MIN_ROI}%-${this.MAX_ROI}%`);
    console.log(`   Fee: ${this.FEE_PCT}%`);
    console.log(`   Leverage: ${this.LEVERAGE_MULTIPLIERS.join("x, ")}x\n`);

    while (this.isRunning) {
      try {
        // Check kill switch status
        const canTrade = await this.checkKillSwitch();

        if (!canTrade) {
          console.log(
            "🛑 Kill Switch ACTIVE - No opportunities will be logged",
          );
          await this.sleep(this.checkInterval);
          continue;
        }

        // Find arbitrage opportunities
        const opportunities = await this.findArbitrageOpportunities();

        if (opportunities.length > 0) {
          console.log(
            `\n🔍 Found ${opportunities.length} potential arbitrage gap(s)\n`,
          );

          for (const opp of opportunities) {
            await this.evaluateLeverage(opp);
          }
        }

        await this.sleep(this.checkInterval);
      } catch (error) {
        console.error("❌ Error in leverage monitoring loop:", error);
        await this.sleep(this.checkInterval);
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
        // Initialize risk management if doesn't exist
        await db.insert(riskManagement).values({
          killSwitchActive: false,
          consecutiveLosses: 0,
          totalSimulatedTrades: 0,
          totalWins: 0,
          totalLosses: 0,
        });
        return true;
      }

      if (risk.killSwitchActive) {
        console.log(`\n⚠️  KILL SWITCH ACTIVE`);
        console.log(`   Consecutive Losses: ${risk.consecutiveLosses}`);
        console.log(`   Last Loss: ${risk.lastLossTimestamp}`);
        console.log(`   Total P/L: $${risk.totalSimulatedProfit}\n`);
      }

      return !risk.killSwitchActive;
    } catch (error) {
      console.error("Error checking kill switch:", error);
      return false; // Fail safe - don't trade if can't check
    }
  }

  /**
   * Find arbitrage opportunities from market depth data
   */
  private async findArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
    try {
      // Get recent market depth data (last 30 seconds)
      const recentData = await db
        .select()
        .from(marketDepth)
        .where(gte(marketDepth.timestamp, sql`NOW() - INTERVAL '30 seconds'`))
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

      const opportunities: ArbitrageOpportunity[] = [];

      // Find arbitrage for each symbol
      for (const [symbol, prices] of bySymbol) {
        // Get unique exchanges
        const exchanges = new Set(prices.map((p) => p.exchangeName));

        if (exchanges.size < 2) continue;

        // Find lowest ask and highest bid
        let lowestAsk = { exchange: "", price: Infinity };
        let highestBid = { exchange: "", price: 0 };

        for (const price of prices) {
          const ask = parseFloat(price.bestAsk);
          const bid = parseFloat(price.bestBid);

          if (ask < lowestAsk.price) {
            lowestAsk = { exchange: price.exchangeName, price: ask };
          }

          if (bid > highestBid.price) {
            highestBid = { exchange: price.exchangeName, price: bid };
          }
        }

        // Calculate gap
        if (
          highestBid.price > lowestAsk.price &&
          lowestAsk.exchange !== highestBid.exchange
        ) {
          const gap = highestBid.price - lowestAsk.price;
          const gapPct = (gap / lowestAsk.price) * 100;

          if (gapPct > 0.05) {
            // Only consider gaps > 0.05%
            opportunities.push({
              symbol,
              buyExchange: lowestAsk.exchange,
              sellExchange: highestBid.exchange,
              buyPrice: lowestAsk.price,
              sellPrice: highestBid.price,
              rawGapPct: parseFloat(gapPct.toFixed(4)),
            });
          }
        }
      }

      return opportunities;
    } catch (error) {
      console.error("Error finding arbitrage opportunities:", error);
      return [];
    }
  }

  /**
   * Evaluate leverage for an arbitrage opportunity
   */
  private async evaluateLeverage(opportunity: ArbitrageOpportunity) {
    console.log(`📈 ${opportunity.symbol}`);
    console.log(
      `   Buy:  ${opportunity.buyExchange} @ $${opportunity.buyPrice.toFixed(2)}`,
    );
    console.log(
      `   Sell: ${opportunity.sellExchange} @ $${opportunity.sellPrice.toFixed(2)}`,
    );
    console.log(`   Raw Gap: ${opportunity.rawGapPct}%\n`);

    for (const leverage of this.LEVERAGE_MULTIPLIERS) {
      const calc = this.calculateLeverageROI(opportunity.rawGapPct, leverage);

      const emoji = calc.meetsTarget ? "✅" : "❌";
      console.log(
        `   ${emoji} ${leverage}x Leverage: ${calc.projectedRoiPct.toFixed(2)}% ROI ` +
          `($${calc.projectedProfit.toFixed(2)} profit)`,
      );

      // Log to database if meets target
      if (calc.meetsTarget) {
        await this.logOpportunity(opportunity, leverage, calc);
      }
    }

    console.log("");
  }

  /**
   * Calculate leveraged ROI after fees
   */
  private calculateLeverageROI(
    rawGapPct: number,
    leverage: number,
  ): LeverageCalculation {
    // Calculate leveraged return
    const leveragedReturn = rawGapPct * leverage;

    // Deduct fees (2 trades: buy and sell)
    const totalFeePct = this.FEE_PCT * 2;
    const roiAfterFees = leveragedReturn - totalFeePct;

    // Calculate profit in dollars
    const profit = this.CAPITAL * (roiAfterFees / 100);

    // Check if meets target
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
    opportunity: ArbitrageOpportunity,
    leverage: number,
    calc: LeverageCalculation,
  ) {
    try {
      const [inserted] = await db
        .insert(leverageOpportunities)
        .values({
          assetType: "crypto",
          symbol: opportunity.symbol,
          exchangeA: opportunity.buyExchange,
          exchangeB: opportunity.sellExchange,
          rawGapPct: opportunity.rawGapPct.toString(),
          leverageMult: leverage,
          projectedRoiPct: calc.projectedRoiPct.toString(),
          feePct: this.FEE_PCT.toString(),
          capitalUsed: this.CAPITAL.toString(),
          status: "detected",
        })
        .returning();

      console.log(`   💾 Logged opportunity ID: ${inserted.id}\n`);

      // Simulate execution (for testing)
      await this.simulateExecution(inserted.id, opportunity, calc);
    } catch (error) {
      console.error("   ❌ Failed to log opportunity:", error);
    }
  }

  /**
   * Simulate trade execution (for backtesting)
   */
  private async simulateExecution(
    opportunityId: number,
    opportunity: ArbitrageOpportunity,
    calc: LeverageCalculation,
  ) {
    try {
      // In reality, this would execute trades
      // For now, we just log to execution_log for tracking

      // Simulate buy
      await db.insert(executionLog).values({
        opportunityId,
        action: "simulated_buy",
        exchange: opportunity.buyExchange,
        symbol: opportunity.symbol,
        price: opportunity.buyPrice.toString(),
        amount: (this.CAPITAL / opportunity.buyPrice).toString(),
        feePaid: (this.CAPITAL * (this.FEE_PCT / 100)).toString(),
        profitLoss: null, // Not determined yet
        notes: `Simulated buy at ${opportunity.buyExchange}`,
      });

      // Simulate sell
      const feePaid = this.CAPITAL * (this.FEE_PCT / 100);
      const totalFees = feePaid * 2;

      await db.insert(executionLog).values({
        opportunityId,
        action: "simulated_sell",
        exchange: opportunity.sellExchange,
        symbol: opportunity.symbol,
        price: opportunity.sellPrice.toString(),
        amount: (this.CAPITAL / opportunity.buyPrice).toString(),
        feePaid: feePaid.toString(),
        profitLoss: calc.projectedProfit.toString(),
        notes: `Simulated sell at ${opportunity.sellExchange}`,
      });
    } catch (error) {
      console.error("   ❌ Failed to simulate execution:", error);
    }
  }

  /**
   * Stop the agent
   */
  stop() {
    console.log("\n🛑 Stopping Crypto Leverage Agent...");
    this.isRunning = false;
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Manually reset kill switch (use with caution)
   */
  async resetKillSwitch() {
    try {
      await db.update(riskManagement).set({
        killSwitchActive: false,
        consecutiveLosses: 0,
        updatedAt: new Date(),
      });
      console.log("✅ Kill switch reset");
    } catch (error) {
      console.error("❌ Failed to reset kill switch:", error);
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const [risk] = await db.select().from(riskManagement).limit(1);

      if (!risk) {
        console.log("No stats available yet");
        return;
      }

      const winRate =
        risk.totalSimulatedTrades > 0
          ? ((risk.totalWins / risk.totalSimulatedTrades) * 100).toFixed(2)
          : "0.00";

      console.log("\n📊 LEVERAGE AGENT STATISTICS");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`Total Trades: ${risk.totalSimulatedTrades}`);
      console.log(`Wins: ${risk.totalWins}`);
      console.log(`Losses: ${risk.totalLosses}`);
      console.log(`Win Rate: ${winRate}%`);
      console.log(`Total P/L: $${risk.totalSimulatedProfit}`);
      console.log(`Consecutive Losses: ${risk.consecutiveLosses}`);
      console.log(
        `Kill Switch: ${risk.killSwitchActive ? "🔴 ACTIVE" : "🟢 INACTIVE"}`,
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }
}

// Export singleton instance
export const cryptoLeverageAgent = new CryptoLeverageAgent();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Received SIGINT signal");
  cryptoLeverageAgent.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Received SIGTERM signal");
  cryptoLeverageAgent.stop();
  process.exit(0);
});

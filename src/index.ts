/**
 * Autonomous Arbitrage & Leverage Trading Agent
 * Main entry point - runs all crypto and stock agents
 */

import {
  cryptoArbitrageAgent,
  cryptoLeverageAgent,
} from "./agents/crypto/index.js";
import {
  stockArbitrageAgent,
  stockLeverageAgent,
  stockLongTermAgent,
} from "./agents/stocks/index.js";

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   AUTONOMOUS ARBITRAGE & LEVERAGE TRADING AGENT           ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n",
  );

  const runCrypto = process.env.RUN_CRYPTO !== "false"; // Default: true
  const runStocks = process.env.RUN_STOCKS !== "false"; // Default: true

  const agents: Promise<void>[] = [];

  try {
    if (runCrypto) {
      console.log("🔐 Crypto agents enabled");
      await cryptoArbitrageAgent.initialize();
      agents.push(cryptoArbitrageAgent.start());
      agents.push(cryptoLeverageAgent.start());
    } else {
      console.log("⏭️  Crypto agents disabled (set RUN_CRYPTO=true to enable)");
    }

    if (runStocks) {
      console.log("📊 Stock agents enabled");
      agents.push(stockArbitrageAgent.start());
      agents.push(stockLeverageAgent.start());
      agents.push(stockLongTermAgent.start());
    } else {
      console.log("⏭️  Stock agents disabled (set RUN_STOCKS=true to enable)");
    }

    if (agents.length === 0) {
      console.log(
        "\n⚠️  No agents enabled. Set RUN_CRYPTO=true or RUN_STOCKS=true",
      );
      process.exit(0);
    }

    console.log("\n✅ All agents started successfully\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Run all agents in parallel
    await Promise.all(agents);
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the main function
main();

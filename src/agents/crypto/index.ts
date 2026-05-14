/**
 * Crypto Agents Runner
 * Starts both the arbitrage watcher and leverage calculator for crypto trading
 */

import { cryptoArbitrageAgent } from "./arbitrage.js";
import { cryptoLeverageAgent } from "./leverage.js";

async function main() {
  console.log("🚀 Starting Crypto Trading Agents...\n");

  try {
    // Initialize and start arbitrage agent
    await cryptoArbitrageAgent.initialize();

    // Start both agents in parallel
    await Promise.all([
      cryptoArbitrageAgent.start(),
      cryptoLeverageAgent.start(),
    ]);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { cryptoArbitrageAgent, cryptoLeverageAgent };

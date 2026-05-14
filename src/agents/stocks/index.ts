/**
 * Stock Agents Runner
 * Starts arbitrage scanner, leverage calculator, and long-term AI analysis for stocks
 */

import { stockArbitrageAgent } from "./arbitrage.js";
import { stockLeverageAgent } from "./leverage.js";
import { stockLongTermAgent } from "./long-term.js";

async function main() {
  console.log("🚀 Starting Stock Trading Agents...\n");

  try {
    // Start all three agents in parallel
    await Promise.all([
      stockArbitrageAgent.start(),
      stockLeverageAgent.start(),
      stockLongTermAgent.start(),
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

export { stockArbitrageAgent, stockLeverageAgent, stockLongTermAgent };

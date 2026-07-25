import { Pool } from "pg";
import { config } from "dotenv";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  console.log("🔍 Checking Recent Agent Activity\n");
  console.log("═".repeat(60));

  const client = await pool.connect();

  // Check recent market depth entries (last 5 minutes)
  const recentDepth = await client.query(`
    SELECT 
      exchange_name,
      symbol,
      best_bid,
      best_ask,
      timestamp,
      NOW() - timestamp as age
    FROM market_depth
    WHERE timestamp >= NOW() - INTERVAL '5 minutes'
    ORDER BY timestamp DESC
    LIMIT 10;
  `);

  console.log("\n💹 RECENT CRYPTO PRICE DATA (Last 5 min):\n");
  if (recentDepth.rows.length > 0) {
    recentDepth.rows.forEach((row) => {
      console.log(
        `   ${row.exchange_name.toUpperCase().padEnd(10)} ${row.symbol} | Bid: $${row.best_bid} Ask: $${row.best_ask}`,
      );
      console.log(`   └─ ${Math.round(row.age.seconds)}s ago\n`);
    });
  } else {
    console.log("   ⚠️  No recent data (agents may be stopped)\n");
  }

  // Check latest sentiment analysis
  const recentSentiment = await client.query(`
    SELECT 
      symbol,
      sentiment,
      confidence,
      recommendation,
      timestamp,
      NOW() - timestamp as age
    FROM sentiment_analysis
    ORDER BY timestamp DESC
    LIMIT 5;
  `);

  console.log("═".repeat(60));
  console.log("\n🧠 LATEST AI STOCK ANALYSES:\n");
  recentSentiment.rows.forEach((row) => {
    const ageHours = Math.round(row.age.hours || row.age.seconds / 3600);
    console.log(
      `   ${row.symbol}: ${row.sentiment} (${row.confidence}% confident)`,
    );
    console.log(`   └─ ${row.recommendation} - ${ageHours}h ago\n`);
  });

  // Check total activity today
  console.log("═".repeat(60));
  console.log("\n📊 ACTIVITY TODAY:\n");

  const todayStats = await client.query(`
    SELECT 
      (SELECT COUNT(*) FROM market_depth WHERE timestamp >= CURRENT_DATE) as depth_entries,
      (SELECT COUNT(*) FROM sentiment_analysis WHERE timestamp >= CURRENT_DATE) as ai_analyses,
      (SELECT COUNT(*) FROM leverage_opportunities WHERE created_at >= CURRENT_DATE) as opportunities
  `);

  console.log(`   Crypto price checks: ${todayStats.rows[0].depth_entries}`);
  console.log(`   AI stock analyses: ${todayStats.rows[0].ai_analyses}`);
  console.log(
    `   Arbitrage opportunities: ${todayStats.rows[0].opportunities}`,
  );

  console.log("\n═".repeat(60));

  client.release();
} catch (error) {
  console.error("❌ Error:", error.message);
}

await pool.end();

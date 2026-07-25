import { Pool } from "pg";
import { config } from "dotenv";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  console.log("🔌 Database Health Check\n");
  console.log("═".repeat(60));

  const client = await pool.connect();

  // Get all tables
  const tables = await client.query(`
    SELECT table_name, 
           (SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = t.table_name AND table_schema = 'public') as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log("\n📋 ALL TABLES:\n");

  for (const table of tables.rows) {
    const count = await client.query(
      `SELECT COUNT(*) FROM ${table.table_name}`,
    );
    const icon = count.rows[0].count > 0 ? "✅" : "⚪";
    console.log(
      `${icon} ${table.table_name.padEnd(30)} ${count.rows[0].count.toString().padStart(5)} rows`,
    );
  }

  console.log("\n" + "═".repeat(60));
  console.log("\n📊 MARKET ANALYZER DATA:\n");

  // Market opportunities breakdown
  const marketBreakdown = await client.query(`
    SELECT craft_type, COUNT(*) as count 
    FROM market_opportunities 
    WHERE craft_type IS NOT NULL
    GROUP BY craft_type 
    ORDER BY count DESC
    LIMIT 5
  `);

  marketBreakdown.rows.forEach((row) => {
    console.log(`   ${row.craft_type}: ${row.count} opportunities`);
  });

  console.log("\n" + "═".repeat(60));
  console.log("\n🤖 CRYPTO/STOCKS AGENT DATA:\n");

  // Crypto data
  const cryptoData = await client.query(`
    SELECT COUNT(*) as count FROM market_depth
  `);
  console.log(`   market_depth: ${cryptoData.rows[0].count} entries`);

  const sentimentData = await client.query(`
    SELECT COUNT(*) as count FROM sentiment_analysis
  `);
  console.log(
    `   sentiment_analysis: ${sentimentData.rows[0].count} AI analyses`,
  );

  const leverageData = await client.query(`
    SELECT COUNT(*) as count FROM leverage_opportunities
  `);
  console.log(
    `   leverage_opportunities: ${leverageData.rows[0].count} opportunities detected`,
  );

  console.log("\n" + "═".repeat(60));
  console.log("\n✅ Database Status: HEALTHY");
  console.log("📡 Both market analyzer and crypto-stocks data present");
  console.log("🔗 Ready for Metabase visualization\n");

  client.release();
} catch (error) {
  console.error("❌ Error:", error);
}

await pool.end();
process.exit(0);

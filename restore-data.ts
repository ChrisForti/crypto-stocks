import { Pool } from "pg";
import { config } from "dotenv";
import { readFileSync } from "fs";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function restoreData() {
  const client = await pool.connect();

  try {
    console.log("🔄 Restoring market_opportunities data...\n");

    // Read the backup data file
    const data = readFileSync("market_restore_data.sql", "utf-8");

    // Execute the COPY command
    await client.query(data);

    console.log("✅ Data restored successfully!\n");

    // Verify
    const count = await client.query(
      "SELECT COUNT(*) FROM market_opportunities",
    );
    console.log(`📊 Total rows: ${count.rows[0].count}`);

    // Show breakdown by craft type
    const breakdown = await client.query(`
      SELECT craft_type, COUNT(*) as count 
      FROM market_opportunities 
      WHERE craft_type IS NOT NULL
      GROUP BY craft_type 
      ORDER BY count DESC
    `);

    console.log("\n📋 Breakdown by craft type:");
    breakdown.rows.forEach((row) => {
      console.log(`   ${row.craft_type}: ${row.count} opportunities`);
    });

    client.release();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  await pool.end();
}

restoreData();

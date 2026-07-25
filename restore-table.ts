import { Pool } from "pg";
import { config } from "dotenv";
import { readFileSync } from "fs";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function restore() {
  const client = await pool.connect();

  try {
    console.log("🔄 Restoring market_opportunities table...\n");

    // Create table structure
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.market_opportunities (
        id SERIAL PRIMARY KEY,
        "timestamp" timestamp without time zone DEFAULT now(),
        opportunity text NOT NULL,
        market_why text,
        material_recommendation text,
        cnc_edge text,
        target_buyer_persona text,
        craft_type text,
        hull_type text,
        construction_method text,
        length text,
        width text,
        primary_wood text,
        accent_wood text,
        finish_trend text,
        price_point text,
        market_sentiment text,
        luxury_features text,
        source_origin text
      );
    `);

    console.log("✅ Table structure restored\n");

    // Check if we need to restore data
    const count = await client.query(
      "SELECT COUNT(*) FROM market_opportunities",
    );
    console.log(`📊 Current rows: ${count.rows[0].count}\n`);

    if (count.rows[0].count === "0") {
      console.log(
        "⚠️  Table is empty. You need to restore data from backup.sql",
      );
      console.log(
        'Run: grep "COPY public.market_opportunities" -A 1000 backup.sql > market_data.txt',
      );
    } else {
      console.log("✅ Table already has data");
    }

    client.release();
  } catch (error) {
    console.error("❌ Error:", error);
  }

  await pool.end();
}

restore();

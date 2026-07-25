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
    const lines = data.split("\n");

    let inserted = 0;

    for (const line of lines) {
      // Skip COPY command and end marker
      if (line.startsWith("COPY ") || line === "\\." || line.trim() === "") {
        continue;
      }

      // Split by tab
      const fields = line.split("\t").map((f) => (f === "\\N" ? null : f));

      if (fields.length < 19) continue;

      // Insert the row
      await client.query(
        `
        INSERT INTO market_opportunities 
        (id, "timestamp", opportunity, market_why, material_recommendation, cnc_edge, 
         target_buyer_persona, craft_type, hull_type, construction_method, length, width, 
         primary_wood, accent_wood, finish_trend, price_point, market_sentiment, 
         luxury_features, source_origin)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (id) DO NOTHING
      `,
        fields,
      );

      inserted++;
    }

    console.log(`✅ Inserted ${inserted} rows\n`);

    // Verify
    const count = await client.query(
      "SELECT COUNT(*) FROM market_opportunities",
    );
    console.log(`📊 Total rows: ${count.rows[0].count}`);

    // Show breakdown by craft type
    const breakdown = await client.query(`
      SELECT craft_type, COUNT(*) as count 
      FROM market_opportunities 
      WHERE craft_type IS NOT NULL AND craft_type != 'Artisan Accessories'
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
    console.error(error);
  }

  await pool.end();
}

restoreData();

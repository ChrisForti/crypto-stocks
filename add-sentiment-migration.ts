import { Pool } from "pg";
import { config } from "dotenv";
import { readFileSync } from "fs";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    console.log("🔌 Connecting to Railway PostgreSQL...\n");

    const client = await pool.connect();
    console.log("✅ Connected!\n");

    console.log("📄 Reading migration file...");
    const sql = readFileSync("./src/database/add-sentiment-table.sql", "utf-8");

    console.log("⚡ Running migration...\n");
    await client.query(sql);

    console.log("✅ Migration completed successfully!\n");
    console.log("Created:");
    console.log("  - sentiment_analysis table");
    console.log("  - Indexes for efficient querying");
    console.log("  - latest_sentiment view\n");

    client.release();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }

  await pool.end();
  process.exit(0);
}

runMigration();

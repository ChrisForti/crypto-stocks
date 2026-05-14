import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

try {
  console.log('🔌 Testing Railway connection...\n');
  console.log(`📍 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]}\n`);
  
  // Test connection
  const client = await pool.connect();
  console.log('✅ Connected to Railway PostgreSQL!\n');
  
  // List all tables
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  console.log('📋 Tables in database:');
  tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
  
  // Check if our arbitrage tables exist
  const ourTables = ['market_depth', 'leverage_opportunities', 'risk_management', 'execution_log'];
  const existingTables = tables.rows.map(r => r.table_name);
  
  console.log('\n🔍 Arbitrage tables status:');
  ourTables.forEach(table => {
    const exists = existingTables.includes(table);
    console.log(`   ${exists ? '✅' : '❌'} ${table}`);
  });
  
  // Check row counts for all tables
  console.log('\n📊 Row counts:');
  for (const table of tables.rows) {
    try {
      const count = await client.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      console.log(`   ${table.table_name}: ${count.rows[0].count} rows`);
    } catch (e) {
      console.log(`   ${table.table_name}: ERROR`);
    }
  }
  
  // Check latest market depth entries if table exists
  if (existingTables.includes('market_depth')) {
    console.log('\n💹 Latest market_depth entries:');
    const latest = await client.query(`
      SELECT exchange_name, symbol, best_bid, best_ask, timestamp 
      FROM market_depth 
      ORDER BY timestamp DESC 
      LIMIT 5
    `);
    if (latest.rows.length === 0) {
      console.log('   ⚠️  No data yet - agents may not be writing to database');
    } else {
      latest.rows.forEach(row => {
        console.log(`   ${row.exchange_name} ${row.symbol}: $${row.best_bid} / $${row.best_ask} at ${row.timestamp}`);
      });
    }
  }
  
  client.release();
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));
  
  if (ourTables.every(t => existingTables.includes(t))) {
    console.log('✅ All arbitrage tables exist');
  } else {
    console.log('❌ Some arbitrage tables are missing - run migrations');
  }
  
} catch (error) {
  console.error('❌ Database error:', error);
  console.log('\n💡 Check:');
  console.log('   1. DATABASE_URL is set correctly in .env');
  console.log('   2. Railway database is accessible from this machine');
  console.log('   3. Connection string includes password');
}

await pool.end();
process.exit(0);

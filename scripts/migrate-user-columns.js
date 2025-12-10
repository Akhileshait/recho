const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    console.log('Running migration: add missing user columns...');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrate-add-user-columns.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('   Added the following columns to users table (if missing):');
    console.log('   - provider');
    console.log('   - provider_account_id');
    console.log('   - access_token');
    console.log('   - refresh_token');
    console.log('   - spotify_connected');
    console.log('   - spotify_access_token');
    console.log('   - spotify_refresh_token');
    console.log('   - is_online');
    console.log('   - last_seen');
    console.log('   - current_song_id');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkDatabase() {
  try {
    console.log('Checking database...\n');

    // Check users
    const usersRes = await pool.query('SELECT id, name, email, is_online FROM users LIMIT 5');
    console.log('✓ Users table:');
    console.log(`  Found ${usersRes.rows.length} users`);
    usersRes.rows.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - Online: ${u.is_online}`);
    });

    // Check friendships
    const friendshipsRes = await pool.query('SELECT COUNT(*) as count FROM friendships');
    console.log(`\n✓ Friendships table:`);
    console.log(`  Found ${friendshipsRes.rows[0].count} friendships`);

    // Check songs
    const songsRes = await pool.query('SELECT COUNT(*) as count FROM songs');
    console.log(`\n✓ Songs table:`);
    console.log(`  Found ${songsRes.rows[0].count} songs`);

    // Check history
    const historyRes = await pool.query('SELECT COUNT(*) as count FROM history');
    console.log(`\n✓ History table:`);
    console.log(`  Found ${historyRes.rows[0].count} listening history entries`);

    console.log('\n✅ Database check complete!');
  } catch (err) {
    console.error('❌ Database check failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabase();

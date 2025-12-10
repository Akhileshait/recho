const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkCovers() {
  try {
    const result = await pool.query(`
      SELECT title, artist, cover_url
      FROM songs
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log('Songs and their cover URLs:\n');
    result.rows.forEach(row => {
      const hasValidCover = row.cover_url && !row.cover_url.includes('placehold.co');
      console.log(`${hasValidCover ? '✓' : '✗'} ${row.title} - ${row.artist}`);
      console.log(`  Cover: ${row.cover_url || 'NONE'}`);
      console.log('');
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkCovers();

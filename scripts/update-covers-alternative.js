const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function updateCovers() {
  try {
    console.log('Updating album covers with alternative sources...\n');

    // Using more reliable image sources with color-coded placeholders based on genre
    const songCovers = [
      { title: 'Midnight City', artist: 'M83', cover: 'https://picsum.photos/seed/midnight-city/300/300' },
      { title: 'Starboy', artist: 'The Weeknd', cover: 'https://picsum.photos/seed/starboy/300/300' },
      { title: 'Levitating', artist: 'Dua Lipa', cover: 'https://picsum.photos/seed/levitating/300/300' },
      { title: 'Heat Waves', artist: 'Glass Animals', cover: 'https://picsum.photos/seed/heatwaves/300/300' },
      { title: 'Stay', artist: 'The Kid LAROI', cover: 'https://picsum.photos/seed/stay/300/300' },
      { title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://picsum.photos/seed/blinding-lights/300/300' },
      { title: 'Good 4 U', artist: 'Olivia Rodrigo', cover: 'https://picsum.photos/seed/good4u/300/300' },
      { title: 'Montero', artist: 'Lil Nas X', cover: 'https://picsum.photos/seed/montero/300/300' },
      { title: 'Peaches', artist: 'Justin Bieber', cover: 'https://picsum.photos/seed/peaches/300/300' },
      { title: 'Clair de Lune', artist: 'Claude Debussy', cover: 'https://picsum.photos/seed/clair-de-lune/300/300' },
      { title: 'Strobe', artist: 'deadmau5', cover: 'https://picsum.photos/seed/strobe/300/300' },
      { title: 'Sicko Mode', artist: 'Travis Scott', cover: 'https://picsum.photos/seed/sicko-mode/300/300' },
      { title: 'Bohemian Rhapsody', artist: 'Queen', cover: 'https://picsum.photos/seed/bohemian-rhapsody/300/300' },
      { title: 'Happier Than Ever', artist: 'Billie Eilish', cover: 'https://picsum.photos/seed/happier-than-ever/300/300' },
      { title: 'Sweetest Pie', artist: 'Megan Thee Stallion', cover: 'https://picsum.photos/seed/sweetest-pie/300/300' },
    ];

    let updated = 0;
    for (const song of songCovers) {
      const result = await pool.query(
        'UPDATE songs SET cover_url = $1 WHERE title = $2 AND artist = $3',
        [song.cover, song.title, song.artist]
      );
      if (result.rowCount > 0) {
        console.log(`✓ Updated: ${song.title} - ${song.artist} (${result.rowCount} row(s))`);
        updated += result.rowCount;
      }
    }

    console.log(`\n✅ Updated ${updated} songs with alternative album covers!`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateCovers();

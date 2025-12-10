const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function updateCovers() {
  try {
    console.log('Updating album covers...\n');

    const songCovers = [
      { title: 'Midnight City', artist: 'M83', cover: 'https://i.scdn.co/image/ab67616d0000b27384243a01af3c77b56fe01ab1' },
      { title: 'Starboy', artist: 'The Weeknd', cover: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452' },
      { title: 'Levitating', artist: 'Dua Lipa', cover: 'https://i.scdn.co/image/ab67616d0000b273fc2a75777e40aeea2c8c4081' },
      { title: 'Heat Waves', artist: 'Glass Animals', cover: 'https://i.scdn.co/image/ab67616d0000b2739e495fb707973f3390850eea' },
      { title: 'Stay', artist: 'The Kid LAROI', cover: 'https://i.scdn.co/image/ab67616d0000b273ab3a3f27abbd5c6affd50fab' },
      { title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
      { title: 'Good 4 U', artist: 'Olivia Rodrigo', cover: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a' },
      { title: 'Montero', artist: 'Lil Nas X', cover: 'https://i.scdn.co/image/ab67616d0000b273be82673b5f79d9658ec0a9fd' },
      { title: 'Peaches', artist: 'Justin Bieber', cover: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431' },
      { title: 'Clair de Lune', artist: 'Claude Debussy', cover: 'https://i.scdn.co/image/ab67616d0000b273dc0c0ac68bb757a3ae5495c3' },
      { title: 'Strobe', artist: 'deadmau5', cover: 'https://i.scdn.co/image/ab67616d0000b2738e40d0c33e5de4cf2a0f7e54' },
      { title: 'Sicko Mode', artist: 'Travis Scott', cover: 'https://i.scdn.co/image/ab67616d0000b273072e9faef2ef7b6db63834a3' },
      { title: 'Bohemian Rhapsody', artist: 'Queen', cover: 'https://i.scdn.co/image/ab67616d0000b2731b6a2b9d3ce4e4f2e52c7b2c' },
      { title: 'Happier Than Ever', artist: 'Billie Eilish', cover: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e' },
      { title: 'Sweetest Pie', artist: 'Megan Thee Stallion', cover: 'https://i.scdn.co/image/ab67616d0000b2735d44bc34edf9e0c7f9c6cf8f' },
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

    console.log(`\n✅ Updated ${updated} songs with album covers!`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateCovers();

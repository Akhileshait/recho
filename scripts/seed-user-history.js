const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seedUserHistory() {
  try {
    // Get the user's email from command line or use a default
    const userEmail = process.argv[2];

    if (!userEmail) {
      console.error('❌ Please provide a user email:');
      console.error('   npm run db:seed:user your-email@gmail.com');
      process.exit(1);
    }

    console.log(`Seeding history for user: ${userEmail}`);

    // Get the user
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);

    if (userRes.rows.length === 0) {
      console.error(`❌ User with email "${userEmail}" not found in database.`);
      console.error('   Please sign in first to create your account.');
      process.exit(1);
    }

    const userId = userRes.rows[0].id;
    console.log(`✓ Found user: ${userId}`);

    // Get or create songs
    const songs = [
      { title: 'Midnight City', artist: 'M83', genre: 'Electronic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { title: 'Starboy', artist: 'The Weeknd', genre: 'Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { title: 'Heat Waves', artist: 'Glass Animals', genre: 'Indie', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { title: 'Stay', artist: 'The Kid LAROI', genre: 'Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
      { title: 'Good 4 U', artist: 'Olivia Rodrigo', genre: 'Rock', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
      { title: 'Montero', artist: 'Lil Nas X', genre: 'Hip-Hop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
      { title: 'Peaches', artist: 'Justin Bieber', genre: 'R&B', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    ];

    const songIds = [];
    for (const s of songs) {
      // Check if song exists
      let existing = await pool.query(
        'SELECT id FROM songs WHERE title = $1 AND artist = $2',
        [s.title, s.artist]
      );

      if (existing.rows.length > 0) {
        songIds.push(existing.rows[0].id);
      } else {
        const res = await pool.query(
          `INSERT INTO songs (title, artist, genre, url, cover_url)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [s.title, s.artist, s.genre, s.url, 'https://placehold.co/300']
        );
        songIds.push(res.rows[0].id);
      }
    }
    console.log('✓ Songs ready');

    // Add listening history for the user
    let addedCount = 0;
    for (let i = 0; i < 6; i++) {
      const result = await pool.query(
        `INSERT INTO history (user_id, song_id, play_duration)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [userId, songIds[i], Math.floor(Math.random() * 180) + 60] // Random duration between 60-240 seconds
      );
      if (result.rows.length > 0) addedCount++;
    }
    console.log(`✓ Added ${addedCount} listening history entries`);

    // Add some likes
    let likesCount = 0;
    for (let i = 0; i < 3; i++) {
      const result = await pool.query(
        `INSERT INTO song_likes (user_id, song_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING
         RETURNING user_id`,
        [userId, songIds[i]]
      );
      if (result.rows.length > 0) likesCount++;
    }
    console.log(`✓ Added ${likesCount} liked songs`);

    console.log('\n✅ User history seeded successfully!');
    console.log('   Refresh your home page to see recommendations.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedUserHistory();

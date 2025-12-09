const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const seed = async () => {
  try {
    console.log('Seeding database...');

    // 1. Create Users
    const users = [
      { email: 'demo@example.com', name: 'Demo User', image: 'https://github.com/shadcn.png' },
      { email: 'friend1@example.com', name: 'Alice', image: 'https://placehold.co/100' },
      { email: 'friend2@example.com', name: 'Bob', image: 'https://placehold.co/100' },
    ];

    const userIds = [];
    for (const u of users) {
      const res = await pool.query(
        `INSERT INTO users (email, name, image) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET name = $2 RETURNING id`,
        [u.email, u.name, u.image]
      );
      userIds.push(res.rows[0].id);
    }
    const [demoId, aliceId, bobId] = userIds;
    console.log('✓ Users created/updated');

    // 2. Create Songs
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
       // Check if song exists first
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
    console.log('✓ Songs created/updated');

    // 3. Create History (Demo User listened to some songs)
    await pool.query(
      `INSERT INTO history (user_id, song_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [demoId, songIds[0]]
    );
    await pool.query(
      `INSERT INTO history (user_id, song_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [demoId, songIds[1]]
    );
    await pool.query(
      `INSERT INTO history (user_id, song_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [demoId, songIds[5]]
    );
    console.log('✓ History added');

    // 4. Create Friendships
    await pool.query(
      `INSERT INTO friendships (user_id, friend_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, friend_id) DO UPDATE SET status = $3`,
      [demoId, aliceId, 'accepted']
    );
    await pool.query(
      `INSERT INTO friendships (user_id, friend_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, friend_id) DO UPDATE SET status = $3`,
      [aliceId, demoId, 'accepted']
    );
    console.log('✓ Friendships created');

    // 5. Friend History (Alice listened to something else)
    await pool.query(
      `INSERT INTO history (user_id, song_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [aliceId, songIds[2]]
    );
    await pool.query(
      `INSERT INTO history (user_id, song_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [aliceId, songIds[4]]
    );
    console.log('✓ Friend history added');

    console.log('\n✅ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();

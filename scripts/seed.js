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

    // 2. Create Songs with album covers
    const songs = [
      { title: 'Midnight City', artist: 'M83', genre: 'electronic', album: 'Hurry Up, We\'re Dreaming', mood: 'energetic', duration: 243, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b27384243a01af3c77b56fe01ab1' },
      { title: 'Starboy', artist: 'The Weeknd', genre: 'pop', album: 'Starboy', mood: 'energetic', duration: 230, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452' },
      { title: 'Levitating', artist: 'Dua Lipa', genre: 'pop', album: 'Future Nostalgia', mood: 'happy', duration: 203, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b273fc2a75777e40aeea2c8c4081' },
      { title: 'Heat Waves', artist: 'Glass Animals', genre: 'indie', album: 'Dreamland', mood: 'melancholic', duration: 239, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b2739e495fb707973f3390850eea' },
      { title: 'Stay', artist: 'The Kid LAROI', genre: 'pop', album: 'F*CK LOVE 3', mood: 'sad', duration: 141, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b273ab3a3f27abbd5c6affd50fab' },
      { title: 'Blinding Lights', artist: 'The Weeknd', genre: 'pop', album: 'After Hours', mood: 'energetic', duration: 200, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
      { title: 'Good 4 U', artist: 'Olivia Rodrigo', genre: 'rock', album: 'SOUR', mood: 'energetic', duration: 178, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a' },
      { title: 'Montero', artist: 'Lil Nas X', genre: 'hip-hop', album: 'MONTERO', mood: 'energetic', duration: 137, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b273be82673b5f79d9658ec0a9fd' },
      { title: 'Peaches', artist: 'Justin Bieber', genre: 'pop', album: 'Justice', mood: 'romantic', duration: 198, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431' },
      { title: 'Clair de Lune', artist: 'Claude Debussy', genre: 'classical', album: 'Suite bergamasque', mood: 'calm', duration: 300, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b273dc0c0ac68bb757a3ae5495c3' },
      { title: 'Strobe', artist: 'deadmau5', genre: 'electronic', album: 'For Lack of a Better Name', mood: 'calm', duration: 645, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b2738e40d0c33e5de4cf2a0f7e54' },
      { title: 'Sicko Mode', artist: 'Travis Scott', genre: 'hip-hop', album: 'ASTROWORLD', mood: 'energetic', duration: 312, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b273072e9faef2ef7b6db63834a3' },
      { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'rock', album: 'A Night at the Opera', mood: 'energetic', duration: 354, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b2731b6a2b9d3ce4e4f2e52c7b2c' },
      { title: 'Happier Than Ever', artist: 'Billie Eilish', genre: 'pop', album: 'Happier Than Ever', mood: 'sad', duration: 298, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e' },
      { title: 'Sweetest Pie', artist: 'Megan Thee Stallion', genre: 'hip-hop', album: 'Traumazine', mood: 'happy', duration: 200, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', cover: 'https://i.scdn.co/image/ab67616d0000b2735d44bc34edf9e0c7f9c6cf8f' },
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
         // Update existing song with new cover
         await pool.query(
           `UPDATE songs SET cover_url = $1 WHERE id = $2`,
           [s.cover, existing.rows[0].id]
         );
       } else {
         const res = await pool.query(
           `INSERT INTO songs (title, artist, genre, album, mood, duration, url, cover_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
           [s.title, s.artist, s.genre, s.album, s.mood, s.duration, s.url, s.cover]
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

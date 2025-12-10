const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seedTestUsers() {
  try {
    console.log('Creating test users...\n');

    const testUsers = [
      { email: 'alice.music@test.com', name: 'Alice Johnson', image: 'https://i.pravatar.cc/150?img=1' },
      { email: 'bob.beats@test.com', name: 'Bob Smith', image: 'https://i.pravatar.cc/150?img=2' },
      { email: 'charlie.tunes@test.com', name: 'Charlie Brown', image: 'https://i.pravatar.cc/150?img=3' },
      { email: 'diana.melody@test.com', name: 'Diana Prince', image: 'https://i.pravatar.cc/150?img=4' },
      { email: 'evan.rhythm@test.com', name: 'Evan Williams', image: 'https://i.pravatar.cc/150?img=5' },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const user of testUsers) {
      const result = await pool.query(
        `INSERT INTO users (email, name, image, is_online)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
         SET name = $2, image = $3
         RETURNING id, (xmax = 0) as inserted`,
        [user.email, user.name, user.image, Math.random() > 0.5]
      );

      if (result.rows[0].inserted) {
        createdCount++;
        console.log(`✓ Created: ${user.name} (${user.email})`);
      } else {
        existingCount++;
        console.log(`⚠ Updated: ${user.name} (${user.email})`);
      }
    }

    console.log(`\n✅ Done!`);
    console.log(`   Created: ${createdCount} new users`);
    console.log(`   Updated: ${existingCount} existing users`);
    console.log(`\nYou can now search for these users in the Friends page:`);
    console.log(`   - Search for "alice", "bob", "charlie", etc.`);
    console.log(`   - Or search by email like "alice.music@test.com"`);
  } catch (err) {
    console.error('❌ Failed to create test users:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedTestUsers();

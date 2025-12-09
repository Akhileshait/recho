import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecommendationEngine } from '@/lib/recommendation';
import { query } from '@/lib/db';
import { usePlayerStore } from '@/store/usePlayerStore'; 
import { SongCard } from '@/components/SongCard'; // Client-side store cannot be used directly in Server Component
// We need a Client Component wrapper for the play button or pass data to a client component

// Helper to fetch data
async function getData(userId: string) {
  // 1. Get Recommendations
  const engine = new RecommendationEngine();
  const recommendationsRefs = await engine.recommend(userId);
  
  let recommendedSongs: any[] = [];
  if (recommendationsRefs.length > 0) {
      const songIds = recommendationsRefs.map(r => r.songId);
      const placeholders = songIds.map((_, i) => `$${i + 1}`).join(',');
      const res = await query(`SELECT * FROM songs WHERE id IN (${placeholders})`, songIds);
      // Sort back by recommendation score order
      recommendedSongs = songIds.map(id => res.rows.find((s: any) => s.id === id)).filter(Boolean);
  }

  // 2. Get Recently Played
  const historyRes = await query(
      `SELECT DISTINCT ON (s.id) s.*, h.played_at 
       FROM history h 
       JOIN songs s ON h.song_id = s.id 
       WHERE h.user_id = $1 
       ORDER BY s.id, h.played_at DESC 
       LIMIT 10`, 
       [userId]
  );
  const recentSongs = historyRes.rows;

  return { recommendedSongs, recentSongs };
}

// Temporary: Hardcoded User ID for Demo (The one created in seed.js)
// In real app, get from session
const DEMO_USER_EMAIL = 'demo@example.com';

export default async function Home() {
  // Fetch Demo User ID
  const userRes = await query('SELECT id FROM users WHERE email = $1', [DEMO_USER_EMAIL]);
  const userId = userRes.rows[0]?.id;

  if (!userId) {
      return <div className="p-8">Please run seed script to create demo user.</div>;
  }

  const { recommendedSongs, recentSongs } = await getData(userId);

  return (
    <div className="space-y-8">
      {/* Hero / Recommended Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
            <Button variant="link" className="text-muted-foreground">See all</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendedSongs.length === 0 ? (
                <p className="text-muted-foreground col-span-full">Listen to more songs to get recommendations!</p>
            ) : recommendedSongs.map((song) => (
                <SongCard key={song.id} song={song} />
            ))}
        </div>
      </section>

      {/* Recently Played Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Recently Played</h2>
            <Button variant="link" className="text-muted-foreground">See all</Button>
        </div>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recentSongs.map((song) => (
                <SongCard key={song.id} song={song} />
            ))}
        </div>
      </section>
    </div>
  );
}

// Client Component Wrapper for Song Card to handle Play action
// import { SongCard } from '@/components/SongCard'; // Already imported or needs to be if not.



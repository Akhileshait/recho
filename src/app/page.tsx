import { Button } from '@/components/ui/button';
import { RecommendationEngine } from '@/lib/recommendation';
import { query } from '@/lib/db';
import { SongCard } from '@/components/SongCard';
import { ChevronRight, TrendingUp, History, Sparkles } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  url: string;
  cover_url?: string;
  played_at?: Date;
}

async function getData(userId: string) {
  const engine = new RecommendationEngine();
  const recommendationsRefs = await engine.recommend(userId);

  let recommendedSongs: Song[] = [];
  if (recommendationsRefs.length > 0) {
    const songIds = recommendationsRefs.map(r => r.songId);
    const placeholders = songIds.map((_, i) => `$${i + 1}`).join(',');
    const res = await query(`SELECT * FROM songs WHERE id IN (${placeholders})`, songIds);
    recommendedSongs = songIds.map(id => res.rows.find((s: any) => s.id === id)).filter(Boolean) as Song[];
  }

  const historyRes = await query(
    `SELECT DISTINCT ON (s.id) s.*, h.played_at
     FROM history h
     JOIN songs s ON h.song_id = s.id
     WHERE h.user_id = $1
     ORDER BY s.id, h.played_at DESC
     LIMIT 10`,
    [userId]
  );
  const recentSongs: Song[] = historyRes.rows;

  const trendingRes = await query(
    `SELECT s.*, COUNT(h.id) as play_count
     FROM songs s
     JOIN history h ON s.id = h.song_id
     WHERE h.played_at > NOW() - INTERVAL '7 days'
     GROUP BY s.id
     ORDER BY play_count DESC
     LIMIT 10`
  );
  const trendingSongs: Song[] = trendingRes.rows;

  return { recommendedSongs, recentSongs, trendingSongs };
}

const DEMO_USER_EMAIL = 'demo@example.com';

export default async function Home() {
  const userRes = await query('SELECT id FROM users WHERE email = $1', [DEMO_USER_EMAIL]);
  const userId = userRes.rows[0]?.id;

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to Recho</h2>
          <p className="text-muted-foreground max-w-md">
            Please run the seed script to create demo user and start discovering music.
          </p>
          <Button>Run npm run db:seed</Button>
        </div>
      </div>
    );
  }

  const { recommendedSongs, recentSongs, trendingSongs } = await getData(userId);

  return (
    <div className="space-y-8 pb-32">
      {/* Hero Section */}
      <section className="animate-fade-in">
        <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-background rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Good {getTimeOfDay()}</h1>
              <p className="text-muted-foreground">Ready to discover new music?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <section className="animate-fade-in animation-delay-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Recently Played</h2>
            </div>
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground smooth-transition">
              See all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended for You */}
      <section className="animate-fade-in animation-delay-400">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Made for You</h2>
              <p className="text-sm text-muted-foreground">Based on your listening history</p>
            </div>
          </div>
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground smooth-transition">
            See all
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        {recommendedSongs.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed animate-pulse">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No recommendations yet</p>
            <p className="text-sm text-muted-foreground">Listen to more songs to get personalized recommendations!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {recommendedSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Now */}
      {trendingSongs.length > 0 && (
        <section className="animate-fade-in animation-delay-600">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Trending This Week</h2>
            </div>
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground smooth-transition">
              See all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}




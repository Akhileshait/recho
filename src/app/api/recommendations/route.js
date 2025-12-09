import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { RecommendationEngine } from '@/lib/recommendation';
import { query } from '@/lib/db';

// Mock auth options for now - in real app import from lib/auth
const authOptions = {}; 

export async function GET(req) {
  // In a real app, use getServerSession(authOptions)
  // For now, we'll assume a query param or header for userId for testing, or mock it
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }
  
  // const userId = session.user.id;
  
  // TEMPORARY: Get userId from query param for testing
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
     return NextResponse.json({ error: 'UserId required' }, { status: 400 });
  }

  try {
    const engine = new RecommendationEngine();
    const recommendations = await engine.recommend(userId);
    
    // Fetch full song details for the recommended IDs
    if (recommendations.length === 0) {
        return NextResponse.json({ songs: [] });
    }

    const songIds = recommendations.map(r => r.songId);
    // Parameterized query for IN clause
    const placeholders = songIds.map((_, i) => `$${i + 1}`).join(',');
    const songsResult = await query(
      `SELECT * FROM songs WHERE id IN (${placeholders})`,
      songIds
    );
    
    // Map back to preserve order/score if needed, or just return songs
    const songs = songsResult.rows;

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

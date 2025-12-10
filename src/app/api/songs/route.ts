import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID
    const userRes = await query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userRes.rows[0].id;

    // Get all songs with like status for current user
    const songsRes = await query(
      `SELECT
        s.id,
        s.title,
        s.artist,
        s.album,
        s.genre,
        s.mood,
        s.duration,
        s.cover_url,
        s.url as file_url,
        s.play_count,
        EXISTS(SELECT 1 FROM song_likes WHERE user_id = $1 AND song_id = s.id) as is_liked
       FROM songs s
       ORDER BY s.created_at DESC
       LIMIT 500`,
      [userId]
    );

    return NextResponse.json({ songs: songsRes.rows });
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

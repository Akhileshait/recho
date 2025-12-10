import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { songId } = await request.json();

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
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

    // Add to listening history
    await query(
      `INSERT INTO history (user_id, song_id, played_at, play_duration)
       VALUES ($1, $2, NOW(), 0)`,
      [userId, songId]
    );

    // Increment play count
    await query(
      'UPDATE songs SET play_count = play_count + 1 WHERE id = $1',
      [songId]
    );

    // Update user's current song
    await query(
      'UPDATE users SET current_song_id = $1 WHERE id = $2',
      [songId, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track play:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

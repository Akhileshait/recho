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

    // Check if already liked
    const likeRes = await query(
      'SELECT id FROM likes WHERE user_id = $1 AND song_id = $2',
      [userId, songId]
    );

    if (likeRes.rows.length > 0) {
      // Unlike
      await query(
        'DELETE FROM likes WHERE user_id = $1 AND song_id = $2',
        [userId, songId]
      );
      return NextResponse.json({ success: true, liked: false });
    } else {
      // Like
      await query(
        'INSERT INTO likes (user_id, song_id) VALUES ($1, $2)',
        [userId, songId]
      );
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Failed to like/unlike song:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

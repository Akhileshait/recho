import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const userRes = await query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userRes.rows[0].id;

    // Get all friendships (both directions)
    const friendshipsRes = await query(
      `SELECT
        u.id, u.name, u.email, u.image, u.is_online, u.current_song_id,
        f.status,
        CASE
          WHEN f.user_id = $1 THEN 'pending'
          WHEN f.friend_id = $1 THEN 'requested'
          ELSE f.status
        END as request_status
      FROM friendships f
      JOIN users u ON (
        CASE
          WHEN f.user_id = $1 THEN u.id = f.friend_id
          WHEN f.friend_id = $1 THEN u.id = f.user_id
        END
      )
      WHERE (f.user_id = $1 OR f.friend_id = $1)`,
      [userId]
    );

    interface FriendshipRow {
      id: string;
      name: string;
      email: string;
      image: string | null;
      is_online: boolean;
      current_song_id: string | null;
      status: string;
      request_status: string;
    }

    interface Friend {
      id: string;
      name: string;
      email: string;
      image: string | null;
      is_online: boolean;
      current_song_id: string | null;
      status: string;
    }

    const friends: Friend[] = friendshipsRes.rows.map((row: FriendshipRow) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      is_online: row.is_online,
      current_song_id: row.current_song_id,
      status: row.status === 'accepted' ? 'accepted' : row.request_status,
    }));

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Failed to get friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

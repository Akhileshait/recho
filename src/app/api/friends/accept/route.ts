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

    const { friendId } = await request.json();

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID required' }, { status: 400 });
    }

    // Get current user
    const userRes = await query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userRes.rows[0].id;

    // Update friendship status to accepted
    await query(
      `UPDATE friendships
       SET status = 'accepted'
       WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
      [friendId, userId]
    );

    // Create reverse friendship
    await query(
      `INSERT INTO friendships (user_id, friend_id, status)
       VALUES ($1, $2, 'accepted')
       ON CONFLICT (user_id, friend_id) DO UPDATE SET status = 'accepted'`,
      [userId, friendId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to accept friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

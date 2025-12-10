import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q');

    if (!searchQuery || searchQuery.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by name or email
    const usersRes = await query(
      `SELECT id, name, email, image
       FROM users
       WHERE (LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1))
       AND email != $2
       LIMIT 20`,
      [`%${searchQuery}%`, session.user.email]
    );

    return NextResponse.json({ users: usersRes.rows });
  } catch (error) {
    console.error('Failed to search users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

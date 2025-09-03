    import { NextResponse } from 'next/server';
    import { redis } from '../../../lib/redis.js';
    import { User } from '../../types.js';

    export async function GET(request: Request) {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');

      if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
      }

      try {
        const user = await redis.get<User>(`user:${userId}`);
        return NextResponse.json(user);
      } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
      }
    }

    export async function POST(request: Request) {
      const body = await request.json();
      const { userId, username, walletAddress, skills } = body;

      if (!userId || !walletAddress) {
        return NextResponse.json({ error: 'userId and walletAddress required' }, { status: 400 });
      }

      const user: User = {
        userId,
        username,
        walletAddress,
        skills: skills || [],
        createdAt: new Date().toISOString(),
      };

      try {
        await redis.set(`user:${userId}`, user);
        return NextResponse.json(user, { status: 201 });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    export async function PUT(request: Request) {
      const body = await request.json();
      const { userId, skills } = body;

      if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
      }

      try {
        const user = await redis.get<User>(`user:${userId}`);
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = { ...user, skills };
        await redis.set(`user:${userId}`, updatedUser);
        return NextResponse.json(updatedUser);
      } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }
    }
  
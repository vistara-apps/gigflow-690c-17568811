import { NextResponse } from 'next/server';
import { redis } from '../../../lib/redis.js';
import { User } from '../../types.js';

/**
 * @api {get} /api/users Get user
 * @apiName GetUser
 * @apiGroup Users
 * @apiDescription Retrieves a user by their ID
 * 
 * @apiQuery {String} userId User ID to retrieve
 * 
 * @apiSuccess {Object} user User object
 * @apiError {Object} error Error message
 */
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

/**
 * @api {post} /api/users Create user
 * @apiName CreateUser
 * @apiGroup Users
 * @apiDescription Creates a new user
 * 
 * @apiBody {String} userId User ID (wallet address)
 * @apiBody {String} walletAddress Wallet address
 * @apiBody {String} [username] Optional username
 * @apiBody {String[]} [skills] Optional array of skills
 * @apiBody {String} [farcasterId] Optional Farcaster ID
 * @apiBody {String} [farcasterUsername] Optional Farcaster username
 * 
 * @apiSuccess {Object} user Created user object
 * @apiError {Object} error Error message
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, username, walletAddress, skills, farcasterId, farcasterUsername } = body;

  if (!userId || !walletAddress) {
    return NextResponse.json({ error: 'userId and walletAddress required' }, { status: 400 });
  }

  const user: User = {
    userId,
    username,
    walletAddress,
    skills: skills || [],
    createdAt: new Date().toISOString(),
    farcasterId,
    farcasterUsername,
  };

  try {
    await redis.set(`user:${userId}`, user);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

/**
 * @api {put} /api/users Update user
 * @apiName UpdateUser
 * @apiGroup Users
 * @apiDescription Updates an existing user
 * 
 * @apiBody {String} userId User ID to update
 * @apiBody {String[]} [skills] Optional updated skills array
 * @apiBody {String} [username] Optional updated username
 * @apiBody {String} [farcasterId] Optional Farcaster ID
 * @apiBody {String} [farcasterUsername] Optional Farcaster username
 * 
 * @apiSuccess {Object} user Updated user object
 * @apiError {Object} error Error message
 */
export async function PUT(request: Request) {
  const body = await request.json();
  const { userId, skills, username, farcasterId, farcasterUsername } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const user = await redis.get<User>(`user:${userId}`);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = { 
      ...user,
      skills: skills !== undefined ? skills : user.skills,
      username: username !== undefined ? username : user.username,
      farcasterId: farcasterId !== undefined ? farcasterId : user.farcasterId,
      farcasterUsername: farcasterUsername !== undefined ? farcasterUsername : user.farcasterUsername,
    };
    
    await redis.set(`user:${userId}`, updatedUser);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

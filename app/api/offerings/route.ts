import { NextResponse } from 'next/server';
import { redis } from '../../../lib/redis.js';
import { Offering } from '../../types.js';
import { nanoid } from 'nanoid';

/**
 * @api {get} /api/offerings Get all offerings
 * @apiName GetOfferings
 * @apiGroup Offerings
 * @apiDescription Retrieves all skill offerings from the database
 * 
 * @apiQuery {String} [userId] Optional user ID to filter offerings by user
 * 
 * @apiSuccess {Object[]} offerings List of offerings
 * @apiError {Object} error Error message
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    let offeringKeys;
    
    if (userId) {
      // Get offerings for a specific user
      offeringKeys = await redis.keys(`offering:${userId}:*`);
    } else {
      // Get all offerings
      offeringKeys = await redis.keys('offering:*');
    }

    if (offeringKeys.length === 0) return NextResponse.json([]);

    const offerings = await redis.mget<Offering>(...offeringKeys);
    return NextResponse.json(Object.values(offerings));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offerings' }, { status: 500 });
  }
}

/**
 * @api {post} /api/offerings Create a new offering
 * @apiName CreateOffering
 * @apiGroup Offerings
 * @apiDescription Creates a new skill offering
 * 
 * @apiBody {String} userId User ID of the offering creator
 * @apiBody {String} title Title of the offering
 * @apiBody {String} description Description of the offering
 * @apiBody {String[]} skills Skills associated with the offering
 * @apiBody {Number} basePrice Base price for the offering
 * 
 * @apiSuccess {Object} offering Created offering
 * @apiError {Object} error Error message
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, title, description, skills, basePrice } = body;

  if (!userId || !title || !description || !basePrice) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const offeringId = nanoid();
  const now = new Date().toISOString();
  
  const offering: Offering = {
    offeringId,
    userId,
    title,
    description,
    skills: skills || [],
    basePrice,
    availability: 'available',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await redis.set(`offering:${userId}:${offeringId}`, offering);
    return NextResponse.json(offering, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create offering' }, { status: 500 });
  }
}

/**
 * @api {put} /api/offerings Update an offering
 * @apiName UpdateOffering
 * @apiGroup Offerings
 * @apiDescription Updates an existing skill offering
 * 
 * @apiBody {String} offeringId ID of the offering to update
 * @apiBody {String} userId User ID of the offering creator
 * @apiBody {String} [title] Updated title
 * @apiBody {String} [description] Updated description
 * @apiBody {String[]} [skills] Updated skills
 * @apiBody {Number} [basePrice] Updated base price
 * @apiBody {String} [availability] Updated availability status
 * 
 * @apiSuccess {Object} offering Updated offering
 * @apiError {Object} error Error message
 */
export async function PUT(request: Request) {
  const body = await request.json();
  const { offeringId, userId, title, description, skills, basePrice, availability } = body;

  if (!offeringId || !userId) {
    return NextResponse.json({ error: 'offeringId and userId required' }, { status: 400 });
  }

  try {
    const offering = await redis.get<Offering>(`offering:${userId}:${offeringId}`);
    if (!offering) {
      return NextResponse.json({ error: 'Offering not found' }, { status: 404 });
    }

    const updatedOffering = {
      ...offering,
      title: title || offering.title,
      description: description || offering.description,
      skills: skills || offering.skills,
      basePrice: basePrice !== undefined ? basePrice : offering.basePrice,
      availability: availability || offering.availability,
      updatedAt: new Date().toISOString(),
    };

    await redis.set(`offering:${userId}:${offeringId}`, updatedOffering);
    return NextResponse.json(updatedOffering);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update offering' }, { status: 500 });
  }
}

/**
 * @api {delete} /api/offerings Delete an offering
 * @apiName DeleteOffering
 * @apiGroup Offerings
 * @apiDescription Deletes an existing skill offering
 * 
 * @apiQuery {String} offeringId ID of the offering to delete
 * @apiQuery {String} userId User ID of the offering creator
 * 
 * @apiSuccess {Object} message Success message
 * @apiError {Object} error Error message
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const offeringId = searchParams.get('offeringId');
  const userId = searchParams.get('userId');

  if (!offeringId || !userId) {
    return NextResponse.json({ error: 'offeringId and userId required' }, { status: 400 });
  }

  try {
    const exists = await redis.exists(`offering:${userId}:${offeringId}`);
    if (!exists) {
      return NextResponse.json({ error: 'Offering not found' }, { status: 404 });
    }

    await redis.del(`offering:${userId}:${offeringId}`);
    return NextResponse.json({ message: 'Offering deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete offering' }, { status: 500 });
  }
}


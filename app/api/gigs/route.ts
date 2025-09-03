    import { NextResponse } from 'next/server';
    import { redis } from '../../../lib/redis.js';
    import { Gig } from '../../types.js';
    import { nanoid } from 'nanoid';

    export async function GET() {
      try {
        const gigKeys = await redis.keys('gig:*');
        if (gigKeys.length === 0) return NextResponse.json([]);

        const gigs = await redis.mget<Gig>(...gigKeys);
        return NextResponse.json(Object.values(gigs));
      } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch gigs' }, { status: 500 });
      }
    }

    export async function POST(request: Request) {
      const body = await request.json();
      const { title, description, skillsRequired, payoutAmount, postedByUserId } = body;

      if (!title || !description || !payoutAmount || !postedByUserId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const gigId = nanoid();
      const gig: Gig = {
        gigId,
        title,
        description,
        skillsRequired: skillsRequired || [],
        payoutAmount,
        status: 'open',
        postedByUserId,
        createdAt: new Date().toISOString(),
      };

      try {
        await redis.set(`gig:${gigId}`, gig);
        return NextResponse.json(gig, { status: 201 });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to create gig' }, { status: 500 });
      }
    }

    export async function PUT(request: Request) {
      const body = await request.json();
      const { gigId, status, completedByUserId } = body;

      if (!gigId) {
        return NextResponse.json({ error: 'gigId required' }, { status: 400 });
      }

      try {
        const gig = await redis.get<Gig>(`gig:${gigId}`);
        if (!gig) {
          return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
        }

        const updatedGig = {
          ...gig,
          status: status || gig.status,
          completedByUserId: completedByUserId || gig.completedByUserId,
          completedAt: status === 'completed' ? new Date().toISOString() : gig.completedAt,
        };

        await redis.set(`gig:${gigId}`, updatedGig);
        return NextResponse.json(updatedGig);
      } catch (error) {
        return NextResponse.json({ error: 'Failed to update gig' }, { status: 500 });
      }
    }
  
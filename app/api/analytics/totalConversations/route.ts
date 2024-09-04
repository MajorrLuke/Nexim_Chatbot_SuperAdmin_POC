import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const user = await auth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);

    let query = {};
    if (startDate && endDate) {
      query = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const count = await db.collection('chatbot_sessions').countDocuments(query);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching conversation count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

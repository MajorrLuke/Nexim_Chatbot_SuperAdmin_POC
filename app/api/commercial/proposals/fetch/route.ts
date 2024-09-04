import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'superAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('commercialProposals');

    const proposals = await collection.find({}).toArray();
    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Error fetching commercial proposals:', error);
    return NextResponse.json({ error: 'Failed to fetch commercial proposals' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user;
  if (!user || !['manager', 'admin', 'superAdmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);

  const { name } = await req.json();

  const result = await db.collection('chatbot_flows').insertOne({ name });

  return NextResponse.json(result);
}
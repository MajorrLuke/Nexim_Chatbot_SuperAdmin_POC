import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  try {
    const db = client.db(process.env.MONGODB_DB_NAME);

    const flows = await db.collection('chatbot_flows').find({}).toArray();
    return NextResponse.json(flows);
  } catch (error) {
    console.error('MongoDB connection failed', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
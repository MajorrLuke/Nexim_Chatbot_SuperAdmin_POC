import { NextRequest } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb'; // Added this import

export async function GET(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);

  const { searchParams } = new URL(req.url);
  const flowId = searchParams.get('flowId');
  //console.log('flowId', flowId);

  if (!flowId) {
    return NextResponse.json({ error: 'flowId is required' }, { status: 400 });
  }

  const nodes = await db.collection('chatbot_nodes').find({ 
    'flow': new ObjectId(flowId),
    'status': 'on'
  }).toArray();
  //console.log('nodes', nodes);

  return NextResponse.json(nodes);
}
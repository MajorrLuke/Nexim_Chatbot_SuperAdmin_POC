import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb'
import { ObjectId } from 'mongodb';

export async function PUT(request: Request) {
  const { flowId, variables } = await request.json();

  if (!flowId || !variables) {
    return NextResponse.json({ error: 'Missing flowId or variables' }, { status: 400 });
  }

  try {
    console.log(flowId, variables);
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('chatbot_flows');

    const result = await collection.updateOne(
      { _id: new ObjectId(flowId) },
      { $set: { variables: variables } }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: 'Flow variables updated successfully' });
    } else {
      console.error('Flow not found or not updated');
      return NextResponse.json({ error: 'Failed to update flow variables' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating flow variables:', error);
    return NextResponse.json({ error: 'Failed to update flow variables' }, { status: 500 });
  }
}
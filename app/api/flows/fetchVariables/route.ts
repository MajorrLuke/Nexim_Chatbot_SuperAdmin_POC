import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const flowId = searchParams.get('flowId');

  if (!flowId) {
    return NextResponse.json({ error: 'Missing flowId' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('chatbot_flows');

    const flow = await collection.findOne({ _id: new ObjectId(flowId) });

    if (!flow) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }

    const variables = flow.variables || {};

    // Convert the variables object to an array of { name, defaultValue } objects
    const variablesArray = Object.entries(variables).map(([name, defaultValue]) => ({
      name,
      defaultValue: defaultValue as string,
    }));

    return NextResponse.json(variablesArray);
  } catch (error) {
    console.error('Error fetching flow variables:', error);
    return NextResponse.json({ error: 'Failed to fetch flow variables' }, { status: 500 });
  }
}

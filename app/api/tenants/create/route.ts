import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
      return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
    }

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const user = session.user;
    if (!user || !['superAdmin'].includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

  try {
    const body = await req.json();
    const { name, email, tier } = body;

    if (!name || !email || !tier) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;

    const db = client.db(process.env.MONGODB_DB_NAME);

    const result = await db.collection('tenants').insertOne({
      name,
      email,
      tier,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Tenant created successfully', tenantId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
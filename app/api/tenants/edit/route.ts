import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from "@/auth";

export async function PUT(req: NextRequest) {
  try {
    // Check for a valid session
    const session = await auth();
    if (!session || session.user.role !== 'superAdmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { _id, name, email, tier } = await req.json();

    if (!_id || !name || !email || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const tenantsCollection = db.collection('tenants');

    const result = await tenantsCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { name, email, tier, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tenant updated successfully' });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

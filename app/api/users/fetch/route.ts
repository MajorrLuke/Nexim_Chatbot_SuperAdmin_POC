import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import clientPromise from '@/app/lib/mongodb';

export async function GET(request: Request) {
  try {
    // Check for a valid session
    const session = await auth();
    if (!session || (session.user.role !== 'superAdmin' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenantId from query parameters
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'TenantId is required' }, { status: 400 });
    }

    console.log("tenantId", tenantId);

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const usersCollection = db.collection('users');
    
    // Fetch users with role not equal to "superAdmin" and matching tenantId
    const users = await usersCollection.find({ 
      role: { $ne: "superAdmin" },
      tenant: parseInt(tenantId)
    }).toArray();

    
    // Convert ObjectId to string for each user
    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));

    return NextResponse.json(serializedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
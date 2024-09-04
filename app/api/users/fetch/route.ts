import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    // Check for a valid session
    const session = await auth();
    if (!session || (session.user.role !== 'superAdmin' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const usersCollection = db.collection('users');
    
    // Fetch users with role not equal to "superAdmin"
    const users = await usersCollection.find({ role: { $ne: "superAdmin" } }).toArray();
    
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
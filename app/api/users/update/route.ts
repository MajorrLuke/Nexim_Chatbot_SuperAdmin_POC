import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from "@/auth";
import crypto from 'crypto';

export async function PUT(req: NextRequest) {
  try {
    // Check for a valid session
    const session = await auth();
    if (!session || (session.user.role !== 'superAdmin' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { _id, name, password, email } = await req.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const usersCollection = db.collection('users');

    const updateFields: { name: string; email: string; password?: string } = { name, email };

    if (password) {
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      updateFields.password = hashedPassword;
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
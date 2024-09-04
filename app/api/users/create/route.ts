import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { auth } from "@/auth";
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Check for a valid session
    const session = await auth();
    if (!session || (session.user.role !== 'superAdmin' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the tenant from the current user's session
    const tenant = session.user.tenant;

    const { name, email, password, role } = await req.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'agent'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const usersCollection = db.collection('users');

    // Ensure unique index on email field
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Create new user with tenant
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      tenant,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({ 
      message: 'User created successfully',
      userId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { MongoClient } = await import('mongodb');
  const clientPromise = (await import('@/app/lib/mongodb')).default;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);

  // Parse the JSON body
  const { email, password } = await req.json();

  // Hash the password using SHA-256
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  // Fetch from the 'users' collection
  const user = await db.collection('users').findOne({ email: email, password: hashedPassword });

  return NextResponse.json(user);
}
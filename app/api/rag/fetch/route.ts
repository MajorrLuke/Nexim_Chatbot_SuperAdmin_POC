import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { auth } from '@/auth';


export async function GET() {
  
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user;
  if (!user || !['manager', 'admin', 'superAdmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db('chatbot_knowledge_base');
    const filesCollection = db.collection('files');
    const files = await filesCollection.find({}).toArray();
    
    // Convert ObjectId to string for each file
    const serializedFiles = files.map(file => ({
      ...file,
      _id: file._id.toString()
    }));

    return NextResponse.json(serializedFiles);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
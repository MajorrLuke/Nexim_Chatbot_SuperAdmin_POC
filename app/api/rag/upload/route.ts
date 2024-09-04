import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { z } from 'zod';
import { auth } from '@/auth';

const allowedFileTypes = [
  'csv', 'docx', 'epub', 'hwp', 'ipynb', 'jpeg', 'jpg', 'mbox',
  'md', 'mp3', 'mp4', 'pdf', 'png', 'ppt', 'pptm', 'pptx', 'txt'
];

const FileSchema = z.object({
  name: z.string().refine(
    (name: string) => allowedFileTypes.includes(name.split('.').pop()?.toLowerCase() || ''),
    { message: "Invalid file type. Allowed types are: " + allowedFileTypes.join(', ') }
  )
});

export async function POST(request: NextRequest) {

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user;
  if (!user || !['manager', 'admin', 'superAdmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    FileSchema.parse({ name: file.name });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
  }

  const content = await file.text();

  // MongoDB connection
  const mongodbClient = new MongoClient(process.env.MONGODB_URI as string);
  await mongodbClient.connect();

  try {
    const db = mongodbClient.db("chatbot_knowledge_base");
    const collection = db.collection("files");

    // Save the file content to MongoDB
    await collection.insertOne({
      filename: file.name,
      fileType: file.name.split('.').pop()?.toLowerCase() || '',
      content: content,
      uploadDate: new Date(),
      status: "pending",
      tenant: 1
    });

    return NextResponse.json({ message: `File ${file.name} stored in MongoDB.` }, { status: 200 });
  } catch (error) {
    console.error("Error storing file:", error);
    return NextResponse.json({ error: 'Error storing file' }, { status: 500 });
  } finally {
    // Close MongoDB connection
    await mongodbClient.close();
  }
}
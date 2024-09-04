import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Node, Edge } from '@xyflow/react';
import { CustomNodeData } from '@/app/definitions/floweditor/definitions';

function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export async function POST(request: Request) {
  const { flowId, nodes, edges } = await request.json();
  
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);

  try {
    const currentDate = new Date();
    const backupPrefix = 'backup_';

    // Check for existing backups and delete the oldest if there are more than 10
    const backups = await db.collection('chatbot_nodes')
      .distinct('backup_info', { 'flow': new ObjectId(flowId), backup_info: { $regex: `^${backupPrefix}` } });
    
    if (backups.length >= 10) {
      const oldestBackup = backups.sort()[0];
      await db.collection('chatbot_nodes').deleteMany({
        'flow': new ObjectId(flowId),
        'backup_info': oldestBackup
      });
    }

    // Update all existing nodes for this flow
    await db.collection('chatbot_nodes').updateMany(
      { 'flow': new ObjectId(flowId) },
      { 
        $set: { 
          status: 'off',
          backup_info: `${backupPrefix}${currentDate.toISOString()}`,
          updatedAt: currentDate
        }
      }
    );

    // Handle image uploads and update action content
    const updatedNodes = await Promise.all(nodes.map(async (node: Node<CustomNodeData>) => {
      if (node.data.type === 'action') {
        const updatedActions = await Promise.all(node.data.actions.map(async (action) => {
          if (action.type === 'image' && action.content.startsWith('data:')) {
            // If the content is a data URL, it's a new image that needs to be uploaded
            const file = dataURLtoFile(action.content, 'image.png');
            const formData = new FormData();
            formData.append('file', file);

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const uploadResponse = await fetch(`${apiBaseUrl}/api/upload`, {
              method: 'POST',
              body: formData,
            });

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              return { ...action, content: uploadResult.url };
            } else {
              console.error('Failed to upload image');
              return action;
            }
          }
          return action;
        }));
        return { ...node, data: { ...node.data, actions: updatedActions } };
      }
      return node;
    }));

    // Insert or update new nodes
    await Promise.all(updatedNodes.map(async (node: Node<CustomNodeData>) => {
      const updateData: any = {
        status: 'on',
        updatedAt: currentDate,
      };

      // Only add non-null properties
      if (node.data.label) updateData.label = node.data.label;
      if (node.data.type) updateData.type = node.data.type;
      if (node.data.actions) updateData.actions = node.data.actions;
      if (node.data.conditions) updateData.conditions = node.data.conditions;
      if (node.position) updateData.position = node.position;
      if (node.data.waitAnswer !== undefined) updateData.waitAnswer = node.data.waitAnswer;
      if (node.data.url) updateData.url = node.data.url;
      if (node.data.method) updateData.method = node.data.method;
      if (node.data.body) updateData.body = node.data.body;
      if (node.data.headers) updateData.headers = node.data.headers;
      if (node.data.language) updateData.language = node.data.language;
      if (node.data.query) updateData.query = node.data.query;

      await db.collection('chatbot_nodes').updateOne(
        { _id: new ObjectId(node.id), flow: new ObjectId(flowId) },
        { $set: updateData },
        { upsert: true }
      );
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating flow:', error);
    return NextResponse.json({ error: 'Failed to update flow' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId, Collection } from 'mongodb';
import { auth } from "@/auth";

async function fetchNextNodes(nodesCollection: Collection, startNodeId: string, flowId: string, message: string) {
  let currentNode = await nodesCollection.findOne({ _id: new ObjectId(startNodeId) });
  let actions: any[] = [];

  while (currentNode) {
    actions = actions.concat(await processNode(currentNode, message));

    if (currentNode.waitAnswer || currentNode.type === 'end') break;

    if (currentNode.conditions?.length > 0) {
      const nextNodeId = currentNode.conditions[0].nextNode;
      currentNode = await nodesCollection.findOne({ _id: new ObjectId(nextNodeId), flow: new ObjectId(flowId) });
    } else {
      break;
    }
  }

  return { actions, currentNode };
}

async function processNode(node: any, message: string) {
  switch (node.type) {
    case 'httpRequest':
      return (await processHttpRequest(node)).actions;
    case 'intelligence':
      return (await processIntelligenceNode(node, message)).actions;
    default:
      return node.actions || [];
  }
}

async function processIntelligenceNode(node: any, userMessage: string) {
  console.log("entrou intelligence: ", userMessage)

  const { query, language } = node;

  const body = JSON.stringify({
    instruction: query,
    language: language,
    question: userMessage
  });

  try {
    const response = await fetch(`${process.env.NEXIM_INTELLIGENCE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXIM_INTELLIGENCE_API_KEY}`
      },
      body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const action = {
      type: 'text',
      content: data.response
    };

    return { actions: [action] };
  } catch (error) {
    console.error('Error processing intelligence node:', error);
    return { actions: [{ type: 'text', content: 'Sorry, there was an error processing your request.' }] };
  }
}

async function processHttpRequest(node: any) {
  const { url, method, body, headers } = node;
  try {
    const response = await fetch(url, {
      method,
      headers: headers || {},
      body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
    });

    const responseData = await response.json();

    const action = {
      type: 'setVariable',
      variable: 'httpResponse',
      value: JSON.stringify(responseData),
    };

    return { actions: [action] };
  } catch (error) {
    console.error('Error processing HTTP request:', error);
    return { actions: [] };
  }
}

async function processImageAction(action: any) {
  const s3Endpoint = process.env.S3_ENDPOINT || '';
  if (!s3Endpoint) {
    console.error('S3_ENDPOINT is not defined in .env');
    return null;
  }

  const imageUrl = `${s3Endpoint}${action.content}`;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    return `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${base64Image}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

export async function POST(req: NextRequest, { params }: { params: { flowId: string } }) {

  // Check for a valid session
  const login_session = await auth();
  if (!login_session || (login_session.user.role !== 'superAdmin' && login_session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { flowId } = params;
  const { userId, action, message } = await req.json();

  if (!userId || !action) {
    return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
  }

  const flowObjectId = new ObjectId(flowId);
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const sessionsCollection = db.collection('chatbot_sessions');
  const nodesCollection = db.collection('chatbot_nodes');
  const flowsCollection = db.collection('chatbot_flows');

  let session = await sessionsCollection.findOne({ userId, flowId: flowObjectId });

  if (action === 'start') {
    return handleStartAction(session, flowObjectId, nodesCollection, flowsCollection, sessionsCollection, message, userId);
  } else if (action === 'message') {
    return handleMessageAction(session, flowObjectId, nodesCollection, sessionsCollection, message);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

async function handleStartAction(
  session: any,
  flowObjectId: ObjectId,
  nodesCollection: Collection,
  flowsCollection: Collection,
  sessionsCollection: Collection,
  message: string,
  userId: string
) {
  if (session) {
    return NextResponse.json({ message: 'Session already exists' });
  }

  const startNode = await nodesCollection.findOne({ flow: flowObjectId, type: 'start' });
  if (!startNode) {
    return NextResponse.json({ error: 'Start node not found for this flow' }, { status: 404 });
  }

  const { actions, currentNode } = await fetchNextNodes(nodesCollection, startNode._id.toString(), flowObjectId.toString(), message);

  const flow = await flowsCollection.findOne({ _id: flowObjectId });
  if (!flow) {
    return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
  }

  const newSession = {
    userId,
    flowId: flowObjectId,
    variables: JSON.parse(JSON.stringify(flow.variables || {})),
    currentNode: currentNode?._id.toString() || '',
    createdAt: new Date(),
  };

  await sessionsCollection.insertOne(newSession);

  if (currentNode?.type === 'end') {
    await sessionsCollection.deleteOne({ userId, flowId: flowObjectId });
    return NextResponse.json({ message: 'Flow completed', actions, isEnd: true });
  }

  return NextResponse.json({
    message: 'Session started',
    actions,
    currentNode: currentNode?._id.toString(),
    waitAnswer: currentNode?.waitAnswer
  });
}

async function handleMessageAction(
  session: any,
  flowObjectId: ObjectId,
  nodesCollection: Collection,
  sessionsCollection: Collection,
  message: string
) {
  if (!session) {
    return NextResponse.json({ error: 'No active session found' }, { status: 404 });
  }

  const currentNode = await nodesCollection.findOne({ _id: new ObjectId(session.currentNode) });
  if (!currentNode) {
    return NextResponse.json({ error: 'Current node not found' }, { status: 404 });
  }

  const nextNodeId = await evaluateConditions(currentNode.conditions, session.variables);
  const { actions, currentNode: nextNode } = await fetchNextNodes(nodesCollection, nextNodeId, flowObjectId.toString(), message);

  if (!nextNode) {
    return NextResponse.json({ error: 'Next node not found' }, { status: 404 });
  }

  const { updatedVariables, processedActions } = await processActions(actions, session.variables);

  await sessionsCollection.updateOne(
    { userId: session.userId, flowId: flowObjectId },
    { 
      $set: { 
        currentNode: nextNode._id.toString(),
        variables: updatedVariables
      } 
    }
  );

  if (nextNode.type === 'end') {
    await sessionsCollection.deleteOne({ userId: session.userId, flowId: flowObjectId });
    return NextResponse.json({ message: 'Flow completed', actions: processedActions, isEnd: true });
  }

  return NextResponse.json({
    actions: processedActions,
    currentNode: nextNode._id.toString(),
    waitAnswer: nextNode.waitAnswer
  });
}

async function evaluateConditions(conditions: any[], variables: Record<string, any>) {
  for (let i = 1; i < conditions.length; i++) {
    const condition = conditions[i];
    const parameter1Value = getParameterValue(condition.parameter1Type, condition.parameter1Value, variables);
    const parameter2Value = getParameterValue(condition.parameter2Type, condition.parameter2Value, variables);

    if (evaluateCondition(condition.action, parameter1Value, parameter2Value)) {
      return condition.nextNode;
    }
  }
  return conditions[0]?.nextNode;
}

function getParameterValue(paramType: string, paramValue: string, variables: Record<string, any>) {
  return paramType === 'variable' ? variables[paramValue] ?? null : paramValue;
}

function evaluateCondition(action: string, param1: any, param2: any) {
  switch (action) {
    case 'equalType': return param1 === param2;
    case 'false': return !param1;
    case 'true': return !!param1;
    case 'notEqual': return param1 != param2;
    case 'notEqualType': return param1 !== param2;
    case 'greaterThan': return parseFloat(param1) > parseFloat(param2);
    case 'lessThan': return parseFloat(param1) < parseFloat(param2);
    case 'greaterThanOrEqual': return parseFloat(param1) >= parseFloat(param2);
    case 'lessThanOrEqual': return parseFloat(param1) <= parseFloat(param2);
    default: return false;
  }
}

async function processActions(actions: any[], variables: Record<string, any>) {
  let updatedVariables = { ...variables };
  let processedActions = [];

  for (const action of actions) {
    if (action.type === 'setVariable') {
      updatedVariables[action.variable] = action.variable === 'httpResponse' ? JSON.parse(action.value) : action.value;
    } else if (action.type === 'image') {
      const imageData = await processImageAction(action);
      if (imageData) {
        processedActions.push({ ...action, content: imageData });
      }
    } else {
      processedActions.push(action);
    }
  }

  return { updatedVariables, processedActions };
}
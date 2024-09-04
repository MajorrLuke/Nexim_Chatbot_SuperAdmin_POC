import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'superAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const updatedProposal = await req.json();

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('commercialProposals');

    // Transform the proposal data
    const transformedProposal = transformProposal(updatedProposal);

    // Update the document
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: transformedProposal }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Proposal updated successfully', ...transformedProposal });
  } catch (error) {
    console.error('Error updating commercial proposal:', error);
    return NextResponse.json({ error: 'Failed to update commercial proposal' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'superAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const updatedProposal = await req.json();

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('commercialProposals');

    // Transform the proposal data
    const transformedProposal = transformProposal(updatedProposal);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: transformedProposal }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Proposal updated successfully', ...transformedProposal });
  } catch (error) {
    console.error('Error updating commercial proposal:', error);
    return NextResponse.json({ error: 'Failed to update commercial proposal' }, { status: 500 });
  }
}

function transformProposal(proposal: any) {
  const { name, dueDate, ...rest } = proposal;
  const tiers: any = {};

  ['tier1', 'tier2', 'tier3', 'tier4'].forEach(tier => {
    tiers[tier] = {
      adminLicenses: rest[`tiers.${tier}.adminLicenses`],
      agentLicenses: rest[`tiers.${tier}.agentLicenses`],
      llmTokens: rest[`tiers.${tier}.llmTokens`],
      aiDatabase: rest[`tiers.${tier}.aiDatabase`],
      flowBots: rest[`tiers.${tier}.flowBots`],
      support: rest[`tiers.${tier}.support`],
      monthlyTenantFee: {
        amount: rest[tier]?.monthlyTenantFee?.amount,
        currency: rest[tier]?.monthlyTenantFee?.currency
      },
      licensePrice: {
        amount: rest[tier]?.licensePrice?.amount,
        currency: rest[tier]?.licensePrice?.currency
      }
    };
  });

  return {
    name,
    dueDate,
    tiers
  };
}
import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'superAdmin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('commercialProposals');

    const proposal = await req.json();

    // Restructure the proposal object
    const tiers = ['tier1', 'tier2', 'tier3', 'tier4'].reduce((acc, tier) => {
      acc[tier] = {
        adminLicenses: proposal[`tiers.${tier}.adminLicenses`],
        agentLicenses: proposal[`tiers.${tier}.agentLicenses`],
        llmTokens: proposal[`tiers.${tier}.llmTokens`],
        aiDatabase: proposal[`tiers.${tier}.aiDatabase`],
        flowBots: proposal[`tiers.${tier}.flowBots`],
        support: proposal[`tiers.${tier}.support`],
        monthlyTenantFee: {
          amount: proposal[tier].monthlyTenantFee.amount,
          currency: proposal[tier].monthlyTenantFee.currency
        },
        licensePrice: {
          amount: proposal[tier].licensePrice.amount,
          currency: proposal[tier].licensePrice.currency
        }
      };
      return acc;
    }, {} as Record<string, any>);

    const structuredProposal = {
      name: proposal.name,
      dueDate: proposal.dueDate,
      tiers
    };

    const result = await collection.insertOne(structuredProposal);

    return NextResponse.json({ id: result.insertedId, ...structuredProposal });
  } catch (error) {
    console.error('Error creating commercial proposal:', error);
    return NextResponse.json({ error: 'Failed to create commercial proposal' }, { status: 500 });
  }
}
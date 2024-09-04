import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@/auth';

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader === `Bearer ${process.env.API_SECRET}`) {
    // API secret is valid, proceed with the request
  } else {
    // Check session if API secret is not provided or invalid
    const session = await auth();
    if (!session || session.user.role !== 'superAdmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('commercialProposals');

    const proposal = await collection.findOne({ _id: new ObjectId(id) });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check if the proposal is due
    const currentDate = new Date();
    const dueDate = new Date(proposal.dueDate);
    
    if (dueDate < currentDate) {
      return NextResponse.json({ error: 'Proposal has expired' }, { status: 410 });
    }

    // Transform the proposal data to match the new structure
    const transformedProposal = {
      ...proposal,
      _id: proposal._id.toString(), // Convert ObjectId to string
      dueDate: new Date(proposal.dueDate).toISOString(), // Ensure date is in ISO format
      tiers: Object.fromEntries(
        Object.entries(proposal.tiers).map(([tier, data]) => [
          tier,
          typeof data === 'object' && data !== null ? {
            ...data,
            monthlyTenantFee: {
              amount: (data as any).monthlyTenantFee?.amount?.toString() ?? '',
              currency: (data as any).monthlyTenantFee?.currency ?? '',
            },
            licensePrice: {
              amount: (data as any).licensePrice?.amount?.toString() ?? '',
              currency: (data as any).licensePrice?.currency ?? '',
            },
          } : {}
        ])
      ),
    };

    return NextResponse.json(transformedProposal);
  } catch (error) {
    console.error('Error fetching commercial proposal:', error);
    return NextResponse.json({ error: 'Failed to fetch commercial proposal' }, { status: 500 });
  }
}
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
        const db = client.db(process.env.MONGODB_DB_NAME);
        const tenantsCollection = db.collection('tenants');
        
        const tenants = await tenantsCollection.find({}).toArray();
        
        const serializedTenants = tenants.map(tenant => ({
        ...tenant,
        _id: tenant._id.toString()
        }));

        return NextResponse.json(serializedTenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
    }
}

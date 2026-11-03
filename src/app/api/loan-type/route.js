import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory cache for loan types
let cachedLoanTypes = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const invalidateCache = () => {
  cachedLoanTypes = null;
  lastCacheTime = 0;
};

// GET all Loan Types (served from fast memory cache when valid)
export async function GET() {
  try {
    const now = Date.now();
    if (cachedLoanTypes && (now - lastCacheTime < CACHE_TTL_MS)) {
      return NextResponse.json({ success: true, data: cachedLoanTypes });
    }

    const snapshot = await getDocs(collection(db, 'loan_type'));
    const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

    cachedLoanTypes = data;
    lastCacheTime = now;

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching loan types:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loan types' },
      { status: 500 }
    );
  }
}

// POST - Create new Loan Type
export async function POST(request) {
  try {
    const body = await request.json();
    const { type_name } = body;

    const newRef = doc(collection(db, 'loan_type'));
    const newData = { type_name, created_at: new Date().toISOString() };
    await setDoc(newRef, newData);

    invalidateCache();

    return NextResponse.json({ success: true, data: { id: newRef.id, ...newData } });
  } catch (error) {
    console.error('Error creating loan type:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create loan type' },
      { status: 500 }
    );
  }
}

// PUT - Update Loan Type
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { type_name } = body;

    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    const recordRef = doc(db, 'loan_type', id);
    await updateDoc(recordRef, { type_name, updated_at: new Date().toISOString() });

    invalidateCache();

    return NextResponse.json({ success: true, data: { id, type_name } });
  } catch (error) {
    console.error('Error updating loan type:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update loan type' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Loan Type
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });

    await deleteDoc(doc(db, 'loan_type', id));

    invalidateCache();

    return NextResponse.json({ success: true, message: 'Loan type deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan type:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete loan type' },
      { status: 500 }
    );
  }
}

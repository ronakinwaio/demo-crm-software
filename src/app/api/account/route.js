import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const normalizeDateValue = (value) => {
  if (!value) return null;
  const rawValue = value instanceof Date ? value : String(value).trim();
  if (!rawValue) return null;

  const rawDate = rawValue instanceof Date ? rawValue.toISOString() : rawValue;
  const datePart = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// GET all Account records
export async function GET() {
  try {
    const q = query(collection(db, 'accounts'), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching Account records:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Account records' },
      { status: 500 }
    );
  }
}

// POST - Create new Account record
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      number_series, name, phone_no, status, note, date_time, payment_type, complete_amount
    } = body;

    const normalizedDateTime = normalizeDateValue(date_time) || new Date().toISOString().split('T')[0];
    const amountVal = parseFloat(complete_amount || 0);
    const finalStatus = (status || 'COMPLETE').toUpperCase();

    const newAccountRef = doc(collection(db, 'accounts'));
    const newAccount = {
      number_series: (number_series || '').trim(),
      name: (name || '').trim(),
      phone_no: (phone_no || '').trim(),
      status: finalStatus,
      date_time: normalizedDateTime,
      complete_amount: amountVal,
      pending_amount: amountVal,
      payment_type: payment_type || 'CASH',
      note: (note || '').trim(),
      created_at: new Date().toISOString()
    };

    await setDoc(newAccountRef, newAccount);
    newAccount.id = newAccountRef.id;

    return NextResponse.json({ success: true, data: newAccount });
  } catch (error) {
    console.error('Error creating Account record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create Account record' },
      { status: 500 }
    );
  }
}

// PUT - Update Account record
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id, number_series, name, phone_no, status, note, date_time, payment_type, complete_amount
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const normalizedDateTime = normalizeDateValue(date_time) || new Date().toISOString().split('T')[0];
    const amountVal = parseFloat(complete_amount || 0);
    const finalStatus = (status || 'COMPLETE').toUpperCase();

    const updateData = {
      number_series: (number_series || '').trim(),
      name: (name || '').trim(),
      phone_no: (phone_no || '').trim(),
      status: finalStatus,
      date_time: normalizedDateTime,
      complete_amount: amountVal,
      pending_amount: amountVal,
      payment_type: payment_type || 'CASH',
      note: (note || '').trim(),
      updated_at: new Date().toISOString()
    };

    const recordRef = doc(db, 'accounts', id);
    await updateDoc(recordRef, updateData);

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error) {
    console.error('Error updating Account record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update Account record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete Account record
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const recordRef = doc(db, 'accounts', id);
    await deleteDoc(recordRef);

    return NextResponse.json({ success: true, message: 'Account record deleted successfully' });
  } catch (error) {
    console.error('Error deleting Account record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete Account record' },
      { status: 500 }
    );
  }
}

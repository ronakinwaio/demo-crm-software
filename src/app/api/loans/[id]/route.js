import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET single loan by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const loanRef = doc(db, 'loans', id);
    const loanSnap = await getDoc(loanRef);

    if (!loanSnap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Loan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id: loanSnap.id, ...loanSnap.data() } });
  } catch (error) {
    console.error('Error fetching loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loan' },
      { status: 500 }
    );
  }
}

// PUT - Update loan
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    let body = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = {
        date: formData.get('date'),
        name: formData.get('name'),
        phone_no: formData.get('phone_no'),
        loan_type: formData.get('loan_type'),
        lander: formData.get('lander') || formData.get('bank_name'),
        loan_amount: formData.get('loan_amount'),
        charge: formData.get('charge'),
      };
    }

    const loanRef = doc(db, 'loans', id);
    const updateData = {
      name: (body.name || '').trim(),
      phone_no: (body.phone_no || '').trim(),
      loan_type: (body.loan_type || '').trim(),
      lander: (body.lander || '').trim(),
      loan_amount: String(body.loan_amount || '0').trim(),
      charge: String(body.charge || '0').trim(),
      updated_at: new Date().toISOString()
    };
    if (body.date) {
      updateData.date = body.date;
    }

    await updateDoc(loanRef, updateData);

    return NextResponse.json({
      success: true,
      data: { id, ...updateData }
    });
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete loan directly in 1 round trip
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const loanRef = doc(db, 'loans', id);
    await deleteDoc(loanRef);

    return NextResponse.json({ success: true, message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete loan' },
      { status: 500 }
    );
  }
}

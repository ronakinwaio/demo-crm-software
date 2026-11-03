import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET all loans
export async function GET() {
  try {
    const q = query(collection(db, 'loans'), orderBy('created_at', 'desc'));
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
    console.error('Error fetching loans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST - Create new loan
export async function POST(request) {
  try {
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

    // Efficiently determine next number series by querying recent loans
    const qLatest = query(collection(db, 'loans'), orderBy('created_at', 'desc'), limit(25));
    const loansSnapshot = await getDocs(qLatest);
    let maxNum = 0;
    loansSnapshot.forEach(docSnap => {
      const ns = docSnap.data().number_series;
      if (ns && ns.startsWith('L-')) {
        const num = parseInt(ns.substring(2), 10);
        if (num > maxNum) maxNum = num;
      }
    });

    // Fallback if no recent loans with L- were found
    if (maxNum === 0 && loansSnapshot.empty) {
      maxNum = 0;
    }

    const number_series = `L-${maxNum + 1}`;
    const loanDate = body.date || new Date().toISOString().split('T')[0];

    const loanData = {
      number_series,
      date: loanDate,
      name: (body.name || '').trim(),
      phone_no: (body.phone_no || '').trim(),
      loan_type: (body.loan_type || '').trim(),
      lander: (body.lander || '').trim(),
      loan_amount: String(body.loan_amount || '0').trim(),
      charge: String(body.charge || '0').trim(),
      created_at: new Date().toISOString()
    };

    const newLoanRef = doc(collection(db, 'loans'));
    const writePromises = [setDoc(newLoanRef, loanData)];

    // Concurrently auto-create Account entry if charge exists and is > 0
    const chargeNum = parseFloat(loanData.charge || 0);
    if (chargeNum > 0) {
      const newAccountRef = doc(collection(db, 'accounts'));
      const accountData = {
        number_series: loanData.number_series,
        date_time: loanDate,
        name: loanData.name,
        phone_no: loanData.phone_no,
        status: 'COMPLETE',
        complete_amount: chargeNum,
        pending_amount: chargeNum,
        payment_type: 'CASH',
        note: `Loan Charge (${loanData.number_series})`,
        created_at: new Date().toISOString()
      };
      writePromises.push(setDoc(newAccountRef, accountData));
    }

    // Execute all writes in parallel
    await Promise.all(writePromises);

    return NextResponse.json({
      success: true,
      data: { id: newLoanRef.id, ...loanData }
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create loan' },
      { status: 500 }
    );
  }
}

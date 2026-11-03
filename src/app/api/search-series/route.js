import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const series = searchParams.get('series');

    if (!series) {
      return NextResponse.json(
        { success: false, message: 'Series number is required' },
        { status: 400 }
      );
    }

    let collectionName = '';

    if (series.startsWith('L-')) {
      collectionName = 'loans';
    } else if (series.startsWith('G-')) {
      collectionName = 'gst_records';
    } else if (series.startsWith('I-')) {
      collectionName = 'income_tax_records';
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid series format' },
        { status: 400 }
      );
    }

    // Limit to 1 document for instantaneous search
    const q = query(
      collection(db, collectionName),
      where('number_series', '==', series),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return NextResponse.json({
        success: true,
        data: {
          name: data.name || '',
          phone_no: data.phone_no || '',
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Record not found for this series number' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error searching series:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

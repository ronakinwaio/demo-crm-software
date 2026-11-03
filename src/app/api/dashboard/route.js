import { db } from '../../../lib/firebase';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Run all Firestore reads concurrently in parallel
    const [loansSnapshot, accountsSnapshot, usersCountSnap] = await Promise.all([
      getDocs(collection(db, 'loans')).catch((e) => {
        console.error('Error fetching loans in dashboard:', e);
        return { docs: [] };
      }),
      getDocs(collection(db, 'accounts')).catch((e) => {
        console.error('Error fetching accounts in dashboard:', e);
        return { docs: [] };
      }),
      getCountFromServer(collection(db, 'users')).catch(() => ({
        data: () => ({ count: 0 })
      }))
    ]);

    let totalLoans = 0;
    let totalLoanAmount = 0;
    const recentLoans = [];

        loansSnapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          totalLoans += 1;
          totalLoanAmount += parseFloat(data.loan_amount || 0);

          recentLoans.push({
            id: docSnap.id,
            name: data.name,
            created_at: data.created_at || data.date,
            type: 'Loan'
          });
      });

      const recentAccount = [];
          accountsSnapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            recentAccount.push({
              id: docSnap.id,
              name: data.name,
              created_at: data.created_at || data.date_time,
              type: 'Account'
            });
        });

        // Combine and sort recent activities (top 10 latest)
        const allActivities = [
          ...recentLoans,
          ...recentAccount
        ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 10);

        const totalClients = typeof usersCountSnap.data === 'function' ? (usersCountSnap.data()?.count || 0) : 0;
        const totalAccount = accountsSnapshot.docs.length;

        const dashboardData = {
          stats: {
            totalLoans,
            totalClients,
            totalLoanAmount,
            totalAccount,
          },
          recentActivities: allActivities
        };

        return NextResponse.json(
          { success: true, data: dashboardData },
          {
            headers: {
              'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
          }
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
          { success: false, message: 'Failed to fetch dashboard data' },
          { status: 500 }
        );
      }
    }

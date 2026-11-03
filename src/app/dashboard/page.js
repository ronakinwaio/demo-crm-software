'use client';

import { useState, useEffect } from 'react';
import { formatDisplayText } from '../../utils/formatText';

export default function Dashboard() {
  const [data, setData] = useState({
    stats: {
      totalLoans: 0,
      totalClients: 0,
      totalLoanAmount: 0,
      totalAccount: 0,
      totalOthers: 0
    },
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard', { cache: 'no-store' });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    if (num >= 10000000) {
      return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
      return '₹' + (num / 100000).toFixed(2) + ' L';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCardClick = (cardType) => {
    const routes = {
      'Loan': '/dashboard/loan',
      'Account': '/dashboard/account',
    };

    if (routes[cardType]) {
      window.location.href = routes[cardType];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Loan Card */}
            <div
              onClick={() => handleCardClick('Loan')}
              className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-blue-600 hover:shadow-md cursor-pointer hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center">
                <div className="p-3.5 bg-blue-50 rounded-2xl">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3h12M6 8h12M14.5 21L6 13h4.5c4.5 0 4.5-5 0-5" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Loan Amount</p>
                  <p className={`font-extrabold text-slate-900 ${data.stats.totalLoanAmount > 999999 ? 'text-2xl' : 'text-3xl'} mt-0.5`}>
                    {formatCurrency(data.stats.totalLoanAmount)}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">Total Active Loans: {data.stats.totalLoans || 0}</p>
                </div>
              </div>
            </div>

            {/* Account Card */}
            <div
              onClick={() => handleCardClick('Account')}
              className="bg-white rounded-2xl shadow-sm p-6 border-t-4 border-sky-600 hover:shadow-md cursor-pointer hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center">
                <div className="p-3.5 bg-sky-50 rounded-2xl">
                  <svg className="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account Records</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{data.stats.totalAccount?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-sky-600 font-medium mt-1">Total transactions and entries</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Activities Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Activities</h2>
            <p className="text-xs text-gray-500">Summary of the latest 10 activities</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {!loading && data.recentActivities.length > 0 ? (
                data.recentActivities.map((activity, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors cursor-default">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.type === 'Loan' ? 'bg-blue-100 text-blue-800' :
                        'bg-sky-100 text-sky-800'
                        }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{formatDisplayText(activity.name || 'N/A')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(activity.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No recent activities found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";
import { usePathname } from 'next/navigation';

export default function Navbar({ user, onMenuClick }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard';
      case '/dashboard/loan': return 'Loan Management';
      case '/dashboard/account': return 'Account Management';
      case '/dashboard/daily-hisab': return 'Daily Hisab';
      case '/dashboard/policy': return 'Policy Management';
      case '/dashboard/settings': return 'Settings';
      default: return 'Overview';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 border-gray-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and Page Title */}
          <div className="flex items-center flex-1">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 lg:hidden mr-4"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-wide">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Right side - Profile info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center space-x-3 p-2 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold pt-[1px] text-xs">
                    KR
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">Kartik Rathod</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@gmail.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

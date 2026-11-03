"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggle,
}) {
  const pathname = usePathname();

  // Proper logout function
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Logged out successfully!");
        window.location.href = "/admin";
      } else {
        toast.error(data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Network error during logout.");
      window.location.href = "/admin";
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Loan", href: "/dashboard/loan", icon: "💸" },
    { name: "Account", href: "/dashboard/account", icon: "👤" },
    { name: "Daily Hisab", href: "/dashboard/daily-hisab", icon: "📈" },
    { name: "Policy", href: "/dashboard/policy", icon: "🛡️" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed top-0 left-0 z-50 h-screen
    ${isCollapsed ? "w-20" : "w-52"}
    bg-[#0b192c]
    border-r border-[#1e2e4a]
    transform transition-all duration-300 ease-in-out
    flex flex-col
    shadow-2xl
    overflow-visible
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        {/* Header */}
        <div
          className={`
            relative flex items-center
            ${isCollapsed ? "justify-center h-20" : "justify-center h-28"}
            border-b border-[#1e2e4a]
            px-4
            bg-[#071324]
          `}
        >
          {/* Logo / Brand */}
          <div className="relative flex items-center justify-center">
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-blue-900/50 ring-2 ring-blue-400/30">
                KR
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-900/50 mb-1.5 ring-2 ring-blue-400/30">
                  KR
                </div>
                <span className="font-extrabold text-white text-[15px] tracking-wide whitespace-nowrap">
                  Kartik Rathod
                </span>
                <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">
                  Consultancy
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle */}
          <button
            onClick={onToggle}
            className="
              hidden lg:flex
              absolute -right-4 top-1/2 -translate-y-1/2
              w-8 h-8
              bg-blue-600
              rounded-full
              items-center justify-center
              text-white
              shadow-lg shadow-blue-900/50
              hover:bg-blue-500
              hover:scale-110
              transition-all
              z-50
            "
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-4 text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className={`flex-1 px-3 py-5 custom-scrollbar ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
          <div className="space-y-2.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group relative flex items-center
                    ${isCollapsed ? "justify-center" : ""}
                    h-12 rounded-xl
                    transition-all duration-200
                    px-3
                    overflow-visible
                    ${isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-300 hover:bg-[#162740] hover:text-white"
                    }
                  `}
                >
                  <span
                    className={`
                      text-xl
                      ${isCollapsed ? "" : "mr-3"}
                      transition-transform duration-200
                      group-hover:scale-110
                    `}
                  >
                    {item.icon}
                  </span>

                  {!isCollapsed && (
                    <span className="font-semibold text-[14px] whitespace-nowrap">
                      {item.name}
                    </span>
                  )}

                  {/* Tooltip */}
                  {isCollapsed && (
                    <div
                      className="
                        absolute left-[80px] top-1/2 -translate-y-1/2
                        px-3 py-1.5
                        bg-blue-600
                        text-white
                        text-xs font-semibold
                        rounded-lg
                        opacity-0 invisible
                        group-hover:opacity-100
                        group-hover:visible
                        transition-all duration-200
                        whitespace-nowrap
                        shadow-2xl
                        z-[99999]
                        pointer-events-none
                      "
                    >
                      {item.name}
                      <div className="absolute top-1/2 -left-1 w-2 h-2 bg-blue-600 rotate-45 -translate-y-1/2" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#1e2e4a] bg-[#071324]">
          <button
            onClick={handleLogout}
            className={`
              group relative flex items-center
              ${isCollapsed ? "justify-center" : ""}
              w-full h-12 px-3
              rounded-xl
              bg-gradient-to-r from-blue-600 to-blue-700
              text-white
              font-semibold
              hover:from-blue-500 hover:to-blue-600
              shadow-md shadow-blue-900/30
              transition-all duration-200
              active:scale-95
            `}
          >
            <svg
              className={`w-5 h-5 ${isCollapsed ? "" : "mr-2.5"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>

            {!isCollapsed && <span className="text-sm">Logout</span>}

            {/* Tooltip */}
            {isCollapsed && (
              <div
                className="
                  absolute left-[80px] top-1/2 -translate-y-1/2
                  px-3 py-1.5
                  bg-blue-600
                  text-white
                  text-xs font-semibold
                  rounded-lg
                  opacity-0 invisible
                  group-hover:opacity-100
                  group-hover:visible
                  transition-all duration-200
                  whitespace-nowrap
                  shadow-2xl
                  z-[99999]
                  pointer-events-none
                "
              >
                Logout
                <div className="absolute top-1/2 -left-1 w-2 h-2 bg-blue-600 rotate-45 -translate-y-1/2" />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

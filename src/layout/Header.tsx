import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Briefcase, Menu, User, LogOut } from "lucide-react";
import Search from "../components/Search";
import { LoginPage } from "../components/LoginPage";
import Breadcrumbs from "../components/Breadcrumbs";
import { useAuth } from "../hooks/useAuth";

const Header: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLoginClick = () => setShowLogin(true);
  const handleCloseLogin = () => setShowLogin(false);
  const handleLogout = () => {
    logout();
    setShowLogin(false);
  };

  return (
    <header className="sticky top-0 z-[100] bg-teal-600 shadow-md border-b border-teal-500">
      <div className="py-3 sm:py-4">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center gap-3 mb-3 px-4 sm:px-6">
            <div className="w-8 h-8 flex-shrink-0">
              <SidebarTrigger className="w-full h-full p-1 text-white hover:bg-teal-700 rounded-md flex items-center justify-center [&_svg]:size-6">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Toggle navigation menu</span>
                <span className="sr-only">Toggle Sidebar</span>
              </SidebarTrigger>
            </div>
            <Briefcase className="h-5 w-5 text-white flex-shrink-0" />
            <h1 className="text-lg font-bold text-white truncate">
              Roger Lee Cormier Portfolio
            </h1>
          </div>
          <div className="w-full flex items-center gap-2 px-4 sm:px-6">
            <div className="flex-1 min-w-0">
              <div className="w-full max-w-[340px]">
                <Search />
              </div>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-white text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden xs:inline">{user?.email}</span>
                </div>
                <button
                  className="px-3 py-2 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700 transition flex items-center gap-1"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xs:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                className="px-3 py-2 bg-white text-teal-700 font-semibold rounded shadow hover:bg-teal-50 transition disabled:opacity-50"
                onClick={handleLoginClick}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            )}
          </div>
          {/* Breadcrumbs below search on mobile */}
          <div className="mt-2 px-6">
            <Breadcrumbs />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between gap-3 mb-3 pr-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 pl-3">
            <div className="w-10 h-10 flex-shrink-0">
              <SidebarTrigger className="w-full h-full p-1 text-white hover:bg-teal-700 rounded-md flex items-center justify-center [&_svg]:size-6">
                <Menu aria-hidden="true" />
                <span className="sr-only">Toggle navigation menu</span>
                <span className="sr-only">Toggle Sidebar</span>
              </SidebarTrigger>
            </div>
            <Briefcase className="h-6 w-6 text-white flex-shrink-0" />
            <h1 className="text-xl font-bold text-white truncate">
              Roger Lee Cormier - Portfolio
            </h1>
          </div>
          {/* Search and Login button row */}
          <div className="flex items-center gap-2 h-10 flex-shrink-0 ml-auto">
            <div className="flex-1 min-w-0">
              <Search />
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white text-sm">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <button
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700 transition flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="px-4 py-2 bg-white text-teal-700 font-semibold rounded shadow hover:bg-teal-50 transition disabled:opacity-50"
                onClick={handleLoginClick}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumbs below header on desktop */}
        <div className="hidden lg:block px-6">
          <Breadcrumbs />
        </div>
      </div>
      {/* Login modal */}
      {showLogin && !isAuthenticated && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white rounded shadow-lg p-6 relative overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-teal-700"
              onClick={handleCloseLogin}
              aria-label="Close login modal"
            >
              ✕
            </button>
            <LoginPage onClose={handleCloseLogin} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
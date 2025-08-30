import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, User, LogOut } from "lucide-react";
import RedesignedSearch from "../components/RedesignedSearch";
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

  // Helper function to safely get user email
  const getUserEmail = (): string => {
    if (user && typeof user === 'object' && 'email' in user) {
      return user.email || '';
    }
    return '';
  };

  return (
    <header className="sticky top-0 z-10 bg-teal-600 shadow-md border-b border-teal-500">
      <div className="py-3 sm:py-4">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center gap-3 mb-3 px-4 sm:px-6">
            <div className="w-8 h-8 flex-shrink-0">
              <SidebarTrigger className="w-full h-full p-1 text-white hover:bg-teal-700 rounded-md flex items-center justify-center [&_svg]:size-6">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Toggle navigation menu</span>
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
                <RedesignedSearch />
              </div>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-white text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden xs:inline">{getUserEmail()}</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xs:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLoginClick}
                disabled={isLoading}
                className="bg-white text-teal-700 hover:bg-teal-50"
              >
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
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
              </SidebarTrigger>
            </div>
            <Briefcase className="h-6 w-6 text-white flex-shrink-0" />
            <h1 className="text-xl font-bold text-white truncate">
              Roger Lee Cormier Portfolio
            </h1>
          </div>
          {/* Search and Login button row */}
          <div className="flex items-center gap-2 h-10 flex-shrink-0 ml-auto">
            <div className="flex-1 min-w-0">
              <RedesignedSearch />
            </div>
            {isAuthenticated ? (
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleLoginClick}
                disabled={isLoading}
                className="bg-white text-teal-700 hover:bg-teal-50"
              >
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
            )}
          </div>
        </div>

        {/* Breadcrumbs below header on desktop */}
        <div className="hidden lg:block px-6">
          <div className="flex items-center justify-between">
            <Breadcrumbs />
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-white text-sm">
                <User className="h-4 w-4" />
                <span className="text-xs">{getUserEmail()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Login Dialog using shadcn Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login to Your Account</DialogTitle>
          </DialogHeader>
          <LoginPage onClose={handleCloseLogin} />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
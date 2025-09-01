import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";
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

  const getUserEmail = (): string => {
    if (user && typeof user === 'object' && 'email' in user) {
      return user.email || '';
    }
    return '';
  };

  return (
    <>
      {/* Fixed Header - Always visible */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700">
          {/* Left Section: Hamburger + Logo + Name */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <SidebarTrigger className="w-9 h-9 p-2 text-white hover:bg-teal-700/80 rounded-lg flex items-center justify-center transition-colors">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SidebarTrigger>
            
                                                  {/* Larger Logo */}
            <img 
              src="/header-logo.svg" 
              alt="RCormier Logo" 
              className="w-16 h-16"
              onError={(e) => {
                console.error('Failed to load header logo:', e);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => console.log('Header logo loaded successfully')}
            />
            
            {/* Name and Tagline Container */}
            <div className="block">
              {/* Name with custom font styling - responsive sizing */}
              <h1 className="header-name text-lg sm:text-xl text-white leading-tight">
                Roger Lee Cormier
              </h1>
              {/* Creative tagline fitting the targeting reticle theme */}
              <p className="header-tagline text-xs sm:text-sm text-teal-100 leading-tight">
                Targeting Digital Transformation
              </p>
            </div>
          </div>

          {/* Center Section: Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <RedesignedSearch />
          </div>

          {/* Right Section: Login/Logout */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-white text-sm">
                  <User className="h-4 w-4" />
                  <span className="text-xs">{getUserEmail()}</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLoginClick}
                disabled={isLoading}
                className="bg-white text-teal-700 hover:bg-teal-50 border-white/20"
              >
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar Row (Mobile) */}
        <div className="md:hidden px-4 py-3 bg-white border-b border-gray-100">
          <RedesignedSearch />
        </div>

        {/* Breadcrumbs Row - Dark teal background for better visibility */}
        <div className="px-4 h-12 bg-teal-700 border-b border-teal-600 flex items-center">
          <div className="w-full">
            <Breadcrumbs />
          </div>
        </div>
      </div>



      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login to Your Account</DialogTitle>
          </DialogHeader>
          <LoginPage onClose={handleCloseLogin} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
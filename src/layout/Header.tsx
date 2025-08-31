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
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700">
          {/* Left Section: Hamburger + Logo + Name */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <SidebarTrigger className="w-9 h-9 p-2 text-white hover:bg-teal-700/80 rounded-lg flex items-center justify-center transition-colors">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SidebarTrigger>
            
                                      {/* Modern Logo Icon - Crosshairs Bullseye Design */}
             <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
               {/* White background */}
               <rect width="32" height="32" rx="6" fill="white"/>
               
               {/* Crosshairs bullseye design */}
               <g>
                 {/* Outer bullseye ring */}
                 <circle cx="16" cy="16" r="14" fill="none" stroke="url(#outerRingGradient)" strokeWidth="2"/>
                 
                 {/* Middle bullseye ring */}
                 <circle cx="16" cy="16" r="10" fill="none" stroke="url(#middleRingGradient)" strokeWidth="2"/>
                 
                 {/* Inner bullseye ring */}
                 <circle cx="16" cy="16" r="6" fill="none" stroke="url(#innerRingGradient)" strokeWidth="2"/>
                 
                 {/* Horizontal crosshair line */}
                 <line x1="4" y1="16" x2="28" y2="16" stroke="url(#crosshairGradient)" strokeWidth="1" strokeLinecap="round"/>
                 
                 {/* Vertical crosshair line */}
                 <line x1="16" y1="4" x2="16" y2="28" stroke="url(#crosshairGradient)" strokeWidth="1" strokeLinecap="round"/>
                 
                 {/* Center dot */}
                 <circle cx="16" cy="16" r="1.5" fill="url(#centerGradient)"/>
               </g>
               
               {/* Gradient definitions */}
               <defs>
                 <linearGradient id="outerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" style={{stopColor:"#0066FF",stopOpacity:1}} />
                   <stop offset="100%" style={{stopColor:"#00D4FF",stopOpacity:1}} />
                 </linearGradient>
                 
                 <linearGradient id="middleRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" style={{stopColor:"#0099FF",stopOpacity:1}} />
                   <stop offset="100%" style={{stopColor:"#00E6FF",stopOpacity:1}} />
                 </linearGradient>
                 
                 <linearGradient id="innerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" style={{stopColor:"#00CCFF",stopOpacity:1}} />
                   <stop offset="100%" style={{stopColor:"#00F0FF",stopOpacity:1}} />
                 </linearGradient>
                 
                 <linearGradient id="crosshairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" style={{stopColor:"#FFFFFF",stopOpacity:0.9}} />
                   <stop offset="100%" style={{stopColor:"#F0F9FF",stopOpacity:0.9}} />
                 </linearGradient>
                 
                 <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" style={{stopColor:"#00D4FF",stopOpacity:1}} />
                   <stop offset="100%" style={{stopColor:"#00F5FF",stopOpacity:1}} />
                 </linearGradient>
               </defs>
             </svg>
            
            {/* Name */}
            <h1 className="text-lg font-bold text-white hidden sm:block">
              Roger Lee Cormier
            </h1>
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
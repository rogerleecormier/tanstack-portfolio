// Cloudflare Access Authentication Utility
// This handles authentication through Cloudflare Access with One-Time PIN (OTP)

export interface CloudflareUser {
  email: string;
  name?: string;
  picture?: string;
  sub?: string; // Subject identifier
}

// Check if user is authenticated via Cloudflare Access
export const isAuthenticated = (): boolean => {
  // Cloudflare Access sets cookies when authenticated via OTP
  // We can check for the presence of these cookies
  return document.cookie.includes('CF_Authorization') || 
         document.cookie.includes('CF_Access_JWT') ||
         document.cookie.includes('CF_Access_Email') ||
         localStorage.getItem('cf_user') !== null;
};

// Get user information from Cloudflare Access
export const getUserInfo = (): CloudflareUser | null => {
  try {
    const userData = localStorage.getItem('cf_user');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Try to get from cookie if available
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('CF_Authorization='));
    
    if (authCookie) {
      const token = authCookie.split('=')[1];
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.email,
        name: payload.name,
        sub: payload.sub
      };
    }
    
    // Check for OTP authentication
    const emailCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('CF_Access_Email='));
    
    if (emailCookie) {
      const email = emailCookie.split('=')[1];
      return {
        email: decodeURIComponent(email),
        name: 'Authenticated User'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

// Store user information locally
export const setUserInfo = (user: CloudflareUser): void => {
  localStorage.setItem('cf_user', JSON.stringify(user));
};

// Clear user information
export const clearUserInfo = (): void => {
  localStorage.removeItem('cf_user');
  // Clear any other auth-related data
  document.cookie = 'CF_Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'CF_Access_JWT=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'CF_Access_Email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Redirect to Cloudflare Access login (OTP)
export const login = (): void => {
  // Cloudflare Access handles the OTP flow automatically
  // Just redirect to the protected page, and Access will show OTP login if needed
  window.location.href = '/protected';
};

// Logout (redirect to Cloudflare Access logout)
export const logout = (): void => {
  clearUserInfo();
  // Redirect to Cloudflare Access logout endpoint
  window.location.href = '/cdn-cgi/access/logout';
};

// Check if user has access to specific resources
export const hasAccess = (): boolean => {
  const user = getUserInfo();
  if (!user) return false;
  
  // Add your access control logic here
  // For OTP authentication, restrict to your personal domain
  const allowedEmails = ['roger@rcormier.dev'];
  const allowedDomains = ['rcormier.dev'];
  
  // Check exact email match
  if (allowedEmails.includes(user.email)) {
    return true;
  }
  
  // Check domain match (for additional rcormier.dev emails)
  const userDomain = user.email.split('@')[1];
  if (allowedDomains.includes(userDomain)) {
    return true;
  }
  
  return false;
};

// Initialize authentication state
export const initAuth = (): void => {
  // Check if we're returning from a Cloudflare Access redirect
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  
  if (accessToken) {
    // Store the token and clear URL params
    localStorage.setItem('cf_access_token', accessToken);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

// Environment configuration for development vs production

// Helper functions that don't depend on the environment object
const isDevelopmentMode = (): boolean => {
  return import.meta.env.DEV || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost') ||
         window.location.hostname.includes('192.168.') ||
         window.location.hostname.includes('10.0.');
};

const isProductionMode = (): boolean => {
  return import.meta.env.PROD && !isDevelopmentMode();
};

export const environment = {
  // Check if we're in development mode
  isDevelopment: isDevelopmentMode,

  // Check if we're in production mode
  isProduction: isProductionMode,

  // Home page URL
  homePageUrl: '/',

  // Mock authentication settings for development
  mockAuth: {
    enabled: isDevelopmentMode(),
    defaultUser: {
      email: 'dev@rcormier.dev',
      name: 'Development User',
      picture: undefined,
      sub: 'dev-user-123'
    }
  },

  // Cloudflare Access settings
  cloudflareAccess: {
    enabled: isProductionMode(),
    loginUrl: '/cdn-cgi/access/login',
    logoutUrl: '/cdn-cgi/access/logout',
    identityUrl: '/cdn-cgi/access/get-identity',
    // Cloudflare Access parameter names as per official documentation
    loginRedirectParam: 'redirect_url', // for /login: restricted to relative paths
    logoutRedirectParam: 'returnTo',    // for /logout: restricted to authdomain, cloudflare.com subdomains, and org apps
    cliRedirectParam: 'redirect_url'    // for /cli: restricted to org apps
  }
};

export default environment;

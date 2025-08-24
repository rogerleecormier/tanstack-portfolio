// Security Headers Configuration
// This file defines security headers and CSP policies for the application

export interface SecurityHeaders {
  [key: string]: string;
}

export interface CSPDirective {
  [key: string]: string[];
}

// Content Security Policy configuration
export const cspConfig: CSPDirective = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React development
    "'unsafe-eval'",   // Required for some development tools
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
  ],
  'img-src': [
    "'self'",
    "data:",
    "https:",
    "blob:"
  ],
  'font-src': [
    "'self'",
    "data:",
    "https:"
  ],
  'connect-src': [
    "'self'",
    "https://health-bridge-api.rcormier.workers.dev",
    "wss:", // For development hot reload
    "ws:"   // For development hot reload
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
  'block-all-mixed-content': [],
  'require-trusted-types-for': ["'script'"],
  'trusted-types': [
    'default',
    "'allow-duplicates'"
  ]
};

// Convert CSP directives to header string
export const generateCSPHeader = (): string => {
  return Object.entries(cspConfig)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Security headers configuration
export const securityHeaders: SecurityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  
  // Strict transport security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cache control for sensitive pages
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  
  // Pragma for backward compatibility
  'Pragma': 'no-cache',
  
  // Expires header
  'Expires': '0'
};

// Development-specific security headers (less restrictive)
export const developmentSecurityHeaders: SecurityHeaders = {
  ...securityHeaders,
  // Allow more flexibility in development
  'Content-Security-Policy': generateCSPHeader().replace(
    "'unsafe-eval'",
    "'unsafe-eval' 'unsafe-inline'"
  ),
  // Less restrictive cache control for development
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

// Get appropriate security headers based on environment
export const getSecurityHeaders = (): SecurityHeaders => {
  if (import.meta.env.DEV) {
    return developmentSecurityHeaders;
  }
  return securityHeaders;
};

// Security middleware configuration
export const securityMiddlewareConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Helmet configuration
  helmet: {
    contentSecurityPolicy: {
      directives: cspConfig,
    },
    crossOriginEmbedderPolicy: false, // Required for some development tools
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://rcormier.dev', 'https://www.rcormier.dev']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  }
};

export default securityHeaders;

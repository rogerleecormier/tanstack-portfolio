// Access Control Configuration
// This file manages which email addresses and domains are allowed to access protected content

export interface AccessControlConfig {
  // Individual email addresses that are explicitly allowed
  allowedEmails: string[];
  
  // Domains where any email address from that domain is allowed
  allowedDomains: string[];
  
  // Description of the access control system
  description: string;
}

export const accessControl: AccessControlConfig = {
  // Individual email addresses that are explicitly allowed
  allowedEmails: [
    'roger@rcormier.dev',
    'rogerleecormier@gmail.com'
  ],
  
  // Domains where any email address from that domain is allowed
  // Note: Gmail accounts are NOT included here - only specific Gmail emails are allowed
  allowedDomains: [
    'rcormier.dev'
  ],
  
  // Description of the access control system
  description: `
    Access Control Rules:
    - Specific emails: Only the exact email addresses listed above are allowed
    - Domain access: Any email from rcormier.dev domain is allowed
    - Gmail accounts: Only rogerleecormier@gmail.com is allowed (not all Gmail accounts)
    - All other emails are denied access to protected content
  `
};

// Helper function to check if an email has access
export const isEmailAllowed = (email: string): boolean => {
  // Check exact email match
  if (accessControl.allowedEmails.includes(email)) {
    return true;
  }
  
  // Check domain match
  const userDomain = email.split('@')[1];
  if (accessControl.allowedDomains.includes(userDomain)) {
    return true;
  }
  
  return false;
};

// Helper function to get all allowed email patterns (for debugging/logging)
export const getAllowedPatterns = (): string[] => {
  const patterns = [
    ...accessControl.allowedEmails,
    ...accessControl.allowedDomains.map(domain => `*@${domain}`)
  ];
  return patterns;
};

export default accessControl;

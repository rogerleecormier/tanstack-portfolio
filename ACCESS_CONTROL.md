# Access Control Configuration

This document explains how to manage email access control for the portfolio application's Cloudflare Access authentication system.

## Quick Configuration

To modify which emails can access protected content, edit `src/config/accessControl.ts`:

### **Current Access Rules**
```typescript
// src/config/accessControl.ts
export const accessControl: AccessControlConfig = {
  // Individual email addresses that are explicitly allowed
  allowedEmails: [
    'roger@rcormier.dev',
    'rogerleecormier@gmail.com'
  ],
  
  // Domains where any email address from that domain is allowed
  allowedDomains: [
    'rcormier.dev'
  ]
};
```

### **Adding/Removing Individual Emails**
```typescript
allowedEmails: [
  'roger@rcormier.dev',           // ✅ Keep this
  'rogerleecormier@gmail.com',    // ✅ Keep this
  'newuser@example.com',          // ➕ Add new emails here
  'another@company.com'           // ➕ Add new emails here
],
```

### **Adding/Removing Domain Access**
```typescript
allowedDomains: [
  'rcormier.dev',                 // ✅ Any email from rcormier.dev works
  'company.com',                  // ➕ Add new domains here
  'trusted.org'                   // ➕ Add new domains here
],
```

## Current Access Rules

- **roger@rcormier.dev** - ✅ Allowed (exact match)
- **rogerleecormier@gmail.com** - ✅ Allowed (exact match)
- **any-email@rcormier.dev** - ✅ Allowed (domain match)
- **other@gmail.com** - ❌ Denied (not in allowed list)
- **user@otherdomain.com** - ❌ Denied (domain not allowed)

## How It Works

1. **Exact Email Match**: If the user's email exactly matches any email in `allowedEmails`, access is granted
2. **Domain Match**: If the user's email domain matches any domain in `allowedDomains`, access is granted
3. **All Other Emails**: Access is denied

## Important Notes

- **Gmail accounts are NOT automatically allowed** - only specific Gmail emails you add to `allowedEmails`
- **Domain access is broad** - any email from an allowed domain will work
- **Changes take effect immediately** - no server restart needed
- **The config file is version controlled** - changes will be tracked in git
- **Access control works with Cloudflare Access** - emails are validated against this configuration

## Example Scenarios

### Allow a new Gmail user
```typescript
allowedEmails: [
  'roger@rcormier.dev',
  'rogerleecormier@gmail.com',
  'newuser@gmail.com'  // ➕ Add this line
],
```

### Allow all emails from a company
```typescript
allowedDomains: [
  'rcormier.dev',
  'company.com'  // ➕ Add this line
],
```

### Remove access for a specific user
```typescript
allowedEmails: [
  'roger@rcormier.dev',
  // 'rogerleecormier@gmail.com',  // ➖ Comment out or remove this line
],
```

## File Location

- **Configuration**: `src/config/accessControl.ts`
- **Documentation**: `ACCESS_CONTROL.md` (this file)
- **Implementation**: `src/utils/cloudflareAuth.ts`

## Cloudflare Access Integration

### **How It Works Together**
1. **User Authentication**: Cloudflare Access handles the authentication flow
2. **Email Validation**: After authentication, the user's email is checked against `accessControl.ts`
3. **Access Decision**: Access is granted only if the email is in the allowed list
4. **Route Protection**: Protected routes check both authentication and email access

### **Cloudflare Access Setup**
- Configure Cloudflare Access for your domain
- Set up identity providers (Google SSO, etc.)
- Configure access policies to allow authenticated users
- The application will handle email-based access control

## Security Best Practices

1. **Regular Review**: Periodically review and update allowed emails/domains
2. **Principle of Least Privilege**: Only grant access to necessary users
3. **Domain Restrictions**: Be careful with broad domain access
4. **Version Control**: Track all access control changes in git
5. **Documentation**: Keep this file updated with current access rules

## Troubleshooting

### **Common Issues**

#### **User can't access protected content**
- Verify the user's email is in `allowedEmails` or their domain is in `allowedDomains`
- Check that Cloudflare Access authentication is working
- Verify the user is properly authenticated

#### **Domain access not working**
- Ensure the domain is correctly added to `allowedDomains`
- Check for typos in domain names
- Verify the user's email domain exactly matches

#### **Changes not taking effect**
- Ensure the file is saved
- Check that the application is using the updated configuration
- Verify no syntax errors in the TypeScript file

---

**Note**: This access control system works in conjunction with Cloudflare Access to provide secure, email-based access management for your portfolio application.

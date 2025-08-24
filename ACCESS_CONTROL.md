# Access Control Configuration

This document explains how to manage email access control for the portfolio application.

## Quick Configuration

To modify which emails can access protected content, edit `src/config/accessControl.ts`:

### Adding/Removing Individual Emails

```typescript
allowedEmails: [
  'roger@rcormier.dev',           // ✅ Keep this
  'rogerleecormier@gmail.com',    // ✅ Keep this
  'newuser@example.com',          // ➕ Add new emails here
  'another@company.com'           // ➕ Add new emails here
],
```

### Adding/Removing Domain Access

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

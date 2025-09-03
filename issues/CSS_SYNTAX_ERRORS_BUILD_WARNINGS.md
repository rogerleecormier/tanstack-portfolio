# CSS Syntax Errors in Build Warnings

## Issue Description
The build process is generating CSS syntax errors that are causing warnings during the esbuild CSS minification step. These errors need to be resolved to ensure clean builds and prevent potential runtime issues.

## Error Details
The following CSS syntax errors are occurring:

1. **Expected identifier but found "-"** at line 3756:
   ```
   -: \s|;
   ```
   This suggests there's an invalid CSS selector or property name starting with a hyphen.

2. **Unexpected "pre"** at line 3821:
   ```
   ...bg-muted[data-state=selected]pre.overflow-x-auto.rounded-lg.b...
   ```
   This appears to be a malformed CSS class chain or selector.

## Impact
- Build warnings that may indicate underlying CSS issues
- Potential runtime styling problems
- Clean build process disruption

## Root Cause Analysis Needed
The errors suggest:
- Invalid CSS selectors or class names
- Possible issues with Tailwind CSS class generation
- Malformed CSS in component styles
- Potential issues with CSS-in-JS or styled components

## Investigation Steps
1. Search for CSS classes or selectors containing hyphens at the beginning
2. Look for malformed class chains in components
3. Check for any custom CSS that might be causing conflicts
4. Review Tailwind CSS configuration and usage
5. Examine any CSS-in-JS implementations

## Files to Investigate
- All component files using Tailwind classes
- Custom CSS files
- Tailwind configuration
- Any styled-components or CSS-in-JS files

## Expected Resolution
- Identify and fix invalid CSS selectors
- Ensure proper Tailwind class usage
- Clean up any malformed CSS
- Verify build process completes without warnings

## Priority
Medium - Build warnings should be resolved to maintain code quality and prevent potential issues.

## Labels
- `bug`
- `css`
- `build`
- `tailwind`

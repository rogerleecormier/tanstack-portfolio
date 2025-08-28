# Development Guide

Comprehensive guide for developing and maintaining the TanStack Portfolio site.

## 🚀 Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (or yarn)
- **Git**: For version control
- **Code Editor**: VS Code recommended with TypeScript support

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tanstack-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Development server runs at `http://localhost:5173`
   - Hot reload enabled for all changes

## 🛠️ Development Commands

### Core Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
npm run type-check   # Run TypeScript type checking
```

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Architecture

### File Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix UI)
│   ├── AIPortfolioAssistant.tsx    # AI portfolio guidance
│   ├── ContactAnalysis.tsx         # Contact form AI analysis
│   ├── MarkdownEditor.tsx          # Rich text editor
│   ├── ProtectedRoute.tsx          # Authentication wrapper
│   └── CloudflareStatusChecker.tsx # Cloudflare integration status
├── pages/              # Page components
├── api/                # API services and external integrations
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and helpers
├── content/            # Markdown content files
├── config/             # Configuration files
├── types/              # TypeScript type definitions
├── layout/             # Layout components
└── lib/                # Library configurations
```

### Key Technologies

- **React 19**: Latest React with concurrent features
- **TanStack Router**: Type-safe routing system
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Vite**: Build tool and development server

## 🔧 Development Workflow

### Adding New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Develop feature**
   - Follow TypeScript best practices
   - Use existing component patterns
   - Add proper error handling
   - Include loading states

3. **Test locally**
   ```bash
   npm run dev
   npm run type-check
   npm run lint
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/new-feature-name
   ```

### Code Quality Standards

#### TypeScript
- Use strict type checking
- Avoid `any` types
- Define proper interfaces
- Use type guards where appropriate

#### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines
- Use React.memo for performance optimization

#### Styling
- Use Tailwind CSS utilities
- Follow design system patterns
- Ensure responsive design
- Maintain accessibility standards

## 📝 Content Management

### Adding Portfolio Items

1. **Create markdown file**
   ```bash
   # Create file in src/content/portfolio/
   touch src/content/portfolio/new-item.md
   ```

2. **Add frontmatter**
   ```markdown
   ---
   title: "Item Title"
   description: "Item description"
   category: "category-name"
   tags: ["tag1", "tag2"]
   date: "2024-01-01"
   ---
   
   Content goes here...
   ```

3. **Update router configuration**
   ```typescript
   // In src/router.tsx
   const portfolioPages = [
     // ... existing pages
     'new-item'  // Add new slug
   ]
   ```

### Adding Blog Posts

1. **Create markdown file**
   ```bash
   # Create file in src/content/blog/
   touch src/content/blog/new-post.md
   ```

2. **Add frontmatter**
   ```markdown
   ---
   title: "Blog Post Title"
   description: "Post description"
   author: "Author Name"
   date: "2024-01-01"
   tags: ["tag1", "tag2"]
   ---
   
   Blog content...
   ```

## 🔐 Authentication Development

### Development Mode

- Mock authentication system for local development
- Session timeout after 30 minutes
- Rate limiting on login attempts
- Local storage-based user management

### Testing Authentication

```typescript
// In development, use mock authentication
import { useAuth } from '@/hooks/useAuth'

const { login, logout, isAuthenticated } = useAuth()

// Mock login for testing
login() // Triggers mock authentication
```

## 🧪 Testing

### Manual Testing

1. **Component Testing**
   - Test all interactive elements
   - Verify responsive behavior
   - Check accessibility features
   - Test error states

2. **Integration Testing**
   - Test routing between pages
   - Verify data flow
   - Check API integrations
   - Test authentication flows

3. **Cross-browser Testing**
   - Chrome, Firefox, Safari
   - Mobile browsers
   - Edge compatibility

### Performance Testing

```bash
# Build and analyze bundle
npm run build
npm run preview

# Check bundle size
# Use browser dev tools for performance analysis
```

## 🐛 Debugging

### Development Tools

1. **React DevTools**
   - Component inspection
   - Hook debugging
   - Performance profiling

2. **Browser DevTools**
   - Console logging
   - Network monitoring
   - Performance analysis

3. **TypeScript Errors**
   ```bash
   npm run type-check
   ```

### Common Issues

#### Build Errors
- Check TypeScript types
- Verify import paths
- Check for circular dependencies

#### Runtime Errors
- Check browser console
- Verify API endpoints
- Check authentication state

#### Styling Issues
- Verify Tailwind classes
- Check CSS specificity
- Verify responsive breakpoints

## 📱 Responsive Development

### Breakpoints

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Testing Responsiveness

1. **Browser DevTools**
   - Use device simulation
   - Test different screen sizes
   - Check touch interactions

2. **Real Devices**
   - Test on actual mobile devices
   - Verify touch gestures
   - Check performance

## 🔒 Security Development

### Development Security

- Mock authentication system
- Local development safeguards
- Environment variable protection
- Secure development practices

### Security Testing

1. **Authentication Testing**
   - Test protected routes
   - Verify session management
   - Check rate limiting

2. **Input Validation**
   - Test form submissions
   - Verify sanitization
   - Check XSS prevention

## 📊 Performance Development

### Optimization Techniques

1. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

2. **Bundle Optimization**
   - Tree shaking
   - Dead code elimination
   - Asset optimization

3. **Runtime Optimization**
   - Memoization
   - Debouncing
   - Virtual scrolling

### Performance Monitoring

```typescript
// Use performance API for monitoring
const startTime = performance.now()
// ... operation
const endTime = performance.now()
console.log(`Operation took ${endTime - startTime}ms`)
```

## 🚀 Deployment Preparation

### Pre-deployment Checklist

1. **Code Quality**
   - [ ] All tests pass
   - [ ] Linting passes
   - [ ] Type checking passes
   - [ ] No console errors

2. **Performance**
   - [ ] Bundle size optimized
   - [ ] Images optimized
   - [ ] Lazy loading implemented
   - [ ] Performance metrics acceptable

3. **Security**
   - [ ] Authentication working
   - [ ] Protected routes secure
   - [ ] Environment variables set
   - [ ] Security headers configured

### Build Verification

```bash
# Verify production build
npm run build
npm run preview

# Check build output
ls -la dist/
```

## 🔄 Maintenance

### Regular Tasks

1. **Dependency Updates**
   ```bash
   npm audit
   npm update
   npm outdated
   ```

2. **Code Cleanup**
   - Remove unused imports
   - Clean up console logs
   - Update documentation
   - Optimize bundle

3. **Performance Monitoring**
   - Monitor Core Web Vitals
   - Check bundle size
   - Analyze user metrics
   - Optimize based on data

### Troubleshooting

#### Common Development Issues

1. **Hot Reload Not Working**
   - Check file extensions
   - Verify import statements
   - Restart dev server

2. **TypeScript Errors**
   - Check type definitions
   - Verify import paths
   - Update type declarations

3. **Styling Issues**
   - Check Tailwind configuration
   - Verify CSS imports
   - Check class names

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS Playground](https://play.tailwindcss.com/)
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)

### Best Practices
- [React Best Practices](https://react.dev/learn)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/)

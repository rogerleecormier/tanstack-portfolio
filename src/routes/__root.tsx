import {
  createRootRoute,
  Outlet,
  Link,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { Home, User, FolderOpen, Mail } from 'lucide-react';
import '@/index.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Roger Lee Cormier | Enterprise Technology Strategist' },
      {
        name: 'description',
        content:
          'Portfolio of Roger Lee Cormier, Enterprise Technology Strategist.',
      },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  component: Root,
});

const navLinks = [
  { to: '/' as const, label: 'Journey', icon: Home },
  { to: '/about' as const, label: 'About', icon: User },
  { to: '/projects' as const, label: 'Projects', icon: FolderOpen },
  { to: '/contact' as const, label: 'Contact', icon: Mail },
];

function Root() {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className='flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-indigo-500 selection:text-white'>
          {/* Top header — logo only on mobile, full nav on desktop */}
          <header className='sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur'>
            <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4'>
              <Link
                to='/'
                className='flex items-center gap-3 text-xl font-bold tracking-tight text-white transition-colors hover:text-indigo-400'
              >
                <img
                  src='/favicon.svg'
                  alt='RC'
                  className='h-8 w-8 flex-shrink-0 rounded-md'
                  aria-hidden='true'
                />
                <span className='hidden sm:inline'>
                  Roger Lee Cormier<span className='text-indigo-500'>.</span>
                </span>
                <span className='sm:hidden'>
                  RC<span className='text-indigo-500'>.</span>
                </span>
              </Link>
              {/* Desktop nav */}
              <nav className='hidden md:flex md:space-x-6 md:text-sm md:font-medium'>
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    activeProps={{ className: 'text-indigo-400' }}
                    className='text-slate-300 transition-colors hover:text-indigo-400'
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            {/* Scroll progress indicator */}
            <div className='scroll-progress-bar absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' />
          </header>

          {/* Page content — extra bottom padding on mobile for the tab bar */}
          <main className='flex-grow pb-20 md:pb-0'>
            <Outlet />
          </main>

          <footer className='hidden border-t border-slate-900 bg-slate-950 py-8 md:block'>
            <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row'>
              <p className='text-xs text-slate-500'>
                © {new Date().getFullYear()} Roger Lee Cormier. All rights
                reserved.
              </p>
              <p className='text-xs text-slate-600'>
                Built with TanStack Start & Cloudflare.
              </p>
            </div>
          </footer>

          {/* Mobile bottom tab bar */}
          <nav className='fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-800 bg-slate-950/95 backdrop-blur md:hidden'>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeProps={{ className: 'text-indigo-400' }}
                inactiveProps={{ className: 'text-slate-400' }}
                className='flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors hover:text-indigo-400'
              >
                <Icon size={22} strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

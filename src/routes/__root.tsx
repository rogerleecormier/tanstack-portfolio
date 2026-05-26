import { createRootRoute, Outlet, Link } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <div className='flex min-h-screen flex-col bg-slate-950 text-slate-50 selection:bg-indigo-500 selection:text-white'>
      <header className='sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4'>
          <Link
            to='/'
            className='text-xl font-bold tracking-tight text-white transition-colors hover:text-indigo-400'
          >
            rcormier<span className='text-indigo-500'>.</span>
          </Link>
          <nav className='flex space-x-6 text-sm font-medium'>
            <Link
              to='/'
              activeProps={{ className: 'text-indigo-400' }}
              className='text-slate-300 transition-colors hover:text-indigo-400'
            >
              Journey
            </Link>
            <Link
              to='/about'
              activeProps={{ className: 'text-indigo-400' }}
              className='text-slate-300 transition-colors hover:text-indigo-400'
            >
              About / Resume
            </Link>
            <Link
              to='/projects'
              activeProps={{ className: 'text-indigo-400' }}
              className='text-slate-300 transition-colors hover:text-indigo-400'
            >
              Projects
            </Link>
            <Link
              to='/contact'
              activeProps={{ className: 'text-indigo-400' }}
              className='text-slate-300 transition-colors hover:text-indigo-400'
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className='flex-grow'>
        <Outlet />
      </main>
      <footer className='border-t border-slate-900 bg-slate-950 py-8'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row'>
          <p className='text-xs text-slate-500'>
            © {new Date().getFullYear()} Roger Lee Cormier. All rights reserved.
          </p>
          <p className='text-xs text-slate-600'>
            Built with TanStack Start & Cloudflare.
          </p>
        </div>
      </footer>
    </div>
  );
}

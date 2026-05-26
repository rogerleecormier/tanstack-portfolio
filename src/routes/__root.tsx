import React from 'react';
import { Outlet, Link } from '@tanstack/react-router';

export default function Root() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500 selection:text-white">
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors">
            rcormier<span className="text-indigo-500">.</span>
          </Link>
          <nav className="flex space-x-6 text-sm font-medium">
            <Link to="/" activeProps={{ className: 'text-indigo-400' }} className="hover:text-indigo-400 transition-colors text-slate-300">
              Journey
            </Link>
            <Link to="/about" activeProps={{ className: 'text-indigo-400' }} className="hover:text-indigo-400 transition-colors text-slate-300">
              About / Resume
            </Link>
            <Link to="/projects" activeProps={{ className: 'text-indigo-400' }} className="hover:text-indigo-400 transition-colors text-slate-300">
              Projects
            </Link>
            <Link to="/contact" activeProps={{ className: 'text-indigo-400' }} className="hover:text-indigo-400 transition-colors text-slate-300">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Roger Lee Cormier. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built with TanStack Start & Cloudflare.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import Footer from './Footer';
import Header from './Header';

function PageLoader() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-8 h-8 rounded-full border-2 border-strategy-gold border-t-transparent animate-spin' />
    </div>
  );
}

export default function AppLayout() {
  return (
    <div className='min-h-screen bg-surface-base flex flex-col'>
      <Header />
      <main className='flex-1'>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

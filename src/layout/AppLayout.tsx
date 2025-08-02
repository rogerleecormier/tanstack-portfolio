// src/layout/AppLayout.tsx
import { Outlet } from '@tanstack/react-router'
import Header from './Header'

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">Footer</footer>
    </div>
  )
}
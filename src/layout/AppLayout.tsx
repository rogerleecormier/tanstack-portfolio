// src/layout/AppLayout.tsx
import { Outlet } from '@tanstack/react-router'

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-900 text-white p-4">Header</header>
      <main className="flex-1 p-4">
        <Outlet /> {/* ✅ Required */}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">Footer</footer>
    </div>
  )
}
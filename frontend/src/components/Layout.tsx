import { ReactNode } from 'react'
import AppLogo from '../AppLogo'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="mx-auto w-full max-w-6xl">
          <div className="relative rounded-2xl overflow-hidden">
            {/* Glassmorphic background */}
            <div className="absolute inset-0 bg-white/30 supports-[backdrop-filter]:bg-white/20 backdrop-blur-xl border border-white/40 shadow-lg shadow-black/5" />
            {/* Subtle gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/8 to-transparent" />
            {/* Content */}
            <div className="relative px-6 py-4">
              <div className="flex items-center justify-between">
                <AppLogo />
                <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-700">
                  <a className="hover:text-primary transition-colors" href="/">Auth</a>
                  <a className="hover:text-primary transition-colors" href="/dashboard">Dashboard</a>
                </nav>
                {/* Mobile menu button - simplified for now */}
                <button className="sm:hidden p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Add top padding to account for floating header */}
      <div className="pt-20">
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t mt-8">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-gray-500">
            Built with love for simplicity. Theme: primary #367AFF.
          </div>
        </footer>
      </div>
    </div>
  )
}

import { ReactNode } from 'react'
import AppLogo from '../AppLogo'
import { useAuth } from '../hooks/useAuth'
import LoadingButton from './LoadingButton'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, loggingOut } = useAuth()
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto w-full max-w-6xl">
          <div className="relative">
            {/* Simple background */}
            <div className="absolute inset-0 bg-white border-b border-gray-200" />
            {/* Content */}
            <div className="relative px-6 py-4">
              <div className="flex items-center justify-between">
                <AppLogo />
                
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-sm text-gray-600">
                      Welcome, {user.name}
                    </span>
                    <LoadingButton 
                      onClick={logout}
                      loading={loggingOut}
                      variant="secondary" 
                      size="sm"
                      className="text-xs"
                    >
                      Logout
                    </LoadingButton>
                  </div>
                ) : (
                  <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-700">
                    <a className="hover:text-primary transition-colors" href="/">Login</a>
                  </nav>
                )}
                
                {/* Mobile logout for authenticated users */}
                {user && (
                  <LoadingButton 
                    onClick={logout}
                    loading={loggingOut}
                    variant="secondary" 
                    size="sm"
                    className="sm:hidden text-xs"
                  >
                    Logout
                  </LoadingButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Add top padding to account for floating header */}
      <div className="pt-16">
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t mt-8">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-gray-500">
            Built with love by HD. Simple, elegant, powerful.
          </div>
        </footer>
      </div>
    </div>
  )
}

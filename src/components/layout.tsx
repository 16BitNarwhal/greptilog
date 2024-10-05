// src/components/layout.tsx
"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isCreatePage = pathname === '/create'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isHomePage && (
        <nav className="bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex-shrink-0 flex items-center">
                  <span className="text-2xl font-bold">Greptilog</span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/create"
                    className={
                      isCreatePage
                        ? 'border-primary text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                        : 'border-transparent text-foreground hover:border-foreground hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                    }
                  >
                    Create
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

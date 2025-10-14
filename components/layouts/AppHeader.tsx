'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Scale } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/components/auth/auth-context';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOutUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <div className="container mx-auto flex h-16 max-w-[960px] items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm"
            aria-label="FairForm home"
          >
            <Scale className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-lg">FairForm</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:block" role="navigation" aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  href="/dashboard"
                  className={`inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isActive('/dashboard')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                  aria-current={isActive('/dashboard') ? 'page' : undefined}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <span
                  className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                  aria-disabled="true"
                  title="Coming soon"
                >
                  Settings
                </span>
              </li>
            </ul>
          </nav>
        </div>

        {/* User Menu and Actions */}
        <div className="flex items-center gap-3">
          {/* AI Copilot Shortcut Hint - Hidden on mobile */}
          <div className="hidden lg:block text-xs text-muted-foreground">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
            <span className="ml-2">AI Copilot</span>
          </div>

          {/* User Info - Hidden on mobile */}
          {user && (
            <div className="hidden sm:block text-sm text-muted-foreground">
              {user.displayName || user.email}
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t border-border" role="navigation" aria-label="Mobile navigation">
        <ul className="container mx-auto flex max-w-[960px] items-center gap-1 px-4 py-2">
          <li className="flex-1">
            <Link
              href="/dashboard"
              className={`flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive('/dashboard')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              }`}
              aria-current={isActive('/dashboard') ? 'page' : undefined}
            >
              Dashboard
            </Link>
          </li>
          <li className="flex-1">
            <span
              className="flex h-10 w-full items-center justify-center rounded-md text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
              aria-disabled="true"
              title="Coming soon"
            >
              Settings
            </span>
          </li>
        </ul>
      </nav>
    </header>
  );
}


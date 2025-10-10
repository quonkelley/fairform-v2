'use client';

import Link from 'next/link';

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background" role="contentinfo">
      <div className="container mx-auto max-w-[960px] px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} FairForm. All rights reserved.
          </p>

          {/* Footer Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/fairform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm"
                >
                  GitHub
                </a>
              </li>
              <li>
                <span className="text-sm text-muted-foreground/50">
                  v1.0.0
                </span>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}


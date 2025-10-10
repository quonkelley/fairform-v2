import { AppHeader } from '@/components/layouts/AppHeader';
import { AppFooter } from '@/components/layouts/AppFooter';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}


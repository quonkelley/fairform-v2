'use client';

type DashboardLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardLayout({
  eyebrow = "Dashboard",
  title,
  description,
  actions,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:gap-12 sm:px-8 lg:px-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center justify-start gap-3 sm:justify-end">
            {actions}
          </div>
        ) : null}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

'use client';

    import { ReactNode } from 'react';
    import Link from 'next/link';

    interface AppShellProps {
      children: ReactNode;
    }

    export function AppShell({ children }: AppShellProps) {
      return (
        <div className="max-w-full px-4 py-4 min-h-screen flex flex-col">
          <header className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold">GigFlow</h1>
            <nav>
              <Link href="/" className="mr-4">Marketplace</Link>
              <Link href="/profile" className="mr-4">Profile</Link>
              <Link href="/offerings" className="mr-4">Offerings</Link>
              <Link href="/earnings" className="mr-4">Earnings</Link>
              <Link href="/insights">Insights</Link>
            </nav>
          </header>
          <main className="flex-grow">{children}</main>
        </div>
      );
    }

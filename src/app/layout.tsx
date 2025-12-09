import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Player } from '@/components/Player';
import { SocketProvider } from '@/providers/SocketProvider';
import { cn } from '@/lib/utils';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recho - Music Connected',
  description: 'Social music recommendation platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "h-screen flex flex-col overflow-hidden bg-background text-foreground")}>
        <SessionProvider session={session}>
          <SocketProvider>
            <div className="flex-1 flex overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-8 relative">
                {children}
              </main>
            </div>
            <Player />
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Player } from '@/components/Player';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recho - Music Connected',
  description: 'Social music recommendation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "h-screen flex flex-col overflow-hidden bg-background text-foreground")}>
        <div className="flex-1 flex overflow-hidden">
             <Sidebar />
             <main className="flex-1 overflow-y-auto p-8 relative">
                {children}
             </main>
        </div>
        <Player />
      </body>
    </html>
  );
}

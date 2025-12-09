import Link from 'next/link';
import { Home, Library, Users, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r h-full p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold">R</span>
        </div>
        <h1 className="text-xl font-bold">Recho</h1>
      </div>

      <nav className="space-y-2">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </Link>
        <Link href="/library">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Library className="w-4 h-4" />
            Your Library
          </Button>
        </Link>
        <Link href="/friends">
           <Button variant="ghost" className="w-full justify-start gap-2">
            <Users className="w-4 h-4" />
            Friends
          </Button>
        </Link>
      </nav>

      <div className="mt-6">
        <div className="flex items-center justify-between px-2 mb-2">
             <h2 className="text-sm font-semibold text-muted-foreground">Playlists</h2>
             <Button variant="ghost" size="icon" className="h-6 w-6">
                <PlusCircle className="w-4 h-4" />
             </Button>
        </div>
        <div className="text-sm text-foreground/80 space-y-1 px-2">
            <p className="cursor-pointer hover:underline">My Chill Mix</p>
            <p className="cursor-pointer hover:underline">Top Hits 2025</p>
            <p className="cursor-pointer hover:underline">Coding Focus</p>
        </div>
      </div>
    </div>
  );
}

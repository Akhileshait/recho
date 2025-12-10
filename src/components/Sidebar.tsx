"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Users, Search, PlusCircle, Music2, Heart, Clock, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Your Library', href: '/library', icon: Library },
];

const social = [
  { name: 'Friends', href: '/friends', icon: Users },
  { name: 'Live Radio', href: '/radio', icon: Radio },
];

const library = [
  { name: 'Liked Songs', href: '/liked', icon: Heart, count: 0 },
  { name: 'Recently Played', href: '/history', icon: Clock },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black flex flex-col gap-2 p-2 h-full">
      {/* Logo Section */}
      <div className="bg-card rounded-lg p-6 animate-fade-in">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 smooth-transition">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Recho</h1>
            <p className="text-xs text-muted-foreground">Music Connected</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="bg-card rounded-lg p-4 flex-1 overflow-y-auto animate-fade-in animation-delay-200">
        <div className="space-y-1 mb-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 text-base font-medium smooth-transition",
                    isActive
                      ? "bg-secondary text-foreground hover:bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Social Section */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Social
          </h2>
          <div className="space-y-1">
            {social.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-4 h-11 font-medium smooth-transition",
                      isActive
                        ? "bg-secondary text-foreground hover:bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Library Section */}
        <div className="mb-6">
          <h2 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Music
          </h2>
          <div className="space-y-1">
            {library.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-4 h-11 font-medium smooth-transition group",
                      isActive
                        ? "bg-secondary text-foreground hover:bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded flex items-center justify-center",
                      item.name === 'Liked Songs'
                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                        : "bg-secondary"
                    )}>
                      <item.icon className={cn("w-5 h-5", item.name === 'Liked Songs' ? "text-white" : "")} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.count !== undefined && (
                        <p className="text-xs text-muted-foreground">{item.count} songs</p>
                      )}
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Playlists */}
        <div>
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Playlists
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-secondary smooth-transition"
            >
              <PlusCircle className="w-4 h-4 text-muted-foreground hover:text-foreground smooth-transition" />
            </Button>
          </div>
          <div className="space-y-1">
            {['My Chill Mix', 'Top Hits 2025', 'Coding Focus', 'Workout Beats', 'Late Night Vibes'].map((playlist) => (
              <button
                key={playlist}
                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground smooth-transition rounded hover:bg-secondary/50"
              >
                {playlist}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

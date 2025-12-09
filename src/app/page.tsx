import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  // Mock data for UI development
  const recommendedSongs = [
    { id: 1, title: 'Midnight City', artist: 'M83', cover: 'https://placehold.co/150' },
    { id: 2, title: 'Starboy', artist: 'The Weeknd', cover: 'https://placehold.co/150' },
    { id: 3, title: 'Levitating', artist: 'Dua Lipa', cover: 'https://placehold.co/150' },
    { id: 4, title: 'Heat Waves', artist: 'Glass Animals', cover: 'https://placehold.co/150' },
    { id: 5, title: 'Stay', artist: 'The Kid LAROI', cover: 'https://placehold.co/150' },
  ];

  const recentSongs = [
    { id: 6, title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://placehold.co/150' },
    { id: 7, title: 'Good 4 U', artist: 'Olivia Rodrigo', cover: 'https://placehold.co/150' },
    { id: 8, title: 'Montero', artist: 'Lil Nas X', cover: 'https://placehold.co/150' },
    { id: 9, title: 'Peaches', artist: 'Justin Bieber', cover: 'https://placehold.co/150' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero / Recommended Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
            <Button variant="link" className="text-muted-foreground">See all</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendedSongs.map((song) => (
                <div key={song.id} className="group relative bg-card p-4 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
                        <img 
                            src={song.cover} 
                            alt={song.title} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="icon" className="rounded-full h-12 w-12 bg-primary text-primary-foreground hover:scale-105 transition-transform">
                                <Play className="w-5 h-5 ml-1 fill-current" />
                            </Button>
                        </div>
                    </div>
                    <h3 className="font-semibold truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Recently Played Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Recently Played</h2>
            <Button variant="link" className="text-muted-foreground">See all</Button>
        </div>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recentSongs.map((song) => (
                <div key={song.id} className="group relative bg-card p-4 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
                        <img 
                            src={song.cover} 
                            alt={song.title} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                        />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="icon" className="rounded-full h-12 w-12 bg-primary text-primary-foreground hover:scale-105 transition-transform">
                                <Play className="w-5 h-5 ml-1 fill-current" />
                            </Button>
                        </div>
                    </div>
                    <h3 className="font-semibold truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
}

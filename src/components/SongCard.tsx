"use client";

import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';

export function SongCard({ song }: { song: any }) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  
  const isCurrentSong = currentSong?.id === song.id;

  return (
    <div className="group relative bg-card p-4 rounded-md hover:bg-muted/50 transition-colors">
        <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
            <img 
                src={song.cover_url} 
                alt={song.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
            />
            <div className={`absolute inset-0 bg-black/40 ${isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex items-center justify-center`}>
                <Button 
                    size="icon" 
                    className="rounded-full h-12 w-12 bg-primary text-primary-foreground hover:scale-105 transition-transform"
                    onClick={() => playSong({
                        id: song.id,
                        title: song.title,
                        artist: song.artist,
                        url: song.url,
                        coverUrl: song.cover_url
                    })}
                >
                   {isCurrentSong && isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
                </Button>
            </div>
        </div>
        <h3 className="font-semibold truncate">{song.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
    </div>
  );
}

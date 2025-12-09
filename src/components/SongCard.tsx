"use client";

import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function SongCard({ song }: { song: any }) {
  const { playSong, currentSong, isPlaying, setIsPlaying } = usePlayerStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayPause = () => {
    if (isCurrentSong) {
      setIsPlaying(!isPlaying);
    } else {
      playSong({
        id: song.id,
        title: song.title,
        artist: song.artist,
        url: song.url,
        coverUrl: song.cover_url
      });
    }
  };

  return (
    <div
      className="group relative bg-card p-4 rounded-lg hover:bg-secondary/60 smooth-transition cursor-pointer animate-scale-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Album Art */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-md shadow-lg">
        <img
          src={song.cover_url || 'https://via.placeholder.com/300x300/1e1e1e/666?text=No+Cover'}
          alt={song.title}
          className="object-cover w-full h-full group-hover:scale-110 smooth-transition"
        />

        {/* Gradient Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/60 smooth-transition",
          isHovered || isCurrentSong ? "opacity-100" : "opacity-0"
        )} />

        {/* Play Button */}
        <div className={cn(
          "absolute bottom-2 right-2 smooth-transition",
          isHovered || (isCurrentSong && isPlaying)
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        )}>
          <Button
            size="icon"
            className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-2xl hover:scale-110 smooth-transition hover:bg-accent"
            onClick={handlePlayPause}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            )}
          </Button>
        </div>

        {/* Playing Indicator */}
        {isCurrentSong && isPlaying && (
          <div className="absolute top-2 left-2 flex gap-0.5 items-end">
            <div className="w-1 bg-primary h-3 animate-pulse-subtle" />
            <div className="w-1 bg-primary h-4 animate-pulse-subtle animation-delay-200" />
            <div className="w-1 bg-primary h-2 animate-pulse-subtle animation-delay-400" />
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="space-y-1">
        <h3 className={cn(
          "font-semibold truncate smooth-transition",
          isHovered && "text-primary"
        )}>
          {song.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist}
        </p>
      </div>

      {/* Hover Actions */}
      <div className={cn(
        "absolute top-4 right-4 flex gap-2 smooth-transition",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 smooth-transition"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart
            className={cn(
              "w-4 h-4 smooth-transition",
              isLiked ? "fill-primary text-primary" : "text-white"
            )}
          />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 smooth-transition"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
}

// Loading Skeleton
export function SongCardSkeleton() {
  return (
    <div className="bg-card p-4 rounded-lg animate-pulse">
      <div className="aspect-square mb-4 bg-muted rounded-md skeleton" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded skeleton" />
        <div className="h-3 bg-muted rounded w-2/3 skeleton" />
      </div>
    </div>
  );
}

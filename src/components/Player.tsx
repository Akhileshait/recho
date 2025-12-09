"use client";

import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Slider } from '@/components/ui/slider'; // Need to implement Slider later

export function Player() {
  const { isPlaying, currentSong, setIsPlaying, nextSong } = usePlayerStore();

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t flex items-center justify-between px-4 z-50">
      
      {/* Current Song Values */}
      <div className="flex items-center gap-4 w-1/3">
        {currentSong ? (
           <>
             {currentSong.coverUrl && (
                 <img src={currentSong.coverUrl} alt="Cover" className="w-12 h-12 rounded object-cover" />
             )}
             <div>
                <h4 className="font-semibold text-sm">{currentSong.title}</h4>
                <p className="text-xs text-muted-foreground">{currentSong.artist}</p>
             </div>
           </>
        ) : (
            <div className="text-sm text-muted-foreground">No song playing</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 w-1/3">
        <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <SkipBack className="w-5 h-5" />
             </Button>
             <Button size="icon" className="rounded-full h-10 w-10" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
             </Button>
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={nextSong}>
                <SkipForward className="w-5 h-5" />
             </Button>
        </div>
        {/* Progress bar placeholder */}
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/3"></div>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end gap-2 w-1/3">
         <Volume2 className="w-5 h-5 text-muted-foreground" />
         <div className="w-24 h-1 bg-secondary rounded-full">
            <div className="h-full bg-primary w-2/3"></div>
         </div>
      </div>
    </div>
  );
}

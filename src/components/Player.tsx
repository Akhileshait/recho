"use client";

import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useEffect, useRef, useState } from 'react';

export function Player() {
  const { isPlaying, currentSong, setIsPlaying, nextSong, previousSong, queue } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Play/Pause audio when state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Playback error:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Load new song when currentSong changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    audioRef.current.src = currentSong.url;
    audioRef.current.load();

    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Playback error:', err));
    }
  }, [currentSong]);

  // Update volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current?.play();
    } else {
      nextSong();
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    // TODO: Implement shuffle logic in store
  };

  const toggleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/95 backdrop-blur-xl border-t border-border z-50">
        <div className="h-full flex items-center justify-between px-6 gap-8">

          {/* Current Song Info */}
          <div className="flex items-center gap-4 w-1/4 min-w-[180px]">
            {currentSong.coverUrl && (
              <img
                src={currentSong.coverUrl}
                alt="Cover"
                className="w-14 h-14 rounded shadow-lg"
              />
            )}
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate">{currentSong.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className={`w-8 h-8 ${isShuffled ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground`}
                onClick={toggleShuffle}
              >
                <Shuffle className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                onClick={previousSong}
                disabled={!queue || queue.length === 0}
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                className="rounded-full h-10 w-10 bg-white text-black hover:bg-white/90 hover:scale-105 smooth-transition shadow-lg"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground hover:text-foreground"
                onClick={nextSong}
                disabled={!queue || queue.length === 0}
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`w-8 h-8 ${repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground'} hover:text-foreground relative`}
                onClick={toggleRepeat}
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === 'one' && (
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
                    1
                  </span>
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </>
  );
}

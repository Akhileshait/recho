"use client";

import { useState, useEffect } from 'react';
import { Search, Play, Plus, Heart, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useSession } from 'next-auth/react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string;
  duration: number;
  cover_url: string;
  file_url: string;
  play_count: number;
  is_liked?: boolean;
}

export default function SearchPage() {
  const { data: session } = useSession();
  const { playSong, addToQueue } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const genres = ["all", "pop", "rock", "jazz", "electronic", "hip-hop", "classical", "indie"];
  const moods = ["all", "happy", "sad", "energetic", "calm", "romantic", "melancholic"];

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, searchQuery, selectedGenre, selectedMood]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/songs');
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSongs = () => {
    let filtered = songs;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter(song => song.genre.toLowerCase() === selectedGenre);
    }

    // Mood filter
    if (selectedMood !== "all") {
      filtered = filtered.filter(song => song.mood.toLowerCase() === selectedMood);
    }

    setFilteredSongs(filtered);
  };

  const handlePlay = (song: Song) => {
    playSong({
      id: song.id,
      title: song.title,
      artist: song.artist,
      coverUrl: song.cover_url,
      url: song.file_url,
      duration: song.duration,
    });

    // Track play in database
    fetch('/api/songs/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: song.id }),
    }).catch(err => console.error('Failed to track play:', err));
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue({
      id: song.id,
      title: song.title,
      artist: song.artist,
      coverUrl: song.cover_url,
      url: song.file_url,
      duration: song.duration,
    });
  };

  const handleLike = async (songId: string) => {
    try {
      const response = await fetch('/api/songs/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId }),
      });

      if (response.ok) {
        // Update local state
        setSongs(songs.map(song =>
          song.id === songId ? { ...song, is_liked: !song.is_liked } : song
        ));
      }
    } catch (error) {
      console.error('Failed to like song:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 pb-32 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6">Search Songs</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-6 text-lg bg-card border-2 border-border focus:border-primary rounded-xl"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>

          {(selectedGenre !== "all" || selectedMood !== "all") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedGenre("all");
                setSelectedMood("all");
              }}
              className="text-sm"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-card border border-border rounded-lg space-y-4">
            {/* Genre Filter */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Genre</label>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <Button
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGenre(genre)}
                    className="capitalize"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mood Filter */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Mood</label>
              <div className="flex flex-wrap gap-2">
                {moods.map(mood => (
                  <Button
                    key={mood}
                    variant={selectedMood === mood ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMood(mood)}
                    className="capitalize"
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          {loading ? 'Loading...' : `${filteredSongs.length} song${filteredSongs.length !== 1 ? 's' : ''} found`}
        </p>

        {filteredSongs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No songs found. Try adjusting your search or filters.</p>
          </div>
        )}

        <div className="space-y-2">
          {filteredSongs.map((song, index) => (
            <div
              key={song.id}
              className="group flex items-center gap-4 p-4 rounded-lg hover:bg-card/50 transition-colors"
            >
              {/* Index/Play Button */}
              <div className="w-10 flex items-center justify-center">
                <span className="group-hover:hidden text-muted-foreground text-sm">
                  {index + 1}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hidden group-hover:flex w-8 h-8"
                  onClick={() => handlePlay(song)}
                >
                  <Play className="w-4 h-4 fill-current" />
                </Button>
              </div>

              {/* Cover Image */}
              <div className="relative w-12 h-12 shrink-0">
                <img
                  src={song.cover_url || 'https://placehold.co/300x300/1a1a1a/666666?text=♪'}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/300x300/1a1a1a/666666?text=♪';
                  }}
                />
              </div>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{song.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              </div>

              {/* Album */}
              <div className="hidden md:block w-1/4 min-w-0">
                <p className="text-sm text-muted-foreground truncate">{song.album}</p>
              </div>

              {/* Genre & Mood */}
              <div className="hidden lg:flex gap-2">
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full capitalize">
                  {song.genre}
                </span>
                <span className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full capitalize">
                  {song.mood}
                </span>
              </div>

              {/* Duration */}
              <div className="hidden sm:block w-16 text-right">
                <p className="text-sm text-muted-foreground">{formatDuration(song.duration)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleLike(song.id)}
                  className={`w-8 h-8 ${song.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  <Heart className={`w-4 h-4 ${song.is_liked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleAddToQueue(song)}
                  className="w-8 h-8 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

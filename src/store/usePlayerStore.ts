import { create } from 'zustand';

interface Song {
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
    url: string;
    duration?: number;
}

interface PlayerState {
    isPlaying: boolean;
    currentSong: Song | null;
    volume: number;
    queue: Song[];
    setIsPlaying: (isPlaying: boolean) => void;
    playSong: (song: Song) => void;
    setVolume: (volume: number) => void;
    addToQueue: (song: Song) => void;
    nextSong: () => void;
    prevSong: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    isPlaying: false,
    currentSong: null,
    volume: 1,
    queue: [],
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    playSong: (song) => set({ currentSong: song, isPlaying: true }),
    setVolume: (volume) => set({ volume }),
    addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
    nextSong: () => {
        const { queue, currentSong } = get();
        // Simple queue logic for now
        if (queue.length > 0) {
            const next = queue[0];
            set({ currentSong: next, queue: queue.slice(1) });
        }
    },
    prevSong: () => {
        // Implement previous song logic if history is tracked
    }
}));

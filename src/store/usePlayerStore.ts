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
    history: Song[];
    setIsPlaying: (isPlaying: boolean) => void;
    playSong: (song: Song) => void;
    setVolume: (volume: number) => void;
    addToQueue: (song: Song) => void;
    nextSong: () => void;
    previousSong: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    isPlaying: false,
    currentSong: null,
    volume: 1,
    queue: [],
    history: [],
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    playSong: (song) => {
        const { currentSong, history } = get();
        // Add current song to history before playing new song
        if (currentSong) {
            set({ history: [...history, currentSong] });
        }
        set({ currentSong: song, isPlaying: true });
    },
    setVolume: (volume) => set({ volume }),
    addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
    nextSong: () => {
        const { queue, currentSong, history } = get();
        if (queue.length > 0) {
            const next = queue[0];
            // Add current song to history
            if (currentSong) {
                set({ history: [...history, currentSong] });
            }
            set({ currentSong: next, queue: queue.slice(1) });
        }
    },
    previousSong: () => {
        const { history, currentSong, queue } = get();
        if (history.length > 0) {
            const prev = history[history.length - 1];
            // Add current song to queue
            if (currentSong) {
                set({ queue: [currentSong, ...queue] });
            }
            set({ currentSong: prev, history: history.slice(0, -1) });
        }
    }
}));

import { create } from 'zustand';

export interface Friend {
  id: string;
  email: string;
  name: string;
  image?: string;
  is_online: boolean;
  current_song_id?: string;
  is_playing: boolean;
  last_seen: Date;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_image?: string;
  created_at: Date;
}

interface FriendsState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  onlineFriends: Set<string>;

  setFriends: (friends: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  updateFriendStatus: (friendId: string, isOnline: boolean) => void;
  updateFriendActivity: (friendId: string, activity: { current_song_id?: string; is_playing: boolean }) => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  addFriendRequest: (request: FriendRequest) => void;
  removeFriendRequest: (requestId: string) => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  friends: [],
  friendRequests: [],
  onlineFriends: new Set(),

  setFriends: (friends) => set({
    friends,
    onlineFriends: new Set(friends.filter(f => f.is_online).map(f => f.id))
  }),

  addFriend: (friend) =>
    set((state) => ({
      friends: [...state.friends, friend],
      onlineFriends: friend.is_online
        ? new Set([...state.onlineFriends, friend.id])
        : state.onlineFriends,
    })),

  removeFriend: (friendId) =>
    set((state) => {
      const newOnline = new Set(state.onlineFriends);
      newOnline.delete(friendId);
      return {
        friends: state.friends.filter((f) => f.id !== friendId),
        onlineFriends: newOnline,
      };
    }),

  updateFriendStatus: (friendId, isOnline) =>
    set((state) => {
      const newOnline = new Set(state.onlineFriends);
      if (isOnline) {
        newOnline.add(friendId);
      } else {
        newOnline.delete(friendId);
      }
      return {
        friends: state.friends.map((f) =>
          f.id === friendId ? { ...f, is_online: isOnline, last_seen: new Date() } : f
        ),
        onlineFriends: newOnline,
      };
    }),

  updateFriendActivity: (friendId, activity) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === friendId ? { ...f, ...activity } : f
      ),
    })),

  setFriendRequests: (requests) => set({ friendRequests: requests }),

  addFriendRequest: (request) =>
    set((state) => ({
      friendRequests: [...state.friendRequests, request],
    })),

  removeFriendRequest: (requestId) =>
    set((state) => ({
      friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
    })),
}));

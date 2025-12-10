"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Check, X, Music, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  is_online?: boolean;
  current_song_id?: string;
}

interface Friend extends User {
  status: 'accepted' | 'pending' | 'requested';
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load friends on mount
  useEffect(() => {
    if (session?.user?.email) {
      loadFriends();
    }
  }, [session]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId }),
      });

      if (response.ok) {
        loadFriends();
        setSearchResults([]);
        setSearchQuery("");
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const acceptFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId }),
      });

      if (response.ok) {
        loadFriends();
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const rejectFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId }),
      });

      if (response.ok) {
        loadFriends();
      }
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  const pendingRequests = friends.filter(f => f.status === 'requested');
  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const sentRequests = friends.filter(f => f.status === 'pending');

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please sign in to view friends</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-4xl font-bold mb-2">Friends</h1>
        <p className="text-muted-foreground">
          Connect with friends and share your music taste
        </p>
      </div>

      {/* Search */}
      <div className="animate-fade-in animation-delay-200">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            className="pl-12 h-14 text-lg"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 bg-card rounded-lg border border-border max-w-2xl">
            {searchResults.map((user) => {
              const isFriend = friends.some(f => f.id === user.id);
              const isMe = user.email === session.user?.email;

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-secondary/50 smooth-transition"
                >
                  <img
                    src={user.image || '/default-avatar.png'}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-primary"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  {!isMe && !isFriend && (
                    <Button
                      onClick={() => sendFriendRequest(user.id)}
                      size="sm"
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Friend
                    </Button>
                  )}
                  {isFriend && (
                    <span className="text-sm text-muted-foreground">Already friends</span>
                  )}
                  {isMe && (
                    <span className="text-sm text-muted-foreground">That's you!</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <section className="animate-fade-in animation-delay-400">
          <h2 className="text-2xl font-bold mb-4">Friend Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((friend) => (
              <div key={friend.id} className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={friend.image || '/default-avatar.png'}
                    alt={friend.name}
                    className="w-16 h-16 rounded-full border-2 border-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{friend.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{friend.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => acceptFriendRequest(friend.id)}
                    className="flex-1 gap-2"
                    size="sm"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => rejectFriendRequest(friend.id)}
                    variant="outline"
                    className="flex-1 gap-2"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends List */}
      <section className="animate-fade-in animation-delay-600">
        <h2 className="text-2xl font-bold mb-4">
          My Friends ({acceptedFriends.length})
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading friends...</p>
          </div>
        ) : acceptedFriends.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-dashed">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No friends yet</p>
            <p className="text-sm text-muted-foreground">
              Search for users above to send friend requests
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {acceptedFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-card rounded-lg p-6 border border-border hover:bg-secondary/50 smooth-transition cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={friend.image || '/default-avatar.png'}
                      alt={friend.name}
                      className="w-16 h-16 rounded-full border-2 border-primary"
                    />
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card",
                        friend.is_online ? "bg-green-500" : "bg-gray-500"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{friend.name}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Circle
                        className={cn(
                          "w-2 h-2 fill-current",
                          friend.is_online ? "text-green-500" : "text-gray-500"
                        )}
                      />
                      <span>{friend.is_online ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>

                {friend.current_song_id && friend.is_online && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Listening to music</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <section className="animate-fade-in animation-delay-800">
          <h2 className="text-2xl font-bold mb-4">Sent Requests ({sentRequests.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sentRequests.map((friend) => (
              <div
                key={friend.id}
                className="bg-card rounded-lg p-6 border border-border opacity-60"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={friend.image || '/default-avatar.png'}
                    alt={friend.name}
                    className="w-12 h-12 rounded-full border-2 border-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{friend.name}</p>
                    <p className="text-sm text-muted-foreground">Pending...</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

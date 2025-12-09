import { Graph } from './graph';
import { query } from './db';

export class RecommendationEngine {
  constructor() {
    this.graph = new Graph();
  }

  /**
   * Builds the graph from the database
   * Nodes: Users, Songs, Genres, Artists
   * Edges: User->Song (History), Song->Genre, Song->Artist, User->User (Friend)
   */
  async buildGraph() {
    // 1. Fetch all necessary data (In a real app, we might limit this scope)
    const songsResult = await query('SELECT * FROM songs');
    const historyResult = await query('SELECT * FROM history');
    const friendsResult = await query('SELECT * FROM friendships WHERE status = $1', ['accepted']);

    const songs = songsResult.rows;
    const history = historyResult.rows;
    const friendships = friendsResult.rows;

    // 2. Add Songs, Genres, Artists to Graph
    songs.forEach(song => {
      const songNode = `song:${song.id}`;
      const genreNode = `genre:${song.genre}`;
      const artistNode = `artist:${song.artist}`;

      this.graph.addVertex(songNode);
      this.graph.addVertex(genreNode);
      this.graph.addVertex(artistNode);

      // Bidirectional edges for traversal
      this.graph.addEdge(songNode, genreNode, 1, 'has_genre');
      this.graph.addEdge(genreNode, songNode, 1, 'is_genre_of');
      
      this.graph.addEdge(songNode, artistNode, 1, 'by_artist');
      this.graph.addEdge(artistNode, songNode, 1, 'wrote_song');
    });

    // 3. Add User History
    history.forEach(entry => {
      const userNode = `user:${entry.user_id}`;
      const songNode = `song:${entry.song_id}`;

      this.graph.addEdge(userNode, songNode, 2, 'listened_to'); // Higher weight for direct listens
      // We don't necessarily need song->user for recommendations unless we do "users who listened to this also..."
      this.graph.addEdge(songNode, userNode, 1, 'listened_by');
    });

    // 4. Add Friendships
    friendships.forEach(friendship => {
      const u1 = `user:${friendship.user_id}`;
      const u2 = `user:${friendship.friend_id}`;
      
      this.graph.addEdge(u1, u2, 1.5, 'is_friend');
      this.graph.addEdge(u2, u1, 1.5, 'is_friend');
    });
  }

  /**
   * Generates recommendations for a user
   * @param {string} userId 
   * @returns {Array} List of recommended song IDs
   */
  async recommend(userId) {
    await this.buildGraph(); // Refresh graph data
    
    const userNode = `user:${userId}`;
    
    // Run BFS/Random Walk from user node
    // Depth 3: User -> Song -> Genre/Artist -> Other Song
    //          User -> Friend -> Song -> ...
    const scores = this.graph.bfs(userNode, 3);
    
    const recommendations = [];
    
    for (const [node, score] of scores.entries()) {
      if (node.startsWith('song:')) {
        // Don't recommend songs the user has already listened to (direct neighbors)
        // Check if direct edge exists in graph or filter from history
        const isDirectlyConnected = this.graph.getNeighbors(userNode).some(n => n.node === node);
        
        if (!isDirectlyConnected) {
           recommendations.push({ songId: node.split(':')[1], score });
        }
      }
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, 20); // Top 20
  }
}

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
   * Enhanced algorithm considering:
   * - Play time (duration listened)
   * - Genre preferences
   * - Artist preferences
   * - Likes
   * - Friend listening habits
   * - Recency of listens
   * @param {string} userId
   * @returns {Array} List of recommended song IDs with scores
   */
  async recommend(userId) {
    await this.buildGraph(); // Refresh graph data

    // Get user's listening statistics
    const userStats = await this.getUserStats(userId);

    const userNode = `user:${userId}`;

    // Run BFS from user node with multiple depths for different signals
    const graphScores = this.graph.bfs(userNode, 4);

    const recommendations = new Map();

    for (const [node, baseScore] of graphScores.entries()) {
      if (node.startsWith('song:')) {
        const songId = node.split(':')[1];

        // Don't recommend songs the user has already listened to
        const isDirectlyConnected = this.graph.getNeighbors(userNode).some(n => n.node === node);
        if (isDirectlyConnected) continue;

        // Calculate enhanced score
        const enhancedScore = await this.calculateEnhancedScore(
          songId,
          baseScore,
          userStats
        );

        recommendations.set(songId, enhancedScore);
      }
    }

    // Get friend-based recommendations
    const friendRecs = await this.getFriendRecommendations(userId);
    friendRecs.forEach(({ songId, score }) => {
      const currentScore = recommendations.get(songId) || 0;
      recommendations.set(songId, currentScore + score * 0.7); // Friend influence weight
    });

    // Convert to array and sort
    const sortedRecs = Array.from(recommendations.entries())
      .map(([songId, score]) => ({ songId, score }))
      .sort((a, b) => b.score - a.score);

    return sortedRecs.slice(0, 20);
  }

  /**
   * Get user's listening statistics
   */
  async getUserStats(userId) {
    // Get top genres
    const genreStats = await query(`
      SELECT s.genre, COUNT(*) as count, SUM(h.play_duration) as total_duration
      FROM history h
      JOIN songs s ON h.song_id = s.id
      WHERE h.user_id = $1 AND s.genre IS NOT NULL
      GROUP BY s.genre
      ORDER BY total_duration DESC
      LIMIT 10
    `, [userId]);

    // Get top artists
    const artistStats = await query(`
      SELECT s.artist, COUNT(*) as count, SUM(h.play_duration) as total_duration
      FROM history h
      JOIN songs s ON h.song_id = s.id
      WHERE h.user_id = $1
      GROUP BY s.artist
      ORDER BY total_duration DESC
      LIMIT 10
    `, [userId]);

    // Get liked songs
    const likedSongs = await query(`
      SELECT song_id FROM song_likes WHERE user_id = $1
    `, [userId]);

    return {
      topGenres: new Map(genreStats.rows.map(r => [r.genre, r.total_duration])),
      topArtists: new Map(artistStats.rows.map(r => [r.artist, r.total_duration])),
      likedSongIds: new Set(likedSongs.rows.map(r => r.song_id)),
    };
  }

  /**
   * Calculate enhanced score for a song based on user preferences
   */
  async calculateEnhancedScore(songId, baseScore, userStats) {
    const songData = await query('SELECT * FROM songs WHERE id = $1', [songId]);
    if (songData.rows.length === 0) return baseScore;

    const song = songData.rows[0];
    let score = baseScore;

    // Genre match bonus (0.5x - 2x multiplier)
    if (song.genre && userStats.topGenres.has(song.genre)) {
      const genreDuration = userStats.topGenres.get(song.genre);
      const maxDuration = Math.max(...userStats.topGenres.values());
      const genreWeight = 1 + (genreDuration / maxDuration);
      score *= genreWeight;
    }

    // Artist match bonus (0.3x - 1.5x multiplier)
    if (userStats.topArtists.has(song.artist)) {
      const artistDuration = userStats.topArtists.get(song.artist);
      const maxDuration = Math.max(...userStats.topArtists.values());
      const artistWeight = 1 + (0.5 * artistDuration / maxDuration);
      score *= artistWeight;
    }

    // Popularity bonus (logarithmic scale)
    if (song.play_count > 0) {
      score *= (1 + Math.log10(song.play_count + 1) * 0.1);
    }

    // Like count bonus
    if (song.like_count > 0) {
      score *= (1 + Math.log10(song.like_count + 1) * 0.15);
    }

    return score;
  }

  /**
   * Get recommendations based on what friends are listening to
   */
  async getFriendRecommendations(userId) {
    const friendListens = await query(`
      SELECT h.song_id, COUNT(*) as listen_count, MAX(h.played_at) as last_played
      FROM friendships f
      JOIN history h ON f.friend_id = h.user_id
      WHERE f.user_id = $1 AND f.status = 'accepted'
        AND h.played_at > NOW() - INTERVAL '30 days'
        AND h.song_id NOT IN (
          SELECT song_id FROM history WHERE user_id = $1
        )
      GROUP BY h.song_id
      ORDER BY listen_count DESC, last_played DESC
      LIMIT 20
    `, [userId]);

    return friendListens.rows.map(row => ({
      songId: row.song_id,
      score: row.listen_count * 2, // Friends' listens are valuable
    }));
  }
}

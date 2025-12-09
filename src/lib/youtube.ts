import axios from 'axios';
import { query } from './db';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export async function importYoutubePlaylists(userId: string, accessToken: string) {
  try {
    // Get user's playlists
    const playlistsResponse = await axios.get(`${YOUTUBE_API_URL}/playlists`, {
      params: {
        part: 'snippet,contentDetails',
        mine: true,
        maxResults: 50,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const playlists = playlistsResponse.data.items;

    for (const playlist of playlists) {
      // Create playlist in database
      const playlistResult = await query(
        `INSERT INTO playlists (user_id, name, description, cover_url, source, external_id)
         VALUES ($1, $2, $3, $4, 'youtube', $5)
         RETURNING id`,
        [
          userId,
          playlist.snippet.title,
          playlist.snippet.description,
          playlist.snippet.thumbnails.high?.url,
          playlist.id,
        ]
      );

      const playlistId = playlistResult.rows[0].id;

      // Get playlist items
      const itemsResponse = await axios.get(`${YOUTUBE_API_URL}/playlistItems`, {
        params: {
          part: 'snippet,contentDetails',
          playlistId: playlist.id,
          maxResults: 50,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const items = itemsResponse.data.items;

      for (const item of items) {
        const videoId = item.contentDetails.videoId;

        // Get video details
        const videoResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
          params: {
            part: 'snippet,contentDetails',
            id: videoId,
          },
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const video = videoResponse.data.items[0];
        if (!video) continue;

        // Parse duration (PT1M30S format)
        const duration = parseDuration(video.contentDetails.duration);

        // Check if song exists
        let songResult = await query(
          'SELECT id FROM songs WHERE youtube_id = $1',
          [videoId]
        );

        let songId;
        if (songResult.rows.length === 0) {
          // Create song
          const newSongResult = await query(
            `INSERT INTO songs (title, artist, duration, url, cover_url, youtube_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [
              video.snippet.title,
              video.snippet.channelTitle,
              duration,
              `https://www.youtube.com/watch?v=${videoId}`,
              video.snippet.thumbnails.high?.url,
              videoId,
            ]
          );
          songId = newSongResult.rows[0].id;
        } else {
          songId = songResult.rows[0].id;
        }

        // Add to playlist
        await query(
          `INSERT INTO playlist_songs (playlist_id, song_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [playlistId, songId]
        );
      }
    }

    return { success: true, count: playlists.length };
  } catch (error: any) {
    console.error('Error importing YouTube playlists:', error.response?.data || error);
    return { success: false, error: 'Failed to import playlists' };
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

export async function searchYoutube(query: string, accessToken?: string) {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: 20,
        key: process.env.YOUTUBE_API_KEY,
      },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    return response.data.items;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

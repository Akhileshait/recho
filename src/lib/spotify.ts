import axios from 'axios';
import { query } from './db';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export async function refreshSpotifyToken(refreshToken: string) {
  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    }
  );

  return response.data.access_token;
}

export async function connectSpotify(userId: string, code: string) {
  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Save tokens to database
    await query(
      `UPDATE users
       SET spotify_connected = TRUE,
           spotify_access_token = $1,
           spotify_refresh_token = $2
       WHERE id = $3`,
      [access_token, refresh_token, userId]
    );

    return { success: true, accessToken: access_token };
  } catch (error) {
    console.error('Error connecting Spotify:', error);
    return { success: false, error: 'Failed to connect Spotify' };
  }
}

export async function importSpotifyPlaylists(userId: string, accessToken: string) {
  try {
    // Get user's playlists
    const playlistsResponse = await axios.get(`${SPOTIFY_API_URL}/me/playlists`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const playlists = playlistsResponse.data.items;

    for (const playlist of playlists) {
      // Create playlist in database
      const playlistResult = await query(
        `INSERT INTO playlists (user_id, name, description, cover_url, source, external_id)
         VALUES ($1, $2, $3, $4, 'spotify', $5)
         RETURNING id`,
        [
          userId,
          playlist.name,
          playlist.description,
          playlist.images[0]?.url,
          playlist.id,
        ]
      );

      const playlistId = playlistResult.rows[0].id;

      // Get playlist tracks
      const tracksResponse = await axios.get(
        `${SPOTIFY_API_URL}/playlists/${playlist.id}/tracks`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const tracks = tracksResponse.data.items;

      for (const item of tracks) {
        const track = item.track;
        if (!track) continue;

        // Check if song exists
        let songResult = await query(
          'SELECT id FROM songs WHERE spotify_id = $1',
          [track.id]
        );

        let songId;
        if (songResult.rows.length === 0) {
          // Create song
          const newSongResult = await query(
            `INSERT INTO songs (title, artist, album, genre, duration, url, cover_url, spotify_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
              track.name,
              track.artists.map((a: any) => a.name).join(', '),
              track.album.name,
              track.album.genres?.[0] || 'Unknown',
              Math.floor(track.duration_ms / 1000),
              track.preview_url || track.external_urls.spotify,
              track.album.images[0]?.url,
              track.id,
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
    console.error('Error importing Spotify playlists:', error.response?.data || error);

    // If token expired, try to refresh
    if (error.response?.status === 401) {
      return { success: false, error: 'Token expired', shouldRefresh: true };
    }

    return { success: false, error: 'Failed to import playlists' };
  }
}

export async function searchSpotify(query: string, accessToken: string) {
  try {
    const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
      params: {
        q: query,
        type: 'track',
        limit: 20,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.tracks.items;
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return [];
  }
}

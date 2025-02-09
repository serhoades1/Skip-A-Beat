// Spotify configuration
export const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
export const REDIRECT_URI = window.location.origin;
export const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
  'app-remote-control',
  'playlist-read-private',
  'playlist-read-collaborative'
].join(' ');

if (!SPOTIFY_CLIENT_ID) {
  throw new Error('Missing VITE_SPOTIFY_CLIENT_ID environment variable. Please check your .env file.');
}
export const SPOTIFY_CLIENT_ID = 'b8e7060c1f7845aeb5f3cdd0a1846550';
export const REDIRECT_URI = window.location.origin;
export const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state'
].join(' ');
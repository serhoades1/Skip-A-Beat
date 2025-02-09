export interface AudioFeatures {
  tempo: number;
  energy: number;
  danceability: number;
  valence: number;
}

export interface SavedPlaylist {
  name: string;
  songs: SpotifyTrack[];
  timestamp: number;
}

export interface SpotifyTrack {
  'Track URI': string;
  'Track Name': string;
  'Artist Name(s)': string;
  'Album Name': string;
  'Album Image URL': string;
  'Track Duration (ms)': number;
}

export interface PlayerState {
  isPlaying: boolean;
  track: Spotify.WebPlaybackTrack | null;
}
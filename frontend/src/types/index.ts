export interface Song {
  id: string;
  name: string;
  artist: string;
  bpm: number;
  energy: number;
  valence: number;
  danceability: number;
  loudness: number;
  genre?: string;
  previewUrl?: string;
  spotifyUrl?: string;
}

export interface PlaylistData {
  id: string;
  name: string;
  songs: Song[];
  uploadedAt: number;
  selected?: boolean;
}

export interface HeartRateData {
  heartRate: number;
  timestamp: number;
}

export interface SpotifyAuth {
  accessToken: string;
  expiresIn: number;
}

export interface HeartRateZone {
  min: number;
  max: number;
  name: string;
  description: string;
  musicPreferences: {
    minBPM: number;
    maxBPM: number;
    minEnergy: number;
    minValence: number;
    minDanceability: number;
  };
}
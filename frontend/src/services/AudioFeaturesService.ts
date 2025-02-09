import { AudioFeatures } from '../types';
import SpotifyAuthService from './SpotifyAuthService';

class AudioFeaturesService {
  async fetchFeatures(trackIds: string[]): Promise<Map<string, AudioFeatures>> {
    if (trackIds.length === 0) return new Map();
    
    const token = SpotifyAuthService.getToken();
    if (!token) {
      throw new Error('No Spotify token found');
    }

    const validTrackIds = trackIds.filter(id => id && id.length > 0);
    const chunks = this.chunkArray(validTrackIds, 100);
    const metadata = new Map<string, AudioFeatures>();

    for (const chunk of chunks) {
      const response = await fetch(
        `https://api.spotify.com/v1/audio-features?ids=${chunk.join(',')}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          SpotifyAuthService.clearAuth();
          throw new Error('Spotify token expired. Please log in again.');
        }
        throw new Error(`Failed to fetch audio features: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.audio_features) {
        throw new Error('Invalid response format from Spotify API');
      }

      data.audio_features.forEach((features: any, index: number) => {
        if (features && features.id === chunk[index]) {
          metadata.set(chunk[index], {
            tempo: features.tempo,
            energy: features.energy,
            danceability: features.danceability,
            valence: features.valence
          });
        }
      });
    }

    return metadata;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

export default new AudioFeaturesService();
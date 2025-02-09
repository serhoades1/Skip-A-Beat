import { Song } from '../types';

class SpotifyService {
  private accessToken: string | null = null;

  async setAccessToken(token: string): Promise<void> {
    this.accessToken = token;
  }

  async initialize(clientId: string): Promise<void> {
    // No initialization needed for embed player
    return Promise.resolve();
  }

  async importPlaylist(file: File): Promise<Song[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').slice(1); // Skip header row
          
          const songs: Song[] = [];
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            const [id, name, artist, bpmStr, energyStr, valenceStr, danceabilityStr] = line.split(',').map(s => s.trim());
            
            if (id && name && artist) {
              songs.push({
                id,
                name,
                artist,
                bpm: parseInt(bpmStr, 10) || 120,
                energy: parseFloat(energyStr) || 0.5,
                valence: parseFloat(valenceStr) || 0.5,
                danceability: parseFloat(danceabilityStr) || 0.5,
                loudness: -10,
                spotifyUrl: `https://open.spotify.com/track/${id}`,
              });
            }
          }
          
          resolve(songs);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
}

export default new SpotifyService();
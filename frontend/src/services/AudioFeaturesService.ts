import { AudioFeatures } from '../types';
import Papa from 'papaparse';

class AudioFeaturesService {
  private spotifyData: Map<string, AudioFeatures> = new Map();

  async fetchFeatures(trackIds: string[]): Promise<Map<string, AudioFeatures>> {
    const metadata = new Map<string, AudioFeatures>();
    
    try {
      const response = await fetch('/spotify_data.csv');
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Process each row in the CSV
            results.data.forEach((row: any) => {
              const trackId = row.id || row['Track URI']?.split(':')[2];
              if (trackId && trackIds.includes(trackId)) {
                metadata.set(trackId, {
                  tempo: parseFloat(row.tempo || row.bpm || '120'),
                  energy: parseFloat(row.energy || '0.5'),
                  danceability: parseFloat(row.danceability || '0.5'),
                  valence: parseFloat(row.valence || '0.5')
                });
              }
            });

            // For any tracks not found in the CSV, use default values
            trackIds.forEach(id => {
              if (!metadata.has(id)) {
                metadata.set(id, {
                  tempo: 120,
                  energy: 0.5,
                  danceability: 0.5,
                  valence: 0.5
                });
              }
            });

            console.log(`Loaded features for ${metadata.size} tracks`);
            resolve(metadata);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error loading CSV:', error);
      // Fallback: return default values for all tracks
      trackIds.forEach(id => {
        metadata.set(id, {
          tempo: 120,
          energy: 0.5,
          danceability: 0.5,
          valence: 0.5
        });
      });
      return metadata;
    }
  }
}

export default new AudioFeaturesService();
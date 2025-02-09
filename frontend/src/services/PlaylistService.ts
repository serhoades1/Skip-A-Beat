import { SavedPlaylist, SpotifyTrack } from '../types';
import Papa from 'papaparse';

class PlaylistService {
  private readonly STORAGE_KEY = 'savedPlaylists';
  private readonly MAX_PLAYLISTS = 5;
  private readonly REQUIRED_COLUMNS = [
    'Track URI',
    'Track Name',
    'Artist Name(s)',
    'Album Name',
    'Album Image URL',
    'Track Duration (ms)'
  ];

  loadSavedPlaylists(): SavedPlaylist[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved playlists:', error);
      return [];
    }
  }

  async parsePlaylistFile(file: File): Promise<SpotifyTrack[]> {
    return new Promise((resolve, reject) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        reject(new Error('Please upload a CSV file exported from Spotify'));
        return;
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            // Check for parsing errors
            if (results.errors.length > 0) {
              throw new Error(`CSV parsing error: ${results.errors[0].message}`);
            }

            // Validate data structure
            if (!results.data || !Array.isArray(results.data) || results.data.length === 0) {
              throw new Error('The CSV file appears to be empty or invalid');
            }

            // Validate headers
            const headers = results.meta.fields || [];
            const missingColumns = this.REQUIRED_COLUMNS.filter(col => !headers.includes(col));
            
            if (missingColumns.length > 0) {
              throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
            }

            // Process and validate each row
            const validSongs = results.data
              .map((row: any) => this.validateAndTransformRow(row))
              .filter((song): song is SpotifyTrack => song !== null);

            if (validSongs.length === 0) {
              throw new Error('No valid songs found in the playlist');
            }

            console.log(`Successfully parsed ${validSongs.length} tracks from playlist`);
            resolve(validSongs);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  }

  private validateAndTransformRow(row: any): SpotifyTrack | null {
    try {
      // Validate Track URI
      if (!row['Track URI']?.startsWith('spotify:track:')) {
        return null;
      }

      // Validate required text fields
      const requiredFields = ['Track Name', 'Artist Name(s)', 'Album Name'];
      for (const field of requiredFields) {
        if (!row[field] || typeof row[field] !== 'string' || !row[field].trim()) {
          return null;
        }
      }

      // Validate Album Image URL
      if (!row['Album Image URL']?.startsWith('https://')) {
        return null;
      }

      // Validate and parse duration
      const duration = parseInt(row['Track Duration (ms)']);
      if (isNaN(duration) || duration <= 0) {
        return null;
      }

      // Return validated and transformed track
      return {
        'Track URI': row['Track URI'].trim(),
        'Track Name': row['Track Name'].trim(),
        'Artist Name(s)': row['Artist Name(s)'].trim(),
        'Album Name': row['Album Name'].trim(),
        'Album Image URL': row['Album Image URL'].trim(),
        'Track Duration (ms)': duration
      };
    } catch (error) {
      console.warn('Error processing row:', error);
      return null;
    }
  }

  savePlaylist(name: string, songs: SpotifyTrack[]): void {
    try {
      if (!name || !songs.length) {
        throw new Error('Invalid playlist data');
      }

      const newPlaylist: SavedPlaylist = {
        name: name.replace(/\.csv$/i, ''),
        songs,
        timestamp: Date.now()
      };

      const currentPlaylists = this.loadSavedPlaylists();
      const updatedPlaylists = [newPlaylist, ...currentPlaylists]
        .slice(0, this.MAX_PLAYLISTS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Error saving playlist:', error);
      throw error;
    }
  }
}

export default new PlaylistService();
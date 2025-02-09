import { SavedPlaylist, SpotifyTrack } from '../types';
import Papa from 'papaparse';

class PlaylistService {
  private readonly STORAGE_KEY = 'savedPlaylists';
  private readonly MAX_PLAYLISTS = 5;

  loadSavedPlaylists(): SavedPlaylist[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  async parsePlaylistFile(file: File): Promise<SpotifyTrack[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          resolve(results.data as SpotifyTrack[]);
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error}`));
        }
      });
    });
  }

  savePlaylist(name: string, songs: SpotifyTrack[]): void {
    const newPlaylist: SavedPlaylist = {
      name,
      songs,
      timestamp: Date.now()
    };

    const currentPlaylists = this.loadSavedPlaylists();
    const updatedPlaylists = [newPlaylist, ...currentPlaylists].slice(0, this.MAX_PLAYLISTS);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPlaylists));
  }
}

export default new PlaylistService();
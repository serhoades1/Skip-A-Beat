import { Song } from '../types';

class SpotifyService {
  private accessToken: string | null = null;
  private player: Spotify.Player | null = null;
  private deviceId: string | null = null;
  private isReady = false;
  private playerCallbacks: Set<(isPlaying: boolean) => void> = new Set();

  async setAccessToken(token: string): Promise<void> {
    this.accessToken = token;
  }

  async initialize(clientId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Access token not set');
    }

    return new Promise((resolve, reject) => {
      if (document.getElementById('spotify-player-script')) {
        this.initializePlayer(resolve, reject);
        return;
      }

      const script = document.createElement('script');
      script.id = 'spotify-player-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      script.onload = () => this.initializePlayer(resolve, reject);
      script.onerror = () => reject(new Error('Failed to load Spotify Web Playback SDK'));

      document.body.appendChild(script);
    });
  }

  private initializePlayer(resolve: (value: void) => void, reject: (reason: any) => void): void {
    if (!window.Spotify) {
      reject(new Error('Spotify Web Playback SDK not loaded'));
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Heart Rate Music Player',
        getOAuthToken: cb => cb(this.accessToken!),
        volume: 0.5
      });

      this.setupPlayerListeners(reject);
      this.player.connect()
        .then(success => {
          if (!success) {
            reject(new Error('Failed to connect to Spotify player'));
          }
        })
        .catch(reject);
    };
  }

  private setupPlayerListeners(reject: (reason: any) => void): void {
    if (!this.player) return;

    this.player.addListener('initialization_error', ({ message }) => {
      reject(new Error(`Initialization error: ${message}`));
    });

    this.player.addListener('authentication_error', ({ message }) => {
      reject(new Error(`Authentication error: ${message}`));
    });

    this.player.addListener('account_error', ({ message }) => {
      reject(new Error(`Account error: ${message}`));
    });

    this.player.addListener('playback_error', ({ message }) => {
      console.error('Playback error:', message);
    });

    this.player.addListener('player_state_changed', state => {
      const isPlaying = !state?.paused;
      this.playerCallbacks.forEach(callback => callback(isPlaying));
    });

    this.player.addListener('ready', ({ device_id }) => {
      this.deviceId = device_id;
      this.isReady = true;
      this.setActiveDevice(device_id);
    });

    this.player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID is not ready for playback', device_id);
      this.isReady = false;
    });
  }

  private async setActiveDevice(deviceId: string): Promise<void> {
    if (!this.accessToken) return;

    const response = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to set active device');
    }
  }

  async playSong(songId: string): Promise<void> {
    if (!this.accessToken || !this.deviceId || !this.isReady) {
      throw new Error('Spotify player is not ready');
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [`spotify:track:${songId}`],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to play song');
    }
  }

  async togglePlayback(): Promise<void> {
    if (!this.player) throw new Error('Player not initialized');
    await this.player.togglePlay();
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.player) throw new Error('Player not initialized');
    await this.player.seek(positionMs);
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.player) throw new Error('Player not initialized');
    await this.player.setVolume(volume);
  }

  async importPlaylist(file: File): Promise<Song[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').slice(1);
          
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

export const spotifyService = new SpotifyService();
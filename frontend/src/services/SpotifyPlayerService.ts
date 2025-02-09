class SpotifyPlayerService {
  private player: Spotify.Player | null = null;
  private deviceId: string = '';

  async initialize(
    token: string,
    onStateChange: (state: { isPlaying: boolean }) => void,
    onDeviceReady: (deviceId: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const player = new window.Spotify.Player({
        name: 'Heart Rate Music Player',
        getOAuthToken: cb => { cb(token) }
      });

      player.addListener('initialization_error', ({ message }) => {
        onError(`Failed to initialize: ${message}`);
      });

      player.addListener('authentication_error', ({ message }) => {
        onError(`Failed to authenticate: ${message}`);
      });

      player.addListener('account_error', ({ message }) => {
        onError(`Failed to validate Spotify account: ${message}`);
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback:', message);
      });

      player.addListener('player_state_changed', state => {
        if (state) {
          onStateChange({ isPlaying: !state.paused });
        }
      });

      player.addListener('ready', ({ device_id }) => {
        this.deviceId = device_id;
        onDeviceReady(device_id);
        this.setActiveDevice(token, device_id);
        resolve();
      });

      player.connect().then(success => {
        if (success) {
          this.player = player;
        }
      });
    });
  }

  private async setActiveDevice(token: string, deviceId: string): Promise<void> {
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      })
    });
  }

  async playTrack(token: string, trackUri: string): Promise<void> {
    if (!this.deviceId) throw new Error('No active device ID found');

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri]
      })
    });
  }

  async togglePlayback(token: string, isPlaying: boolean): Promise<void> {
    if (!this.deviceId) throw new Error('No active device ID found');

    const endpoint = isPlaying ? 'pause' : 'play';
    await fetch(`https://api.spotify.com/v1/me/player/${endpoint}?device_id=${this.deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
  }

  cleanup(): void {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
  }
}

export default new SpotifyPlayerService();
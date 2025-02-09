import { io, Socket } from 'socket.io-client';
import { SpotifyTrack, AudioFeatures } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private onRecommendationsCallback: ((recommendations: any) => void) | null = null;
  private connectionAttempts = 0;
  private readonly MAX_RETRIES = 3;

  connect(url: string = 'http://localhost:5173'): void {
    if (this.socket?.connected || this.connectionAttempts >= this.MAX_RETRIES) return;

    try {
      this.socket = io(url, {
        reconnectionAttempts: this.MAX_RETRIES,
        timeout: 5000,
        autoConnect: false
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.connectionAttempts = 0;
      });

      this.socket.on('connect_error', () => {
        this.connectionAttempts++;
        if (this.connectionAttempts >= this.MAX_RETRIES) {
          console.log('WebSocket server unavailable, falling back to local matching');
        }
      });

      this.socket.on('response', (data) => {
        if (this.onRecommendationsCallback) {
          this.onRecommendationsCallback(data);
        }
      });

      this.socket.connect();
    } catch (error) {
      console.log('WebSocket initialization error, falling back to local matching');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionAttempts = 0;
  }

  requestRecommendations(heartRate: number, songs: SpotifyTrack[], metadata: Map<string, AudioFeatures>): void {
    if (!this.socket?.connected) {
      // Silently fail if not connected - the app will use local matching instead
      return;
    }

    const minBPM = Math.max(40, heartRate * 0.9);
    const maxBPM = Math.min(200, heartRate * 1.1);

    const songData = songs.map(song => {
      const trackId = song['Track URI'].split(':')[2];
      const features = metadata.get(trackId);
      return {
        track_id: trackId,
        track_name: song['Track Name'],
        artist_name: song['Artist Name(s)'],
        tempo: features?.tempo || 0,
        energy: features?.energy || 0,
        valence: features?.valence || 0,
        danceability: features?.danceability || 0
      };
    });

    this.socket.emit('get_bpm_recommendations', {
      bpm_range: [minBPM, maxBPM],
      songs: songData,
      current_heart_rate: heartRate
    });
  }

  onRecommendations(callback: (recommendations: any) => void): void {
    this.onRecommendationsCallback = callback;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService();
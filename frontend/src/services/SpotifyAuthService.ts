import { SPOTIFY_CLIENT_ID, REDIRECT_URI, SCOPES } from '../config/spotify';

class SpotifyAuthService {
  private readonly TOKEN_KEY = 'spotify_token';
  private readonly TOKEN_TIMESTAMP_KEY = 'spotify_token_timestamp';
  private readonly TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

  checkAuth(): boolean {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const timestamp = localStorage.getItem(this.TOKEN_TIMESTAMP_KEY);
      
      if (!token || !timestamp) {
        return false;
      }

      const now = Date.now();
      const tokenAge = now - parseInt(timestamp);
      
      if (tokenAge >= this.TOKEN_EXPIRY) {
        this.clearAuth();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  }

  handleCallback(hash: string): boolean {
    try {
      if (!hash) return false;

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const error = params.get('error');
      
      if (error) {
        console.error('Spotify auth error:', error);
        return false;
      }
      
      if (!accessToken) {
        return false;
      }

      this.setAuth(accessToken);
      return true;
    } catch (error) {
      console.error('Error handling callback:', error);
      return false;
    }
  }

  setAuth(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error setting auth:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  clearAuth(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  getToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const timestamp = localStorage.getItem(this.TOKEN_TIMESTAMP_KEY);
      
      if (!token || !timestamp) {
        return null;
      }

      const now = Date.now();
      const tokenAge = now - parseInt(timestamp);
      
      if (tokenAge >= this.TOKEN_EXPIRY) {
        this.clearAuth();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  initiateLogin(): void {
    try {
      if (!SPOTIFY_CLIENT_ID) {
        throw new Error('Missing Spotify Client ID');
      }

      const state = Math.random().toString(36).substring(7);
      const authUrl = new URL('https://accounts.spotify.com/authorize');
      
      authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
      authUrl.searchParams.append('response_type', 'token');
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('scope', SCOPES);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('show_dialog', 'true');

      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('Error initiating login:', error);
      throw new Error('Failed to initiate Spotify login');
    }
  }
}

export default new SpotifyAuthService();
import { SPOTIFY_CLIENT_ID, REDIRECT_URI, SCOPES } from '../config/spotify';

class SpotifyAuthService {
  private readonly TOKEN_KEY = 'spotify_token';
  private readonly TOKEN_TIMESTAMP_KEY = 'spotify_token_timestamp';

  checkAuth(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const timestamp = localStorage.getItem(this.TOKEN_TIMESTAMP_KEY);
    
    if (token && timestamp) {
      const now = Date.now();
      const tokenAge = now - parseInt(timestamp);
      if (tokenAge < 3600000) {
        return true;
      }
      this.clearAuth();
    }
    return false;
  }

  handleCallback(hash: string): boolean {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      this.setAuth(accessToken);
      return true;
    }
    return false;
  }

  setAuth(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_TIMESTAMP_KEY, Date.now().toString());
  }

  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  initiateLogin(): void {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
  }
}

export default new SpotifyAuthService();
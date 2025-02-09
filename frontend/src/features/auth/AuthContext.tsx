import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpotifyAuth } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<SpotifyAuth | null>(null);

  useEffect(() => {
    // Check URL hash for auth response
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      setAuth({
        accessToken,
        expiresIn: parseInt(params.get('expires_in') || '3600', 10),
      });
      // Clear URL hash
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const login = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    if (!clientId) {
      throw new Error('Spotify Client ID not configured');
    }

    const redirectUri = window.location.origin;
    const scope = 'streaming user-read-email user-read-private user-modify-playback-state';
    const state = crypto.randomUUID();

    localStorage.setItem('spotify_auth_state', state);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
  };

  const logout = () => {
    setAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!auth?.accessToken,
        accessToken: auth?.accessToken || null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
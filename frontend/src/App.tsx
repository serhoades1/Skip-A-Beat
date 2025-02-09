import React, { useState, useEffect } from 'react';
import { Bluetooth } from 'lucide-react';
import HeartRateDisplay from './components/HeartRateDisplay';
import PlaylistUploader from './components/PlaylistUploader';
import SpotifyConnect from './components/SpotifyConnect';
import MusicPlayer from './components/MusicPlayer';
import PlaylistHistory from './components/PlaylistHistory';
import GarminService from './services/GarminService';
import SpotifyService from './services/SpotifyService';
import MusicMatcher from './services/MusicMatcher';
import { config } from './config';
import { HeartRateData, PlaylistData, Song } from './types';

function App() {
  const [heartRate, setHeartRate] = useState<HeartRateData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistData | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're returning from Spotify auth
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    const error = params.get('error');
    
    if (error) {
      setError('Failed to connect to Spotify: ' + error);
      setIsLoading(false);
      return;
    }
    
    if (accessToken) {
      // Clear the URL hash
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Initialize Spotify with the token
      handleSpotifyAuth(accessToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    GarminService.onHeartRateChange((data) => {
      setHeartRate(data);
      if (currentPlaylist) {
        updateMusicBasedOnHeartRate(data.heartRate);
      }
    });

    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }, [currentPlaylist]);

  const handleConnect = async () => {
    const connected = await GarminService.connect();
    setIsConnected(connected);
  };

  const handleSpotifyConnect = () => {
    const clientId = config.spotify.clientId;
    if (!clientId) {
      setError('Spotify Client ID not configured');
      return;
    }

    const redirectUri = window.location.origin;
    const scope = 'streaming user-read-email user-read-private user-modify-playback-state';
    const state = crypto.randomUUID();

    // Store state for verification
    localStorage.setItem('spotify_auth_state', state);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
  };

  const handleSpotifyAuth = async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await SpotifyService.setAccessToken(accessToken);
      await SpotifyService.initialize(config.spotify.clientId);
      setIsSpotifyConnected(true);
    } catch (error) {
      console.error('Failed to initialize Spotify:', error);
      setError('Failed to initialize Spotify player. Please make sure you have Spotify Premium and try again.');
      setIsSpotifyConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaylistUpload = async (file: File) => {
    try {
      const songs = await SpotifyService.importPlaylist(file);
      const newPlaylist: PlaylistData = {
        id: crypto.randomUUID(),
        name: file.name.replace('.csv', ''),
        songs,
        uploadedAt: Date.now(),
        selected: true
      };
      
      setPlaylists((prev) => {
        const updated = prev.map(p => ({ ...p, selected: false }));
        updated.unshift(newPlaylist);
        localStorage.setItem('playlists', JSON.stringify(updated));
        return updated;
      });
      
      setCurrentPlaylist(newPlaylist);
      
      if (heartRate) {
        updateMusicBasedOnHeartRate(heartRate.heartRate, songs);
      }
    } catch (error) {
      console.error('Error importing playlist:', error);
      setError('Failed to import playlist. Please check the file format and try again.');
    }
  };

  const handlePlaylistSelect = (playlist: PlaylistData) => {
    setPlaylists(prev => 
      prev.map(p => ({
        ...p,
        selected: p.id === playlist.id
      }))
    );
    setCurrentPlaylist(playlist);
    
    if (heartRate) {
      updateMusicBasedOnHeartRate(heartRate.heartRate, playlist.songs);
    }
  };

  const updateMusicBasedOnHeartRate = (currentHeartRate: number, songs = currentPlaylist?.songs || []) => {
    if (songs.length === 0) return;

    const matchingSongs = MusicMatcher.findMatchingSongs(songs, currentHeartRate, 5);
    
    if (matchingSongs.length > 0) {
      if (!currentSong) {
        setCurrentSong(matchingSongs[0]);
        setQueue(matchingSongs.slice(1));
      } else {
        setQueue(matchingSongs.filter(song => song.id !== currentSong.id));
      }
    }
  };

  const handleNext = () => {
    if (queue.length > 0) {
      setCurrentSong(queue[0]);
      setQueue(queue.slice(1));
    }
  };

  const handlePrevious = () => {
    if (currentSong && currentPlaylist) {
      const currentIndex = currentPlaylist.songs.findIndex(s => s.id === currentSong.id);
      if (currentIndex > 0) {
        const previousSong = currentPlaylist.songs[currentIndex - 1];
        setCurrentSong(previousSong);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <div className="container mx-auto p-6 space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <HeartRateDisplay heartRate={heartRate} />
          <button
            onClick={handleConnect}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isConnected
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Bluetooth size={20} />
            <span>{isConnected ? 'Connected' : 'Connect Device'}</span>
          </button>
        </div>

        {!isSpotifyConnected ? (
          <SpotifyConnect onConnect={handleSpotifyConnect} />
        ) : (
          <div className="space-y-6">
            <PlaylistUploader onUpload={handlePlaylistUpload} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlaylistHistory 
                playlists={playlists} 
                onSelect={handlePlaylistSelect} 
              />
              <MusicPlayer 
                isConnected={isSpotifyConnected}
                currentSong={currentSong}
                queue={queue}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
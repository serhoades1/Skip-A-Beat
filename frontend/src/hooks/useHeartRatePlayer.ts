import { useState, useEffect, useRef } from 'react';
import { SavedPlaylist, SpotifyTrack, AudioFeatures } from '../types';
import SpotifyAuthService from '../services/SpotifyAuthService';
import SpotifyPlayerService from '../services/SpotifyPlayerService';
import PlaylistService from '../services/PlaylistService';
import HeartRateService from '../services/HeartRateService';
import SongMatchingService from '../services/SongMatchingService';
import AudioFeaturesService from '../services/AudioFeaturesService';

export function useHeartRatePlayer() {
  const [heartRate, setHeartRate] = useState<string>('--');
  const [currentSong, setCurrentSong] = useState<SpotifyTrack | null>(null);
  const [songs, setSongs] = useState<SpotifyTrack[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [showBluetoothDialog, setShowBluetoothDialog] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);
  const [showPlaylistHistory, setShowPlaylistHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [songMetadata, setSongMetadata] = useState<Map<string, AudioFeatures>>(new Map());
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (SpotifyAuthService.handleCallback(window.location.hash)) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(SpotifyAuthService.checkAuth());
    }
  }, []);

  useEffect(() => {
    setSavedPlaylists(PlaylistService.loadSavedPlaylists());
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = SpotifyAuthService.getToken();
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    window.onSpotifyWebPlaybackSDKReady = async () => {
      try {
        await SpotifyPlayerService.initialize(
          token,
          ({ isPlaying }) => setIsPlaying(isPlaying),
          (deviceId) => setDeviceId(deviceId),
          (error) => {
            console.error(error);
            if (error.includes('authentication')) {
              SpotifyAuthService.clearAuth();
              setIsAuthenticated(false);
            }
          }
        );
      } catch (error) {
        console.error('Failed to initialize Spotify player:', error);
      }
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      SpotifyPlayerService.cleanup();
    };
  }, [isAuthenticated]);

  const handleHeartRateChange = (rate: number) => {
    setHeartRate(rate.toString());
    if (songs.length > 0) {
      const selectedSong = SongMatchingService.selectSongForHeartRate(songs, rate, songMetadata);
      if (selectedSong) {
        setCurrentSong(selectedSong);
        if (deviceId) {
          SpotifyPlayerService.playTrack(SpotifyAuthService.getToken()!, selectedSong['Track URI']);
        }
      }
    }
  };

  const initializeGarmin = async () => {
    setShowBluetoothDialog(true);
    try {
      const connected = await HeartRateService.connect(handleHeartRateChange);
      if (connected) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to connect to the device. Please try again.');
    }
    setShowBluetoothDialog(false);
  };

  const disconnectGarmin = async () => {
    await HeartRateService.disconnect();
    setIsConnected(false);
    setHeartRate('--');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingFeatures(true);
    
    try {
      const parsedSongs = await PlaylistService.parsePlaylistFile(file);
      setSongs(parsedSongs);
      
      PlaylistService.savePlaylist(file.name, parsedSongs);
      setSavedPlaylists(PlaylistService.loadSavedPlaylists());

      const trackIds = parsedSongs
        .map(song => song['Track URI'].split(':')[2])
        .filter(id => !songMetadata.has(id));

      if (trackIds.length > 0) {
        const newMetadata = await AudioFeaturesService.fetchFeatures(trackIds);
        setSongMetadata(new Map([...songMetadata, ...newMetadata]));
      }

      if (parsedSongs.length > 0) {
        setCurrentSong(parsedSongs[0]);
        if (deviceId) {
          await SpotifyPlayerService.playTrack(
            SpotifyAuthService.getToken()!,
            parsedSongs[0]['Track URI']
          );
        }
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const loadSavedPlaylist = (playlist: SavedPlaylist) => {
    setSongs(playlist.songs);
    setShowPlaylistHistory(false);
  };

  const togglePlayback = async () => {
    const token = SpotifyAuthService.getToken();
    if (!token) return;

    try {
      await SpotifyPlayerService.togglePlayback(token, isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const skipSong = () => {
    if (currentSong && heartRate !== '--') {
      const rate = parseInt(heartRate);
      const selectedSong = SongMatchingService.selectSongForHeartRate(songs, rate, songMetadata);
      if (selectedSong) {
        setCurrentSong(selectedSong);
        const token = SpotifyAuthService.getToken();
        if (token && deviceId) {
          SpotifyPlayerService.playTrack(token, selectedSong['Track URI']);
        }
      }
    }
  };

  return {
    state: {
      heartRate,
      currentSong,
      songs,
      isConnected,
      showBluetoothDialog,
      isPlaying,
      savedPlaylists,
      showPlaylistHistory,
      isAuthenticated,
      songMetadata,
      isLoadingFeatures,
      fileInputRef,
    },
    actions: {
      initializeGarmin,
      disconnectGarmin,
      handleFileUpload,
      loadSavedPlaylist,
      togglePlayback,
      skipSong,
      setShowBluetoothDialog,
      setShowPlaylistHistory,
    },
  };
}
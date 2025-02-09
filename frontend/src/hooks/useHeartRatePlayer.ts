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
  
  const lastSongChangeTime = useRef<number>(0);
  const bufferedHeartRate = useRef<number | null>(null);
  const songChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const evaluationInterval = useRef<NodeJS.Timeout | null>(null);
  const spotifyScriptLoaded = useRef<boolean>(false);
  const playerInitialized = useRef<boolean>(false);

  const EVALUATION_INTERVAL = 1000; // Check every second
  const MIN_SONG_DURATION = 5000;   // Minimum 5 seconds before changing songs

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

  // Load Spotify SDK script
  useEffect(() => {
    if (!isAuthenticated || spotifyScriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    script.onload = () => {
      spotifyScriptLoaded.current = true;
      initializeSpotifyPlayer();
    };

    document.body.appendChild(script);

    return () => {
      if (!isAuthenticated) {
        document.body.removeChild(script);
        spotifyScriptLoaded.current = false;
        playerInitialized.current = false;
      }
    };
  }, [isAuthenticated]);

  // Set up periodic heart rate evaluation
  useEffect(() => {
    if (isConnected && songs.length > 0 && playerInitialized.current) {
      console.log('Setting up heart rate evaluation interval');
      evaluationInterval.current = setInterval(() => {
        const currentRate = parseInt(heartRate);
        if (!isNaN(currentRate)) {
          evaluateHeartRate(currentRate);
        }
      }, EVALUATION_INTERVAL);

      // Initial song selection
      const currentRate = parseInt(heartRate);
      if (!isNaN(currentRate)) {
        evaluateHeartRate(currentRate);
      }

      return () => {
        if (evaluationInterval.current) {
          clearInterval(evaluationInterval.current);
        }
      };
    }
  }, [isConnected, songs.length, heartRate, playerInitialized.current]);

  // Initialize Spotify player when SDK is ready
  const initializeSpotifyPlayer = async () => {
    const token = SpotifyAuthService.getToken();
    if (!token || !window.Spotify) return;

    try {
      await SpotifyPlayerService.initialize(
        token,
        ({ isPlaying }) => {
          setIsPlaying(isPlaying);
          console.log('Playback state changed:', isPlaying);
        },
        (deviceId) => {
          setDeviceId(deviceId);
          playerInitialized.current = true;
          console.log('Spotify player ready with device ID:', deviceId);
        },
        (error) => {
          console.error('Spotify player error:', error);
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

  // Cleanup
  useEffect(() => {
    return () => {
      SpotifyPlayerService.cleanup();
      if (songChangeTimeout.current) {
        clearTimeout(songChangeTimeout.current);
      }
      if (evaluationInterval.current) {
        clearInterval(evaluationInterval.current);
      }
    };
  }, []);

  const evaluateHeartRate = (rate: number) => {
    const now = Date.now();
    const timeSinceLastChange = now - lastSongChangeTime.current;

    // Don't change songs too quickly
    if (timeSinceLastChange < MIN_SONG_DURATION) {
      return;
    }

    // Get current song ID
    const currentSongId = currentSong ? currentSong['Track URI'].split(':')[2] : undefined;

    // Check if we should change the song based on BPM difference
    if (SongMatchingService.shouldChangeSong(currentSongId, rate, songMetadata)) {
      console.log('BPM difference too high, changing song');
      changeSong(rate);
    }
  };

  const changeSong = async (rate: number) => {
    if (!playerInitialized.current) {
      console.log('Spotify player not initialized yet');
      return;
    }

    const currentSongId = currentSong ? currentSong['Track URI'].split(':')[2] : undefined;
    const selectedSong = SongMatchingService.selectSongForHeartRate(
      songs,
      rate,
      songMetadata,
      currentSongId
    );

    if (selectedSong && deviceId) {
      console.log('Selected new song:', selectedSong['Track Name']);
      setCurrentSong(selectedSong);
      
      const token = SpotifyAuthService.getToken();
      if (token) {
        try {
          await SpotifyPlayerService.playTrack(token, selectedSong['Track URI']);
          console.log('Started playing:', selectedSong['Track Name']);
          lastSongChangeTime.current = Date.now();
        } catch (error) {
          console.error('Error playing track:', error);
        }
      }
    }
  };

  const handleHeartRateChange = (rate: number) => {
    console.log('Heart rate changed:', rate);
    setHeartRate(rate.toString());
    bufferedHeartRate.current = rate;

    // Trigger immediate song change if we haven't played anything yet
    if (!currentSong && songs.length > 0 && playerInitialized.current) {
      changeSong(rate);
    }
  };

  const initializeGarmin = async () => {
    setShowBluetoothDialog(true);
    try {
      const connected = await HeartRateService.connect(handleHeartRateChange);
      if (connected) {
        setIsConnected(true);
        console.log('Heart rate monitor connected');
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
    if (songChangeTimeout.current) {
      clearTimeout(songChangeTimeout.current);
    }
    if (evaluationInterval.current) {
      clearInterval(evaluationInterval.current);
    }
    bufferedHeartRate.current = null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingFeatures(true);
    
    try {
      console.log('Loading playlist from file:', file.name);
      const parsedSongs = await PlaylistService.parsePlaylistFile(file);
      setSongs(parsedSongs);
      
      PlaylistService.savePlaylist(file.name, parsedSongs);
      setSavedPlaylists(PlaylistService.loadSavedPlaylists());

      const trackIds = parsedSongs
        .map(song => song['Track URI'].split(':')[2])
        .filter(id => !songMetadata.has(id));

      if (trackIds.length > 0) {
        console.log('Fetching audio features for', trackIds.length, 'tracks');
        const newMetadata = await AudioFeaturesService.fetchFeatures(trackIds);
        setSongMetadata(new Map([...songMetadata, ...newMetadata]));
      }

      if (parsedSongs.length > 0) {
        if (bufferedHeartRate.current && playerInitialized.current) {
          console.log('Starting playback with current heart rate:', bufferedHeartRate.current);
          changeSong(bufferedHeartRate.current);
        } else {
          console.log('Starting playback with first song');
          setCurrentSong(parsedSongs[0]);
          const token = SpotifyAuthService.getToken();
          if (deviceId && token && playerInitialized.current) {
            await SpotifyPlayerService.playTrack(token, parsedSongs[0]['Track URI']);
            lastSongChangeTime.current = Date.now();
          }
        }
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const loadSavedPlaylist = async (playlist: SavedPlaylist) => {
    console.log('Loading saved playlist:', playlist.name);
    setSongs(playlist.songs);
    
    if (playlist.songs.length > 0) {
      if (bufferedHeartRate.current && playerInitialized.current) {
        await changeSong(bufferedHeartRate.current);
      } else if (playerInitialized.current) {
        setCurrentSong(playlist.songs[0]);
        const token = SpotifyAuthService.getToken();
        if (deviceId && token) {
          await SpotifyPlayerService.playTrack(token, playlist.songs[0]['Track URI']);
          lastSongChangeTime.current = Date.now();
        }
      }
    }
    setShowPlaylistHistory(false);
  };

  const togglePlayback = async () => {
    const token = SpotifyAuthService.getToken();
    if (!token || !playerInitialized.current) return;

    try {
      await SpotifyPlayerService.togglePlayback(token, isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const skipSong = () => {
    if (currentSong && heartRate !== '--' && playerInitialized.current) {
      const rate = parseInt(heartRate);
      changeSong(rate);
    }
  };

  const simulateHeartRate = (rate: number) => {
    if (!isConnected) {
      console.log('Simulating heart rate:', rate);
      handleHeartRateChange(rate);
      if (songs.length > 0 && playerInitialized.current) {
        evaluateHeartRate(rate);
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
      simulateHeartRate,
    },
  };
}
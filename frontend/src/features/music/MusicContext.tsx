import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, PlaylistData } from '../../types';
import { spotifyService } from '../../services/spotify';
import { musicMatcher } from '../../services/music';
import { useHeartRate } from '../heartRate/HeartRateContext';
import { useAuth } from '../auth/AuthContext';

interface MusicContextType {
  currentSong: Song | null;
  queue: Song[];
  currentPlaylist: PlaylistData | null;
  playlists: PlaylistData[];
  isPlaying: boolean;
  importPlaylist: (file: File) => Promise<void>;
  selectPlaylist: (playlist: PlaylistData) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayback: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { heartRate } = useHeartRate();
  const { accessToken } = useAuth();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistData | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (accessToken) {
      spotifyService.setAccessToken(accessToken);
      spotifyService.initialize(import.meta.env.VITE_SPOTIFY_CLIENT_ID);
    }
  }, [accessToken]);

  useEffect(() => {
    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  }, []);

  useEffect(() => {
    if (heartRate && currentPlaylist) {
      updateMusicBasedOnHeartRate(heartRate.heartRate);
    }
  }, [heartRate, currentPlaylist]);

  const updateMusicBasedOnHeartRate = (currentHeartRate: number) => {
    if (!currentPlaylist?.songs.length) return;

    const matchingSongs = musicMatcher.findMatchingSongs(currentPlaylist.songs, currentHeartRate, 5);
    
    if (matchingSongs.length > 0) {
      if (!currentSong) {
        setCurrentSong(matchingSongs[0]);
        setQueue(matchingSongs.slice(1));
      } else {
        setQueue(matchingSongs.filter(song => song.id !== currentSong.id));
      }
    }
  };

  const importPlaylist = async (file: File) => {
    try {
      const songs = await spotifyService.importPlaylist(file);
      const newPlaylist: PlaylistData = {
        id: crypto.randomUUID(),
        name: file.name.replace('.csv', ''),
        songs,
        uploadedAt: Date.now(),
        selected: true
      };
      
      setPlaylists(prev => {
        const updated = prev.map(p => ({ ...p, selected: false }));
        updated.unshift(newPlaylist);
        localStorage.setItem('playlists', JSON.stringify(updated));
        return updated;
      });
      
      setCurrentPlaylist(newPlaylist);
      
      if (heartRate) {
        updateMusicBasedOnHeartRate(heartRate.heartRate);
      }
    } catch (error) {
      console.error('Error importing playlist:', error);
      throw new Error('Failed to import playlist');
    }
  };

  const selectPlaylist = (playlist: PlaylistData) => {
    setPlaylists(prev => 
      prev.map(p => ({
        ...p,
        selected: p.id === playlist.id
      }))
    );
    setCurrentPlaylist(playlist);
    
    if (heartRate) {
      updateMusicBasedOnHeartRate(heartRate.heartRate);
    }
  };

  const playNext = () => {
    if (queue.length > 0) {
      setCurrentSong(queue[0]);
      setQueue(queue.slice(1));
    }
  };

  const playPrevious = () => {
    if (currentSong && currentPlaylist) {
      const currentIndex = currentPlaylist.songs.findIndex(s => s.id === currentSong.id);
      if (currentIndex > 0) {
        const previousSong = currentPlaylist.songs[currentIndex - 1];
        setCurrentSong(previousSong);
      }
    }
  };

  const togglePlayback = async () => {
    await spotifyService.togglePlayback();
    setIsPlaying(!isPlaying);
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        queue,
        currentPlaylist,
        playlists,
        isPlaying,
        importPlaylist,
        selectPlaylist,
        playNext,
        playPrevious,
        togglePlayback,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
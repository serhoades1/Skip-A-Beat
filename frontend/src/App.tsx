import React, { useState, useEffect, useRef } from 'react';
import { Heart, Upload, Watch, Bluetooth, History, Play, Pause, SkipForward, LogIn, Music2 } from 'lucide-react';
import Papa from 'papaparse';

const SPOTIFY_CLIENT_ID = 'b8e7060c1f7845aeb5f3cdd0a1846550';
const REDIRECT_URI = window.location.origin;
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state'
].join(' ');

interface SavedPlaylist {
  name: string;
  songs: any[];
  timestamp: number;
}

interface AudioFeatures {
  tempo: number;          // BPM
  energy: number;         // 0.0 to 1.0
  danceability: number;   // 0.0 to 1.0
  valence: number;        // 0.0 to 1.0 (represents musical positiveness/happiness)
}

function App() {
  const [heartRate, setHeartRate] = useState<number>(70);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [player, setPlayer] = useState<any>(null);
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
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      localStorage.setItem('spotify_token', accessToken);
      localStorage.setItem('spotify_token_timestamp', Date.now().toString());
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const token = localStorage.getItem('spotify_token');
      const timestamp = localStorage.getItem('spotify_token_timestamp');
      
      if (token && timestamp) {
        const now = Date.now();
        const tokenAge = now - parseInt(timestamp);
        if (tokenAge < 3600000) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('spotify_token');
          localStorage.removeItem('spotify_token_timestamp');
          setIsAuthenticated(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('savedPlaylists');
    if (saved) {
      setSavedPlaylists(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        console.error('No Spotify token found');
        return;
      }

      const spotifyPlayer = new window.Spotify.Player({
        name: 'Heart Rate Music Player',
        getOAuthToken: cb => { cb(token) }
      });

      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize:', message);
      });

      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate:', message);
        setIsAuthenticated(false);
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_token_timestamp');
      });

      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account:', message);
      });

      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback:', message);
      });

      spotifyPlayer.addListener('player_state_changed', state => {
        if (state) {
          setIsPlaying(!state.paused);
        }
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false,
          })
        }).catch(error => console.error('Error setting active device:', error));
      });

      spotifyPlayer.connect().then(success => {
        if (success) {
          console.log('Successfully connected to Spotify');
        }
      });

      setPlayer(spotifyPlayer);
    };

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isAuthenticated]);

  const handleSpotifyLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
  };

  const playTrack = async (trackUri: string) => {
    if (!deviceId) {
      console.error('No active device ID found');
      return;
    }

    const token = localStorage.getItem('spotify_token');
    if (!token) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const initializeGarmin = () => {
    if (!(window as any).garminConnectIQ) {
      (window as any).garminConnectIQ = {
        init: function() {
          console.log("Garmin Connect IQ initialized");
        },
        onDeviceConnected: function(device: any) {
          setIsConnected(true);
          setShowBluetoothDialog(false);
          startHeartRateMonitoring(device);
        }
      };

      const script = document.createElement("script");
      script.src = "https://developer.garmin.com/downloads/connect-iq/web-sdk/connectiq-web-api.js";
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const startHeartRateMonitoring = (device: any) => {
    device.onHeartRateData = (data: any) => {
      setHeartRate(data.heartRate);
      selectSongForHeartRate(data.heartRate);
    };
  };

  const fetchAudioFeatures = async (trackIds: string[]) => {
    if (trackIds.length === 0) return;
    
    const token = localStorage.getItem('spotify_token');
    if (!token) {
      console.error('No Spotify token found');
      return;
    }

    try {
      const validTrackIds = trackIds.filter(id => id && id.length > 0);
      
      const chunks = [];
      for (let i = 0; i < validTrackIds.length; i += 100) {
        chunks.push(validTrackIds.slice(i, i + 100));
      }

      const newMetadata = new Map(songMetadata);

      for (const chunk of chunks) {
        const response = await fetch(
          `https://api.spotify.com/v1/audio-features?ids=${chunk.join(',')}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_token_timestamp');
            setIsAuthenticated(false);
            throw new Error('Spotify token expired. Please log in again.');
          }
          throw new Error(`Failed to fetch audio features: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.audio_features) {
          throw new Error('Invalid response format from Spotify API');
        }

        data.audio_features.forEach((features: any, index: number) => {
          if (features && features.id === chunk[index]) {
            newMetadata.set(chunk[index], {
              tempo: features.tempo,
              energy: features.energy,
              danceability: features.danceability,
              valence: features.valence
            });
          }
        });
      }

      setSongMetadata(newMetadata);
    } catch (error) {
      console.error('Error fetching audio features:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingFeatures(true);
    
    try {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const newPlaylist = {
              name: file.name,
              songs: results.data,
              timestamp: Date.now()
            };
            
            setSongs(results.data);
            setSavedPlaylists(prev => {
              const updated = [newPlaylist, ...prev].slice(0, 5);
              localStorage.setItem('savedPlaylists', JSON.stringify(updated));
              return updated;
            });

            const trackIds = results.data
              .map((song: any) => {
                const uri = song['Track URI'];
                return uri ? uri.split(':')[2] : null;
              })
              .filter((id: string | null): id is string => 
                id !== null && !songMetadata.has(id)
              );

            if (trackIds.length > 0) {
              await fetchAudioFeatures(trackIds);
            }

            if (results.data.length > 0) {
              const firstSong = results.data[0];
              setCurrentSong(firstSong);
              if (deviceId) {
                await playTrack(firstSong['Track URI']);
              }
            }
          } catch (error) {
            console.error('Error processing playlist:', error);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
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

  const selectSongForHeartRate = async (rate: number) => {
    if (songs.length === 0) return;

    const targetBPM = rate;
    const targetEnergy = rate < 100 ? 0.3 : rate < 140 ? 0.6 : 0.9;

    const scoredSongs = songs.map(song => {
      const trackId = song['Track URI'].split(':')[2];
      const metadata = songMetadata.get(trackId);
      
      if (!metadata) return { song, score: Infinity };

      const bpmDiff = Math.abs(metadata.tempo - targetBPM);
      const energyDiff = Math.abs(metadata.energy - targetEnergy);
      const danceabilityBonus = metadata.danceability * 0.2;
      const valenceBonus = metadata.valence * 0.1;
      
      const score = (bpmDiff * 0.5) + (energyDiff * 0.3) - danceabilityBonus - valenceBonus;
      
      return { song, score };
    });

    scoredSongs.sort((a, b) => a.score - b.score);
    const topMatches = scoredSongs.slice(0, 3);
    
    const selectedSong = topMatches[Math.floor(Math.random() * topMatches.length)].song;
    
    setCurrentSong(selectedSong);
    
    if (deviceId && selectedSong) {
      await playTrack(selectedSong['Track URI']);
    }
  };

  const togglePlayback = async () => {
    if (!player || !deviceId) return;

    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) return;

      if (isPlaying) {
        await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      } else {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const skipSong = () => {
    if (currentSong) {
      selectSongForHeartRate(heartRate);
    }
  };

  const getHeartAnimationDuration = (bpm: number) => {
    const beatDuration = 60 / bpm;
    return `${beatDuration * 0.8}s`;
  };

  const PlayerPlaceholder = () => (
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg relative z-10">
      <div className="flex flex-col items-center justify-center h-64 bg-black/30 rounded-lg mb-4">
        <Music2 className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-400 text-center px-4">
          {!isConnected && songs.length === 0 && (
            "Connect your Garmin watch and upload a playlist to start"
          )}
          {!isConnected && songs.length > 0 && (
            "Connect your Garmin watch to start playing music"
          )}
          {isConnected && songs.length === 0 && (
            "Upload a Spotify playlist to start playing music"
          )}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          <div>No song playing</div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            disabled
            className="p-2 rounded-full bg-white/5 cursor-not-allowed"
          >
            <Play className="w-6 h-6 text-gray-500" />
          </button>
          <button
            disabled
            className="p-2 rounded-full bg-white/5 cursor-not-allowed"
          >
            <SkipForward className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );

  const SongCharacteristics = ({ song }: { song: any }) => {
    const trackId = song['Track URI'].split(':')[2];
    const metadata = songMetadata.get(trackId);

    if (!metadata) return null;

    const getBarWidth = (value: number) => `${value * 100}%`;
    const getBarColor = (value: number) => {
      if (value < 0.3) return 'bg-blue-500';
      if (value < 0.6) return 'bg-green-500';
      return 'bg-yellow-500';
    };

    return (
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Energy</span>
            <span>{Math.round(metadata.energy * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getBarColor(metadata.energy)} transition-all duration-500`}
              style={{ width: getBarWidth(metadata.energy) }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Positivity</span>
            <span>{Math.round(metadata.valence * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getBarColor(metadata.valence)} transition-all duration-500`}
              style={{ width: getBarWidth(metadata.valence) }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Danceability</span>
            <span>{Math.round(metadata.danceability * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getBarColor(metadata.danceability)} transition-all duration-500`}
              style={{ width: getBarWidth(metadata.danceability) }}
            />
          </div>
        </div>
        <div className="text-sm text-gray-400">
          BPM: {Math.round(metadata.tempo)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex items-center justify-between mb-6 bg-white/5 rounded-lg p-4 relative z-10">
          <div className="flex items-center">
            <Watch className={`w-6 h-6 ${isConnected ? 'text-green-500' : 'text-gray-400'} mr-2`} />
            <span className="text-sm">
              {isConnected ? 'Garmin Watch Connected' : 'Waiting for Garmin Watch...'}
            </span>
          </div>
          <button
            onClick={() => {
              initializeGarmin();
              if (navigator.bluetooth) {
                navigator.bluetooth.requestDevice({
                  filters: [{ services: ['heart_rate'] }]
                }).then(device => {
                  console.log('Device selected:', device.name);
                  setIsConnected(true);
                }).catch(error => {
                  console.error('Bluetooth Error:', error);
                });
              }
            }}
            className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Bluetooth className="w-4 h-4 mr-2" />
            Connect Watch
          </button>
        </div>

        <div className="relative z-0 flex items-center justify-center mb-8 bg-black/20 rounded-xl p-8 backdrop-blur-sm">
          <div className="relative">
            <Heart 
              className="w-16 h-16 text-red-500"
              style={{
                animation: `pulse ${getHeartAnimationDuration(heartRate)} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              }}
            />
            <style>{`
              @keyframes pulse {
                0%, 100% {
                  transform: scale(1);
                  opacity: 1;
                }
                50% {
                  transform: scale(1.1);
                  opacity: 0.8;
                }
              }
            `}</style>
          </div>
          <span className="text-4xl ml-4 font-bold">{heartRate} BPM</span>
        </div>

        <div className="mb-8 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div 
              onClick={() => !isLoadingFeatures && isAuthenticated && fileInputRef.current?.click()}
              className={`flex-1 flex items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-lg ${
                isLoadingFeatures || !isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-white/40'
              } transition-colors mr-4 bg-black/20 backdrop-blur-sm`}
            >
              {isLoadingFeatures ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Analyzing songs...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mr-2" />
                  <span>{songs.length > 0 ? 'Change Playlist' : 'Upload Spotify CSV Playlist'}</span>
                </>
              )}
            </div>
            <button
              onClick={() => setShowPlaylistHistory(true)}
              disabled={!isAuthenticated}
              className={`p-6 border-2 border-white/20 rounded-lg ${
                isAuthenticated ? 'hover:border-white/40' : 'opacity-50 cursor-not-allowed'
              } transition-colors bg-black/20 backdrop-blur-sm`}
            >
              <History className="w-6 h-6" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoadingFeatures || !isAuthenticated}
          />
          {songs.length > 0 && (
            <p className="text-center text-sm text-gray-400">
              {songs.length} songs loaded
              {isLoadingFeatures && ' • Analyzing song characteristics...'}
            </p>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg relative z-10">
            <div className="flex flex-col items-center justify-center h-64">
              <Music2 className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Connect to Spotify</h2>
              <p className="text-gray-300 text-center mb-6">Connect your Spotify account to start playing music based on your heart rate.</p>
              <button
                onClick={handleSpotifyLogin}
                className="flex items-center px-6 py-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors text-lg font-semibold"
              >
                <LogIn className="w-6 h-6 mr-2" />
                Connect with Spotify
              </button>
            </div>
          </div>
        ) : (!isConnected || songs.length === 0) ? (
          <PlayerPlaceholder />
        ) : (
          currentSong && (
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg relative z-10">
              <img 
                src={currentSong['Album Image URL']} 
                alt={currentSong['Album Name']}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">{currentSong['Track Name']}</h2>
              <p className="text-gray-300 mb-4">{currentSong['Artist Name(s)']}</p>
              
              <SongCharacteristics song={currentSong} />

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-400">
                  <div>Album: {currentSong['Album Name']}</div>
                  <div>Duration: {Math.floor(currentSong['Track Duration (ms)'] / 1000)}s</div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayback}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={skipSong}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {showBluetoothDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Connect Garmin Watch</h3>
              <p className="mb-4">Please ensure your Garmin watch is in pairing mode and nearby.</p>
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-400 text-center">Searching for devices...</p>
              <button
                onClick={() => setShowBluetoothDialog(false)}
                className="mt-4 w-full py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showPlaylistHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Recent Playlists</h3>
              {savedPlaylists.length > 0 ? (
                <ul className="space-y-2">
                  {savedPlaylists.map((playlist, index) => (
                    <li key={index}>
                      <button
                        onClick={() => loadSavedPlaylist(playlist)}
                        className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <div className="font-medium">{playlist.name}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(playlist.timestamp).toLocaleDateString()} • 
                          {playlist.songs.length} songs
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No saved playlists yet</p>
              )}
              <button
                onClick={() => setShowPlaylistHistory(false)}
                className="mt-4 w-full py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
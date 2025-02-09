import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useHeartRate } from '../features/heartRate/HeartRateContext';
import { useMusic } from '../features/music/MusicContext';
import HeartRateDisplay from './HeartRateDisplay';
import PlaylistUploader from './PlaylistUploader';
import SpotifyConnect from './SpotifyConnect';
import MusicPlayer from './MusicPlayer';
import PlaylistHistory from './PlaylistHistory';
import { Bluetooth } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const { heartRate, isConnected, connect } = useHeartRate();
  const {
    currentSong,
    queue,
    playlists,
    importPlaylist,
    selectPlaylist,
    playNext,
    playPrevious,
  } = useMusic();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <HeartRateDisplay heartRate={heartRate} />
          <button
            onClick={connect}
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

        {!isAuthenticated ? (
          <SpotifyConnect onConnect={login} />
        ) : (
          <div className="space-y-6">
            <PlaylistUploader onUpload={importPlaylist} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlaylistHistory 
                playlists={playlists} 
                onSelect={selectPlaylist} 
              />
              <MusicPlayer 
                currentSong={currentSong}
                queue={queue}
                onNext={playNext}
                onPrevious={playPrevious}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
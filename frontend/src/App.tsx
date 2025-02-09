import React, { useState } from 'react';
import HeartRateDisplay from './components/HeartRateDisplay';
import DeviceStatus from './components/DeviceStatus';
import PlayerPlaceholder from './components/PlayerPlaceholder';
import PlaylistUploader from './components/PlaylistUploader';
import NowPlaying from './components/NowPlaying';
import SpotifyConnect from './components/SpotifyConnect';
import PlaylistHistory from './components/PlaylistHistory';
import BluetoothDialog from './components/BluetoothDialog';
import HeartRateSimulator from './components/HeartRateSimulator';
import SpotifyAuthService from './services/SpotifyAuthService';
import { useHeartRatePlayer } from './hooks/useHeartRatePlayer';

function App() {
  const { state, actions } = useHeartRatePlayer();
  const [showSimulator, setShowSimulator] = useState(false);

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'h' && event.ctrlKey) {
      setShowSimulator(prev => !prev);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const renderPlayer = () => {
    if (!state.isAuthenticated) {
      return <SpotifyConnect onLogin={SpotifyAuthService.initiateLogin} />;
    }

    if (state.currentSong) {
      return (
        <NowPlaying
          song={state.currentSong}
          isPlaying={state.isPlaying}
          metadata={state.songMetadata}
          onTogglePlay={actions.togglePlayback}
          onSkip={actions.skipSong}
        />
      );
    }

    return (
      <PlayerPlaceholder
        isConnected={state.isConnected}
        hasSongs={state.songs.length > 0}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto relative">
        <DeviceStatus
          isConnected={state.isConnected}
          onConnect={actions.initializeGarmin}
          onDisconnect={actions.disconnectGarmin}
        />

        <HeartRateDisplay heartRate={state.heartRate} />

        <PlaylistUploader
          isLoadingFeatures={state.isLoadingFeatures}
          isAuthenticated={state.isAuthenticated}
          hasSongs={state.songs.length > 0}
          onUpload={actions.handleFileUpload}
          onHistoryClick={() => actions.setShowPlaylistHistory(true)}
          fileInputRef={state.fileInputRef}
        />

        {renderPlayer()}

        {state.showBluetoothDialog && (
          <BluetoothDialog onCancel={() => actions.setShowBluetoothDialog(false)} />
        )}

        {state.showPlaylistHistory && (
          <PlaylistHistory
            playlists={state.savedPlaylists}
            onSelect={actions.loadSavedPlaylist}
            onClose={() => actions.setShowPlaylistHistory(false)}
          />
        )}

        <HeartRateSimulator
          isVisible={showSimulator && !state.isConnected}
          onHeartRateChange={(rate) => actions.simulateHeartRate(rate)}
        />
      </div>
    </div>
  );
}

export default App;
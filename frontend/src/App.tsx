import React from 'react';
import HeartRateDisplay from './components/HeartRateDisplay';
import DeviceStatus from './components/DeviceStatus';
import PlayerPlaceholder from './components/PlayerPlaceholder';
import PlaylistUploader from './components/PlaylistUploader';
import NowPlaying from './components/NowPlaying';
import SpotifyConnect from './components/SpotifyConnect';
import PlaylistHistory from './components/PlaylistHistory';
import BluetoothDialog from './components/BluetoothDialog';
import SpotifyAuthService from './services/SpotifyAuthService';
import { useHeartRatePlayer } from './hooks/useHeartRatePlayer';

function App() {
  const { state, actions } = useHeartRatePlayer();

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

        {!state.isAuthenticated ? (
          <SpotifyConnect onLogin={SpotifyAuthService.initiateLogin} />
        ) : (!state.isConnected || state.songs.length === 0) ? (
          <PlayerPlaceholder
            isConnected={state.isConnected}
            hasSongs={state.songs.length > 0}
          />
        ) : (
          state.currentSong && (
            <NowPlaying
              song={state.currentSong}
              isPlaying={state.isPlaying}
              metadata={state.songMetadata}
              onTogglePlay={actions.togglePlayback}
              onSkip={actions.skipSong}
            />
          )
        )}

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
      </div>
    </div>
  );
}

export default App;
import React from 'react';
import { Music2 } from 'lucide-react';

interface Props {
  isConnected: boolean;
  currentSongId: string | null;
}

const SpotifyPlayer: React.FC<Props> = ({ isConnected, currentSongId }) => {
  if (!isConnected) return null;

  return (
    <div className="bg-purple-900/50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Music2 className="text-green-400" size={24} />
        <h2 className="text-xl font-semibold">Now Playing</h2>
      </div>
      <iframe
        src={`https://open.spotify.com/embed/track/${currentSongId || ''}`}
        width="100%"
        height="380"
        frameBorder="0"
        allow="encrypted-media"
        className="rounded-lg"
      />
    </div>
  );
}

export default SpotifyPlayer;
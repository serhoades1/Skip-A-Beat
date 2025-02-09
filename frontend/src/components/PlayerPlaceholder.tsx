import React from 'react';
import { Music2, Play, SkipForward } from 'lucide-react';

interface Props {
  isConnected: boolean;
  hasSongs: boolean;
}

const PlayerPlaceholder: React.FC<Props> = ({ isConnected, hasSongs }) => {
  return (
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg relative z-10">
      <div className="flex flex-col items-center justify-center h-64 bg-black/30 rounded-lg mb-4">
        <Music2 className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-400 text-center px-4">
          {!isConnected && !hasSongs && (
            "Connect your heart rate monitor and upload a playlist to start"
          )}
          {!isConnected && hasSongs && (
            "Connect your heart rate monitor to start playing music"
          )}
          {isConnected && !hasSongs && (
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
};

export default PlayerPlaceholder;
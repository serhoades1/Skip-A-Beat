import React from 'react';
import { Music2, LogIn } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

const SpotifyConnect: React.FC<Props> = ({ onLogin }) => {
  return (
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg relative z-10">
      <div className="flex flex-col items-center justify-center h-64">
        <Music2 className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Connect to Spotify</h2>
        <p className="text-gray-300 text-center mb-6">
          Connect your Spotify account to start playing music based on your heart rate.
        </p>
        <button
          onClick={onLogin}
          className="flex items-center px-6 py-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors text-lg font-semibold"
        >
          <LogIn className="w-6 h-6 mr-2" />
          Connect with Spotify
        </button>
      </div>
    </div>
  );
};

export default SpotifyConnect;
import React from 'react';
import { Music2, LogIn } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

const SpotifyConnect: React.FC<Props> = ({ onLogin }) => {
  return (
    <div className="bg-white/10 rounded-lg p-8 backdrop-blur-lg relative z-10 text-center">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Music2 className="w-20 h-20 text-green-500" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <LogIn className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-3">Connect to Spotify</h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Connect your Spotify account to start playing music based on your heart rate.
            We'll match the perfect songs to keep you in rhythm.
          </p>
        </div>

        <button
          onClick={onLogin}
          className="flex items-center px-8 py-3 bg-green-500 hover:bg-green-600 transition-colors rounded-full text-lg font-semibold group"
        >
          <span>Connect with Spotify</span>
          <LogIn className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default SpotifyConnect;
import React from 'react';
import { Music } from 'lucide-react';
import { config } from '../config';

interface Props {
  onConnect: () => void;
}

const SpotifyConnect: React.FC<Props> = ({ onConnect }) => {
  const isClientIdMissing = !config.spotify.clientId;

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-purple-900/50 rounded-lg">
      <Music className="text-green-400" size={64} />
      <h2 className="text-2xl font-bold text-white">Connect to Spotify</h2>
      <p className="text-lg text-gray-300 text-center max-w-md">
        {isClientIdMissing 
          ? 'Please set up your Spotify Client ID in the .env file to enable Spotify integration.'
          : 'Connect your Spotify account to start playing music based on your heart rate.'}
      </p>
      <button
        onClick={onConnect}
        disabled={isClientIdMissing}
        className={`flex items-center gap-2 px-8 py-4 rounded-full text-lg font-medium transition-colors
          ${isClientIdMissing 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600'} text-white`}
      >
        <span>Connect with Spotify</span>
      </button>
    </div>
  );
};

export default SpotifyConnect;
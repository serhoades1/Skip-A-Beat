import React from 'react';
import { SkipForward } from 'lucide-react';
import { SpotifyTrack } from '../types';

interface Props {
  song: SpotifyTrack;
  onSkip: () => void;
}

const NowPlaying: React.FC<Props> = ({ song, onSkip }) => {
  const trackId = song['Track URI'].split(':')[2];

  return (
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg relative z-10">
      <img 
        src={song['Album Image URL']} 
        alt={song['Album Name']}
        className="w-full h-64 object-cover rounded-lg mb-4"
      />
      <h2 className="text-2xl font-bold mb-2">{song['Track Name']}</h2>
      <p className="text-gray-300 mb-4">{song['Artist Name(s)']}</p>
      
      {/* Spotify Embed Player */}
      <div className="mt-4 mb-6">
        <iframe
          src={`https://open.spotify.com/embed/track/${trackId}?autoplay=1`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          className="rounded-lg"
        />
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-400">
          <div>Album: {song['Album Name']}</div>
          <div>Duration: {Math.floor(song['Track Duration (ms)'] / 1000)}s</div>
        </div>
        <button
          onClick={onSkip}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default NowPlaying;
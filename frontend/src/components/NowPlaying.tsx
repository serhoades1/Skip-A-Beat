import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import SongCharacteristics from './SongCharacteristics';
import { SpotifyTrack, AudioFeatures } from '../types';

interface Props {
  song: SpotifyTrack;
  isPlaying: boolean;
  metadata: Map<string, AudioFeatures>;
  onTogglePlay: () => void;
  onSkip: () => void;
}

const NowPlaying: React.FC<Props> = ({ song, isPlaying, metadata, onTogglePlay, onSkip }) => {
  return (
    <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg relative z-10">
      <img 
        src={song['Album Image URL']} 
        alt={song['Album Name']}
        className="w-full h-64 object-cover rounded-lg mb-4"
      />
      <h2 className="text-2xl font-bold mb-2">{song['Track Name']}</h2>
      <p className="text-gray-300 mb-4">{song['Artist Name(s)']}</p>
      
      <SongCharacteristics song={song} metadata={metadata} />

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-400">
          <div>Album: {song['Album Name']}</div>
          <div>Duration: {Math.floor(song['Track Duration (ms)'] / 1000)}s</div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={onSkip}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
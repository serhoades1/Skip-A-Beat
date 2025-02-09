import React from 'react';
import { SkipForward, SkipBack } from 'lucide-react';
import { Song } from '../types';

interface Props {
  isConnected: boolean;
  currentSong: Song | null;
  queue: Song[];
  onNext: () => void;
  onPrevious: () => void;
}

const MusicPlayer: React.FC<Props> = ({ 
  isConnected, 
  currentSong, 
  queue, 
  onNext,
  onPrevious 
}) => {
  if (!isConnected || !currentSong) return null;

  return (
    <div className="w-full bg-purple-900/50 rounded-lg p-6 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full text-center">
          <h3 className="text-2xl font-bold text-white mb-2">{currentSong.name}</h3>
          <p className="text-purple-300 text-lg mb-4">{currentSong.artist}</p>
          
          {/* Spotify Embed Player */}
          <iframe
            src={`https://open.spotify.com/embed/track/${currentSong.id}`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg mb-4"
          />

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={onPrevious}
              className="p-2 text-purple-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!queue.length}
            >
              <SkipBack size={24} />
            </button>
            
            <button
              onClick={onNext}
              className="p-2 text-purple-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!queue.length}
            >
              <SkipForward size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">Up Next</h4>
          <div className="space-y-2">
            {queue.slice(0, 3).map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-800/30 hover:bg-purple-800/50 transition-colors"
              >
                <span className="text-sm text-purple-300">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{song.name}</p>
                  <p className="text-sm text-purple-300 truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
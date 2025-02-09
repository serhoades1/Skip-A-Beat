import React from 'react';
import { Clock, Music } from 'lucide-react';
import { PlaylistData } from '../types';

interface Props {
  playlists: PlaylistData[];
  onSelect: (playlist: PlaylistData) => void;
}

const PlaylistHistory: React.FC<Props> = ({ playlists, onSelect }) => {
  if (playlists.length === 0) return null;

  return (
    <div className="bg-purple-900/50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-purple-300" size={24} />
        <h2 className="text-xl font-semibold">Playlist History</h2>
      </div>
      <div className="space-y-3">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => onSelect(playlist)}
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${
              playlist.selected 
                ? 'bg-purple-600/70 hover:bg-purple-600/80'
                : 'bg-purple-800/50 hover:bg-purple-700/50'
            }`}
          >
            <Music className="text-purple-300" size={20} />
            <div className="flex-1 text-left">
              <h3 className="font-medium">{playlist.name}</h3>
              <p className="text-sm text-gray-300">
                {playlist.songs.length} songs • {new Date(playlist.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlaylistHistory;
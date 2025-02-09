import React from 'react';
import { SavedPlaylist } from '../types';

interface Props {
  playlists: SavedPlaylist[];
  onSelect: (playlist: SavedPlaylist) => void;
  onClose: () => void;
}

const PlaylistHistory: React.FC<Props> = ({ playlists, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Recent Playlists</h3>
        {playlists.length > 0 ? (
          <ul className="space-y-2">
            {playlists.map((playlist, index) => (
              <li key={index}>
                <button
                  onClick={() => onSelect(playlist)}
                  className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="font-medium">{playlist.name}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(playlist.timestamp).toLocaleDateString()} • 
                    {playlist.songs.length} songs
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No saved playlists yet</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PlaylistHistory;
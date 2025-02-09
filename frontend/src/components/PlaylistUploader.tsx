import React from 'react';
import { Upload } from 'lucide-react';

interface Props {
  onUpload: (file: File) => void;
}

const PlaylistUploader: React.FC<Props> = ({ onUpload }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="w-full bg-purple-900/50 rounded-lg p-6">
      <label className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
        <Upload size={24} />
        <span className="text-lg">Upload Spotify CSV Playlist</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default PlaylistUploader;
import React from 'react';
import { Upload, History } from 'lucide-react';

interface Props {
  isLoadingFeatures: boolean;
  isAuthenticated: boolean;
  hasSongs: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onHistoryClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const PlaylistUploader: React.FC<Props> = ({
  isLoadingFeatures,
  isAuthenticated,
  hasSongs,
  onUpload,
  onHistoryClick,
  fileInputRef
}) => {
  return (
    <div className="mb-8 relative z-10">
      <div className="flex justify-between items-center mb-4">
        <div 
          onClick={() => !isLoadingFeatures && isAuthenticated && fileInputRef.current?.click()}
          className={`flex-1 flex items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-lg ${
            isLoadingFeatures || !isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-white/40'
          } transition-colors mr-4 bg-black/20 backdrop-blur-sm`}
        >
          {isLoadingFeatures ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              <span>Analyzing songs...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mr-2" />
              <span>{hasSongs ? 'Change Playlist' : 'Upload Spotify CSV Playlist'}</span>
            </>
          )}
        </div>
        <button
          onClick={onHistoryClick}
          disabled={!isAuthenticated}
          className={`p-6 border-2 border-white/20 rounded-lg ${
            isAuthenticated ? 'hover:border-white/40' : 'opacity-50 cursor-not-allowed'
          } transition-colors bg-black/20 backdrop-blur-sm`}
        >
          <History className="w-6 h-6" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={onUpload}
        className="hidden"
        disabled={isLoadingFeatures || !isAuthenticated}
      />
      {hasSongs && (
        <p className="text-center text-sm text-gray-400">
          Songs loaded • {isLoadingFeatures && 'Analyzing song characteristics...'}
        </p>
      )}
    </div>
  );
};

export default PlaylistUploader;
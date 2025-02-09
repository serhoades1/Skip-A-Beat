import React from 'react';
import { AudioFeatures } from '../types';

interface Props {
  song: {
    'Track URI': string;
  };
  metadata: Map<string, AudioFeatures>;
}

const SongCharacteristics: React.FC<Props> = ({ song, metadata }) => {
  const trackId = song['Track URI'].split(':')[2];
  const features = metadata.get(trackId);

  if (!features) return null;

  const getBarWidth = (value: number) => `${value * 100}%`;
  const getBarColor = (value: number) => {
    if (value < 0.3) return 'bg-blue-500';
    if (value < 0.6) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="mt-4 space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Energy</span>
          <span>{Math.round(features.energy * 100)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor(features.energy)} transition-all duration-500`}
            style={{ width: getBarWidth(features.energy) }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Positivity</span>
          <span>{Math.round(features.valence * 100)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor(features.valence)} transition-all duration-500`}
            style={{ width: getBarWidth(features.valence) }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Danceability</span>
          <span>{Math.round(features.danceability * 100)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor(features.danceability)} transition-all duration-500`}
            style={{ width: getBarWidth(features.danceability) }}
          />
        </div>
      </div>
      <div className="text-sm text-gray-400">
        BPM: {Math.round(features.tempo)}
      </div>
    </div>
  );
};

export default SongCharacteristics;
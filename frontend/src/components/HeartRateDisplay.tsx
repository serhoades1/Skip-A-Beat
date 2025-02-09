import React from 'react';
import { Heart } from 'lucide-react';
import { HeartRateData } from '../types';
import MusicMatcher from '../services/MusicMatcher';

interface Props {
  heartRate: HeartRateData | null;
}

const HeartRateDisplay: React.FC<Props> = ({ heartRate }) => {
  const zone = heartRate ? MusicMatcher.getCurrentZoneInfo(heartRate.heartRate) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <Heart className="text-red-500 animate-pulse" size={32} />
        <span>{heartRate ? `${heartRate.heartRate} BPM` : '--'}</span>
      </div>
      {zone && (
        <div className="text-sm">
          <div className="font-semibold text-purple-300">{zone.name} Zone</div>
          <div className="text-gray-400">{zone.description}</div>
        </div>
      )}
    </div>
  );
};

export default HeartRateDisplay;
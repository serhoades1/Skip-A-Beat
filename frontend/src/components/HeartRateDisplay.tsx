import React from 'react';
import { Heart } from 'lucide-react';

interface Props {
  heartRate: string;
}

const HeartRateDisplay: React.FC<Props> = ({ heartRate }) => {
  const getHeartAnimationDuration = (bpm: string) => {
    const numericBpm = parseInt(bpm);
    return numericBpm ? `${60 / numericBpm * 0.8}s` : '2s';
  };

  return (
    <div className="relative z-0 flex items-center justify-center mb-8 bg-black/20 rounded-xl p-8 backdrop-blur-sm">
      <div className="relative">
        <Heart 
          className="w-16 h-16 text-red-500 heart-pulse"
          style={{
            animation: `pulse ${getHeartAnimationDuration(heartRate)} cubic-bezier(0.4, 0, 0.6, 1) infinite`
          }}
        />
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}</style>
      </div>
      <span className="text-4xl ml-4 font-bold">{heartRate} BPM</span>
    </div>
  );
};

export default HeartRateDisplay;
import React, { useState } from 'react';
import { Activity } from 'lucide-react';

interface Props {
  onHeartRateChange: (rate: number) => void;
  isVisible: boolean;
}

const HeartRateSimulator: React.FC<Props> = ({ onHeartRateChange, isVisible }) => {
  const [rate, setRate] = useState(80);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseInt(event.target.value);
    setRate(newRate);
    onHeartRateChange(newRate);
  };

  const presetRates = [
    { label: 'Rest', value: 60 },
    { label: 'Walk', value: 90 },
    { label: 'Jog', value: 120 },
    { label: 'Run', value: 150 },
    { label: 'Sprint', value: 170 },
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="text-yellow-500" size={20} />
        <h3 className="text-sm font-semibold">Heart Rate Simulator</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="40"
            max="200"
            value={rate}
            onChange={handleChange}
            className="w-32 accent-yellow-500"
          />
          <span className="text-sm font-mono w-12">{rate}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {presetRates.map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setRate(preset.value);
                onHeartRateChange(preset.value);
              }}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeartRateSimulator;
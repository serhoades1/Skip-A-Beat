import React from 'react';
import { Watch, Bluetooth } from 'lucide-react';

interface Props {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const DeviceStatus: React.FC<Props> = ({ isConnected, onConnect, onDisconnect }) => {
  return (
    <div className="flex items-center justify-between mb-6 bg-white/5 rounded-lg p-4 relative z-10">
      <div className="flex items-center">
        <Watch className={`w-6 h-6 ${isConnected ? 'text-green-500' : 'text-gray-400'} mr-2`} />
        <span className="text-sm">
          {isConnected ? 'Heart Rate Monitor Connected' : 'No Device Connected'}
        </span>
      </div>
      <button
        onClick={isConnected ? onDisconnect : onConnect}
        className={`flex items-center px-4 py-2 ${
          isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        } rounded-lg transition-colors`}
      >
        <Bluetooth className="w-4 h-4 mr-2" />
        {isConnected ? 'Disconnect' : 'Connect Device'}
      </button>
    </div>
  );
};

export default DeviceStatus;
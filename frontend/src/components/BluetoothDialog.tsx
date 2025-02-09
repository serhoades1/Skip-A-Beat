import React from 'react';

interface Props {
  onCancel: () => void;
}

const BluetoothDialog: React.FC<Props> = ({ onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Connect Heart Rate Monitor</h3>
        <p className="mb-4">Please ensure your heart rate monitor is nearby and ready to pair.</p>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm text-gray-400 text-center">Searching for devices...</p>
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BluetoothDialog;
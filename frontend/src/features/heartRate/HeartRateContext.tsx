import React, { createContext, useContext, useState, useEffect } from 'react';
import { HeartRateData } from '../../types';
import { garminService } from '../../services/garmin';

interface HeartRateContextType {
  heartRate: HeartRateData | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const HeartRateContext = createContext<HeartRateContextType | null>(null);

export const HeartRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [heartRate, setHeartRate] = useState<HeartRateData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    garminService.onHeartRateChange((data) => {
      setHeartRate(data);
    });

    return () => {
      garminService.disconnect();
    };
  }, []);

  const connect = async () => {
    const success = await garminService.connect();
    setIsConnected(success);
  };

  const disconnect = () => {
    garminService.disconnect();
    setIsConnected(false);
  };

  return (
    <HeartRateContext.Provider
      value={{
        heartRate,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </HeartRateContext.Provider>
  );
};

export const useHeartRate = () => {
  const context = useContext(HeartRateContext);
  if (!context) {
    throw new Error('useHeartRate must be used within a HeartRateProvider');
  }
  return context;
};
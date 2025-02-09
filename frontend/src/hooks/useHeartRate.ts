import { useState, useEffect } from 'react';
import BluetoothService, { HeartRateData } from '../services/bluetooth';

export const useHeartRate = () => {
  const [heartRate, setHeartRate] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await BluetoothService.initialize();
      } catch (err) {
        setError('Failed to initialize Bluetooth');
      }
    };

    initialize();

    return () => {
      BluetoothService.disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      setError(null);
      await BluetoothService.connect();
      setIsConnected(true);

      BluetoothService.onHeartRateData((data: HeartRateData) => {
        setHeartRate(data.heartRate);
      });
    } catch (err) {
      setError('Failed to connect to heart rate monitor');
      setIsConnected(false);
    }
  };

  const disconnect = async () => {
    try {
      await BluetoothService.disconnect();
      setIsConnected(false);
      setHeartRate(0);
    } catch (err) {
      setError('Failed to disconnect from heart rate monitor');
    }
  };

  return {
    heartRate,
    isConnected,
    error,
    connect,
    disconnect
  };
};
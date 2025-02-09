import { HeartRateData } from '@/types';

class GarminService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private heartRateCallback: ((data: HeartRateData) => void) | null = null;

  async connect(): Promise<boolean> {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { namePrefix: 'Garmin' }
        ],
        optionalServices: ['heart_rate']
      });

      if (!this.device.gatt) {
        throw new Error('GATT server not found');
      }

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateChange);

      return true;
    } catch (error) {
      console.error('Error connecting to Bluetooth:', error);
      return false;
    }
  }

  private handleHeartRateChange = (event: Event): void => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;

    const heartRate = value.getUint8(1);
    const data: HeartRateData = {
      heartRate,
      timestamp: Date.now(),
    };

    if (this.heartRateCallback) {
      this.heartRateCallback(data);
    }
  };

  onHeartRateChange(callback: (data: HeartRateData) => void): void {
    this.heartRateCallback = callback;
  }

  disconnect(): void {
    if (this.server && this.server.connected) {
      this.server.disconnect();
    }
    this.device = null;
    this.server = null;
  }
}

export const garminService = new GarminService();
import { BleClient } from '@capacitor-community/bluetooth-le';

export interface HeartRateData {
  heartRate: number;
  timestamp: number;
}

class BluetoothService {
  private static instance: BluetoothService;
  private onDataCallback: ((data: HeartRateData) => void) | null = null;
  private isConnected = false;
  private device: any = null;

  private constructor() {}

  static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await BleClient.initialize();
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      throw new Error('Failed to initialize Bluetooth');
    }
  }

  async connect(): Promise<void> {
    try {
      console.log("Requesting Bluetooth device...");
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate']
      });

      console.log("Device selected:", device.name);
      this.device = device;
      
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateChange.bind(this));

      this.isConnected = true;
      console.log("Connected to heart rate monitor!");
    } catch (error) {
      console.error('Connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private handleHeartRateChange(event: any): void {
    const value = event.target.value;
    const heartRate = value.getUint8(1);
    
    if (this.onDataCallback) {
      this.onDataCallback({
        heartRate,
        timestamp: Date.now()
      });
    }
  }

  onHeartRateData(callback: (data: HeartRateData) => void): void {
    this.onDataCallback = callback;
  }

  async disconnect(): Promise<void> {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.onDataCallback = null;
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }
}

export default BluetoothService.getInstance();
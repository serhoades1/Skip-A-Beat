class HeartRateService {
  private device: BluetoothDevice | null = null;
  private onHeartRateChange: ((heartRate: number) => void) | null = null;

  async connect(onHeartRateChange: (heartRate: number) => void): Promise<boolean> {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth is not supported in your browser');
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      this.device = device;
      this.onHeartRateChange = onHeartRateChange;

      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');

      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateChange);

      return true;
    } catch (error) {
      if ((error as Error).name === 'NotFoundError') {
        return false;
      }
      throw error;
    }
  }

  private handleHeartRateChange = (event: Event): void => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value || !this.onHeartRateChange) return;

    const heartRate = value.getUint8(1);
    this.onHeartRateChange(heartRate);
  };

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      await this.device.gatt.disconnect();
    }
    this.device = null;
    this.onHeartRateChange = null;
  }

  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }
}

export default new HeartRateService();
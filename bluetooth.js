// Connect to the Garmin HR sensor via Bluetooth
navigator.bluetooth.requestDevice({
    filters: [{ services: ['heart_rate'] }],
    optionalServices: ['battery_service']
  })
  .then(device => {
    // Connect to the device
    return device.gatt.connect();
  })
  .then(server => {
    // Get the heart rate service
    return server.getPrimaryService('heart_rate');
  })
  .then(service => {
    // Get the heart rate measurement characteristic
    return service.getCharacteristic('heart_rate_measurement');
  })
  .then(characteristic => {
    // Start reading the heart rate data
    characteristic.startNotifications().then(() => {
      characteristic.addEventListener('characteristicvaluechanged', handleHRChange);
    });
  })
  .catch(error => { console.error('Error: ', error); });
  
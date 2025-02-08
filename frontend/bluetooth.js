export async function connectGarmin() {
    try {
        console.log("Requesting Bluetooth device...");
        
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['heart_rate']
        });

        console.log("Device selected:", device.name);
        
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('heart_rate');
        const characteristic = await service.getCharacteristic('heart_rate_measurement');

        characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleHRChange);

        console.log("Connected to Garmin!");
        return device; // Return device to confirm success
    } catch (error) {
        console.error("Error connecting to Bluetooth:", error);
        alert("Failed to connect. Make sure your Garmin is broadcasting HR.");
    }
}

function handleHRChange(event) {
    let value = event.target.value;
    let heartRate = value.getUint8(1); // Extract HR
    document.getElementById("heartRateDisplay").innerText = `Heart Rate: ${heartRate} bpm`;
    console.log("Heart Rate:", heartRate);
}

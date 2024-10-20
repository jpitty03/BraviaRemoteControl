const { Client } = require('node-ssdp');

function discoverSsdpDevices() {
    return new Promise((resolve, reject) => {
        const client = new Client();
        const devices = [];

        console.log('Starting SSDP discovery...');

        client.on('response', (headers, statusCode, rinfo) => {
            const deviceType = headers.ST || 'Unknown Device';
            const location = headers.LOCATION || 'Unknown Location';
            const ip = rinfo.address;

            // Filter for Sony Bravia specific services
            if (deviceType.includes('schemas-sony-com:service') || deviceType.includes('MediaRenderer')) {
                console.log(`Discovered Sony device: ${deviceType} at ${location}`);

                devices.push({
                    name: deviceType,
                    location,
                    ip
                });
            }
        });

        // Search for all devices and services
        client.search('ssdp:all');

        setTimeout(() => {
            if (devices.length > 0) {
                resolve(devices);
            } else {
                reject(new Error('No devices found'));
            }
        }, 10000);  // 10 seconds timeout
    });
}

module.exports = { discoverSsdpDevices };

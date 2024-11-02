const { Client } = require('node-ssdp');
const xml2js = require('xml2js');

async function discoverSsdpDevices() {
    const client = new Client();
    const devices = [];
    const seenIps = new Set();

    console.log('Starting SSDP discovery...');

    return new Promise((resolve, reject) => {
        client.on('response', (headers, statusCode, rinfo) => {
            const location = headers.LOCATION || 'Unknown Location';
            const ip = rinfo.address;

            if (!seenIps.has(ip) && location.includes('.xml')) {
                seenIps.add(ip);
                devices.push({ ip, location });
            }
        });

        client.search('ssdp:all');

        setTimeout(() => {
            console.log(devices)
            client.stop();
            if (devices.length > 0) {
                resolve(devices);
            } else {
                reject(new Error('No devices found'));
            }
        }, 10000); // 10 seconds timeout
    });
}

async function getFriendlyName(location) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(location);
        const text = await response.text();
        
        const result = await xml2js.parseStringPromise(text);
        const friendlyName = result.root.device[0].friendlyName[0];
        
        return friendlyName || 'Unknown Device';
    } catch (error) {
        console.error(`Failed to fetch or parse XML at ${location}:`, error);
        return 'Unknown Device';
    }
}

async function discoverDevicesWithFriendlyNames() {
    try {
        const devices = await discoverSsdpDevices();
        
        const devicesWithNames = await Promise.all(devices.map(async device => {
            const friendlyName = await getFriendlyName(device.location);
            return { ...device, friendlyName };
        }));
        
        console.log('Discovered devices:', devicesWithNames);
        return devicesWithNames;
    } catch (error) {
        console.error('Error discovering devices:', error);
    }
}

async function retryDiscoverDevices(attempts = 3, delay = 2000) {
    for (let i = 0; i < attempts; i++) {
        try {
            const devices = await discoverDevicesWithFriendlyNames();
            if (devices && devices.length > 0) {
                return devices; // Return if devices are found
            }
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
        }

        // Delay before the next attempt
        if (i < attempts - 1) {
            console.log(`Retrying device discovery... Attempts left: ${attempts - i - 1}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error('No devices found after multiple attempts');
}

module.exports = retryDiscoverDevices;
const { contextBridge } = require('electron');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const SSDP = require('node-ssdp').Client;
const ssdp = new SSDP();

// Function to send commands using XHR
function sendSonyCommand(tvIp, service, method, params, psk) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://${tvIp}/sony/${service}`);

        if (psk) {
            xhr.setRequestHeader('X-Auth-PSK', psk);
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(`Request failed with status ${xhr.status}`);
            }
        };

        xhr.onerror = () => reject('Network error');

        xhr.send(JSON.stringify({
            method: method,
            version: '1.0',
            id: 1,
            params: params ? [params] : []
        }));
    });
}

// Function to discover devices using SSDP
function discoverDevices() {
    return new Promise((resolve, reject) => {
        const devices = [];

        ssdp.on('response', function inResponse(headers, statusCode, rinfo) {
            if (headers.ST && headers.ST.includes('urn:schemas-upnp-org:device:MediaRenderer')) {
                devices.push({
                    ip: rinfo.address,
                    name: headers['CACHE-CONTROL'] || 'Unknown Device'
                });
            }
        });

        ssdp.search('urn:schemas-upnp-org:device:MediaRenderer:1');

        // Stop discovery after 10 seconds and return found devices
        setTimeout(() => {
            ssdp.stop();
            if (devices.length > 0) {
                resolve(devices);
            } else {
                reject('No devices found');
            }
        }, 10000);
    });
}

// Function to send XHR request to get supported API info
function getSupportedApiInfo(tvIp) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const apiUrl = `http://${tvIp}/sony/guide`;

        xhr.open('POST', apiUrl);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(`Request failed with status ${xhr.status}`);
            }
        };

        xhr.onerror = () => reject('Network error');

        xhr.send(JSON.stringify({
            method: 'getSupportedApiInfo',
            params: [{ services: [] }],  // Empty array or omit to get all services
            id: 1,
            version: '1.0'
        }));
    });
}

// Expose device discovery and command sending functions to the renderer process
contextBridge.exposeInMainWorld('api', {
    getSupportedApiInfo: (tvIp, psk) => getSupportedApiInfo(tvIp, psk),
    sendSonyCommand: (tvIp, service, method, params, psk) => sendSonyCommand(tvIp, service, method, params, psk),
    discoverDevices: () => discoverDevices()
});

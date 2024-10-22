const { contextBridge } = require('electron');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const SSDP = require('node-ssdp').Client;
const ssdp = new SSDP();

// Function to send commands using XHR
function sendCommand(tvIp, service, method, params, psk) {
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

// Controller Info Method (Basic Auth Command)
function basicAuthCommand(tvIp, service, psk, jsonStringified) {
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

        xhr.send(jsonStringified);
    });
}

// Function to send IRCC command via SOAP request
function sendIRCCCommand(tvIp, irccCode, psk) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://${tvIp}/sony/ircc`);

        // Set required headers
        xhr.setRequestHeader('Content-Type', 'text/xml; charset=UTF-8');
        xhr.setRequestHeader('SOAPACTION', '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"');
        if (psk) {
            xhr.setRequestHeader('X-Auth-PSK', psk);
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);  // Parse SOAP response if needed
            } else {
                reject(`Request failed with status ${xhr.status}`);
            }
        };

        xhr.onerror = () => reject('Network error');

        // SOAP envelope for IRCC command
        const soapEnvelope = `
            <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                <s:Body>
                    <u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1">
                        <IRCCCode>${irccCode}</IRCCCode>
                    </u:X_SendIRCC>
                </s:Body>
            </s:Envelope>
        `;

        xhr.send(soapEnvelope);
    });
}

// Expose device discovery and command sending functions to the renderer process
contextBridge.exposeInMainWorld('api', {
    sendIRCCCommand: (tvIp, irccCode, psk) => sendIRCCCommand(tvIp, irccCode, psk),
    basicAuthCommand: (tvIp, service, psk, jsonStringified) => basicAuthCommand(tvIp, service, psk, jsonStringified),
    getSupportedApiInfo: (tvIp, psk) => getSupportedApiInfo(tvIp, psk),
    sendCommand: (tvIp, service, method, params, psk) => sendSonyCommand(tvIp, service, method, params, psk),
    discoverDevices: () => discoverDevices()
});

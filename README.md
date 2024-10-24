# Sony Bravia Remote Control

A simple Electron-based remote control application to interact with Sony Bravia TVs over a local network using the ScalarWebAPI and IRCC commands. The app allows users to control TV functionalities like power, volume, channels, input, and media controls through an intuitive remote interface.

## Features

- **Device Discovery**: Automatically discover Sony Bravia TVs on the local network.
- **IRCC Commands**: Send Infrared-like remote control commands via Sony’s IRCC API.
- **Customizable Settings**: Save TV IP and PSK (Pre-Shared Key) for easy reconnection.
- **Remote Control UI**: Intuitive on-screen remote to control TV functions.
- **Toast Notifications**: Receive notifications for successful actions like saving settings.
- **Cross-platform**: Works on Windows, macOS, and Linux.

## Screenshots

![screenshot1](./assets/screenshot_1.png)

## Installation

1. **Clone the repository:**

   ```bash
   gh repo clone jpitty03/BraviaRemoteControl
   cd BraviaRemoteControl
   ```

2. **Install Dependencies:**

   Make sure you have [NodeJs](https://nodejs.org/) installed.
   ```bash
   npm install
   ```

3. **Run the app:**

   Make sure you have Node.js installed.
   ```bash
   npm start
   ```

## Usage

1. **Device Discovery:**  Click on Discover Devices to automatically find your Sony Bravia TV on the network.
1. **Set TV IP and PSK:**  Manually enter your TV’s IP address and PSK (Pre-Shared Key) if it is not automatically discovered.
2. **Save Settings:**  Save your TV IP and PSK for future use by clicking Save Settings. A toast notification will confirm successful saving.
2. **Control Your TV:**  Use the remote buttons to interact with your Sony Bravia TV. Commands like Power, Volume, Channel, and Input are supported.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

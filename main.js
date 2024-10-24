const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Path to settings file
const settingsFilePath = path.join(__dirname, './utils/settings.json');

function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 819,
        height: 840,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: false
        },
        autoHideMenuBar: true,
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Uncomment to automatically open dev tools
    // mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('did-finish-load', () => {
        const settings = loadSettings();
        mainWindow.webContents.send('load-settings', settings);
    });
}

// Load settings from file (or return default if no file exists)
function loadSettings() {
    try {
        if (fs.existsSync(settingsFilePath)) {
            const data = fs.readFileSync(settingsFilePath, 'utf-8');
            return JSON.parse(data);
        } else {
            return {}; // Return default (empty) settings if file doesn't exist
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
        return {}; // Return empty settings on error
    }
}

// Save settings to file
function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

// Listen for save-settings event
ipcMain.on('save-settings', (event, settings) => {
    saveSettings(settings);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

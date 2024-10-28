const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Path to settings file (use userData directory)
const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 475,
        height: 600,
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

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Load settings when the window is ready
    mainWindow.webContents.on('did-finish-load', () => {
        const settings = loadSettings();
        mainWindow.webContents.send('load-settings', settings);
    });
}

// Load settings from the file
function loadSettings() {
    try {
        if (fs.existsSync(settingsFilePath)) {
            const data = fs.readFileSync(settingsFilePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
    return {}; // Return an empty object if no settings file exists
}

// Save settings to the file
function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

// Handle saving settings from the renderer process
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
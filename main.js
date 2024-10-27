const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { autoUpdater } = require("electron-updater");
const log = require('electron-log');
const path = require('path');
const fs = require('fs');

// Path to settings file (use userData directory)
const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

// Logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
}
function createDefaultWindow() {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.webContents.openDevTools();
    win.on('closed', () => {
        win = null;
    });
    win.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);
    return win;
}
autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
});

let template = []
app.on('ready', function () {
    // Create the Menu
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    createWindow();
});
app.on('window-all-closed', () => {
    app.quit();
});

//-------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
//-------------------------------------------------------------------
app.on('ready', function()  {
    console.log('checking for updates')
    autoUpdater.checkForUpdatesAndNotify();
  });

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
        autoHideMenuBar: false,
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

// app.whenReady().then(createWindow);

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

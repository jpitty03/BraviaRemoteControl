const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 819,
        height: 840,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),  // Ensure the preload.js path is correct
            nodeIntegration: false,  // Disable node integration for security
            contextIsolation: true,  // Enable context isolation for security
            enableRemoteModule: false,  // Keep remote module disabled for security
            sandbox: false
        },
        autoHideMenuBar: true,
    });

    // Load the HTML file into the browser window
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

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

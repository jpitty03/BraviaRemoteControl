const fs = require('fs');
const path = require('path');

// Define the path to the settings file
const settingsFilePath = path.join(__dirname, 'settings.json');

// Function to load settings from the file
function loadSettings() {
    try {
        if (fs.existsSync(settingsFilePath)) {
            const data = fs.readFileSync(settingsFilePath, 'utf-8');
            return JSON.parse(data);
        } else {
            return {};  // Return empty object if settings file doesn't exist
        }
    } catch (err) {
        console.error('Error loading settings:', err);
        return {};
    }
}

// Function to save settings to the file
function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    } catch (err) {
        console.error('Error saving settings:', err);
    }
}

module.exports = {
    loadSettings,
    saveSettings
};

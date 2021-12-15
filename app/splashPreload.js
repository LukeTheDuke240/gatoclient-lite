const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { shell } = require('electron');
const os = require('os');
const { app, ipcMain, BrowserWindow, screen } = electron;

// Splash stuff
document.addEventListener("DOMContentLoaded", (event) => {
    // Request Info
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('splashNeedInfo');
})

// When Version Info Recieved
const { ipcRenderer } = require('electron');
ipcRenderer.on('splashInfo', (event, preferences) => {
    document.getElementById('version').textContent = "V" + preferences;
    document.getElementById('details').textContent = "Loading...";
});
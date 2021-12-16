const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { app, ipcMain, BrowserWindow, protocol, dialog } = electron;
require('v8-compile-cache');

// Gato/creepycats - Gatoclient
// Mixaz - IDKR source code (used so many fucking times)
// ando - Billboards, modding, etc
// Giant - JANREX client
// LukeTheDuke - Gatoclient-lite

var swapperFolder = path.join(app.getPath("documents"), "GatoclientLite/swapper");

if (!fs.existsSync(swapperFolder)) {
    fs.mkdirSync(swapperFolder, { recursive: true });
};

// Before we can read the settings, we need to make sure they exist, if they don't, then we create a template
if (!fs.existsSync(path.join(app.getPath("documents"), "GatoclientLite/settings.json"))) {
    fs.writeFileSync(path.join(app.getPath("documents"), "GatoclientLite/settings.json"), '{ "fpsUncap":true, "removeUselessFeatures":false, "inProcessGPU":false, "disableAccelerated2D":false, "fullscreen":false, "resourceSwapper":true, "skyColor":false, "skyColorValue":"#ff0000", "angle-backend":"default" }', { flag: 'wx' }, function (err) {
        if (err) throw err;
        console.log("It's saved!");
    });
}

// Read settings to apply them to the command line arguments
let filePath = path.join(app.getPath("documents"), "GatoclientLite/settings.json");
let userPrefs = JSON.parse(fs.readFileSync(filePath));

// Fullscreen Handler
var mainWindowIsFullscreen = false;

// Give App Version to window
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

// Logging thing
ipcMain.on('logMainConsole', (event, data) => {
    console.log(data);
});

// Save settings when sent to main process
let inputs;
ipcMain.on('savedSettings', (event, preferences) => {
    inputs = preferences;
    console.log(inputs);
    console.log('Saved settings to json...');
    var settingsPath = path.join(app.getPath("documents"), "GatoclientLite/settings.json");
    fs.writeFileSync(settingsPath, JSON.stringify(inputs));
});
ipcMain.on('preloadNeedSettings', (event) => {
    mainWindow.webContents.send('preloadSettings', path.join(app.getPath("documents"), "GatoclientLite/settings.json"), app.getVersion(), __dirname);
});
ipcMain.on('settingsNeedSettings', (event) => {
    mainWindow.webContents.send('settingsSettings', path.join(app.getPath("documents"), "GatoclientLite/settings.json"));
});
ipcMain.on('splashNeedInfo', (event) => {
    splashWindow.webContents.send('splashInfo', app.getVersion());
});

/*app.commandLine.appendSwitch("enable-accelerated-2d-canvas");
app.commandLine.appendSwitch("enable-features=useskiarenderer");
app.commandLine.appendSwitch("disable-oop-rasterization");
app.commandLine.appendSwitch("enable-gpu-rasterization");*/

if (userPrefs['removeUselessFeatures'] == true) {
    app.commandLine.appendSwitch("disable-breakpad"); //crash reporting
    app.commandLine.appendSwitch("disable-print-preview");
    app.commandLine.appendSwitch("enable-javascript-harmony");
    app.commandLine.appendSwitch("enable-future-v8-vm-features");
    app.commandLine.appendSwitch("enable-webgl2-compute-context");
    app.commandLine.appendSwitch("renderer-process-limit", 100);
    app.commandLine.appendSwitch("max-active-webgl-contexts", 100);
    app.commandLine.appendSwitch("ignore-gpu-blacklist");
    app.commandLine.appendSwitch("disable-2d-canvas-clip-aa");
    app.commandLine.appendSwitch("disable-bundled-ppapi-flash");
    app.commandLine.appendSwitch("disable-logging");
    app.commandLine.appendSwitch("disable-web-security");
    app.commandLine.appendSwitch("webrtc-max-cpu-consumption-percentage=100");
    console.log('Enabled Experiments');
}
if (userPrefs['fpsUncap'] == true) {
    app.commandLine.appendSwitch('disable-frame-rate-limit');
    app.commandLine.appendSwitch('disable-gpu-vsync');
    console.log('Removed FPS Cap');
}
if (userPrefs['angle-backend'] != 'default') {
    if (userPrefs['angle-backend'] == 'vulkan') {
        app.commandLine.appendSwitch("use-angle", "vulkan");
        app.commandLine.appendSwitch("use-vulkan");
        app.commandLine.appendSwitch("--enable-features=Vulkan");

        console.log("VULKAN INITIALIZED")
    }
    else {
        app.commandLine.appendSwitch("use-angle", userPrefs['angle-backend']);

        console.log('Using Angle: ' + userPrefs['angle-backend']);
    }
    
}
if (userPrefs['inProcessGPU'] == true) {
    app.commandLine.appendSwitch("in-process-gpu");
    console.log('In Process GPU is active');
}
/*if (userPrefs['zeroCopy'] == true) {
    app.commandLine.appendSwitch('enable-zero-copy');
    console.log('Removed FPS Cap');
}*/

// Workaround for Electron 8.x
if (userPrefs['resourceSwapper'] == true) {
    protocol.registerSchemesAsPrivileged([{
        scheme: "gato-swap",
        privileges: {
            secure: true,
            corsEnabled: true
        }
    }]);
}

//Listen for app to get ready
app.on('ready', function () {

    if (userPrefs['resourceSwapper'] == true) {
        protocol.registerFileProtocol("gato-swap", (request, callback) => callback(decodeURI(request.url.replace(/^gato-swap:/, ""))));
    }

    app.setAppUserModelId(process.execPath);

    splashWindow = new BrowserWindow({
        autoHideMenuBar: true,
        frame: false,
        skipTaskbar: true,
        show: false,
        width: 512,
        height: 256,
        alwaysOnTop: true,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, 'splashPreload.js'),
            nodeIntegration: true
        }
    });

    splashWindow.once('ready-to-show', () => {

        console.log("GPU INFO BEGIN")
        app.getGPUInfo('complete').then(completeObj => {
                console.dir(completeObj);
        });
        
        
        console.log("GPU FEATURES BEGIN")
        console.dir(app.getGPUFeatureStatus());

        splashWindow.removeMenu();
        splashWindow.show();
        launchGame();
    });

    splashWindow.loadFile(path.join(__dirname, 'splash/splash.html'))
 
    mainWindow = new BrowserWindow({
        show: false,
        width: 1600,
        height: 900,
        center: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    socialWindow = new BrowserWindow({
        autoHideMenuBar: true,
        show: false,
        width: 1600,
        height: 900,
        center: true
    });
    socialWindow.removeMenu();

    // Splash Screen Shit
    function launchGame() {
        if (userPrefs['fullscreen'] == true) {
            mainWindow.setFullScreen(true);
            mainWindowIsFullscreen = true;
        }

        mainWindow.removeMenu();
        mainWindow.loadURL('https://krunker.io');
        mainWindow.once('ready-to-show', () => {
            splashWindow.destroy();
            mainWindow.show();
        });
    }

    // Add Shortcuts
    mainWindow.webContents.on('before-input-event', (event, input) => {
        // Developer Console
        if (input.control && input.key.toLowerCase() === 'i') {
            mainWindow.webContents.openDevTools();
            event.preventDefault();
        }

        // F5 to Reload Lobby
        if (input.key === "F5") {
            mainWindow.reload();
            event.preventDefault();
        }

        // F6 to Find New Lobby
        if (input.key === "F6") {
            mainWindow.loadURL('https://krunker.io');
            event.preventDefault();
        }

        // F11 to Fullscreen
        if (input.key === "F11") {
            mainWindow.setFullScreen(!mainWindowIsFullscreen);
            mainWindowIsFullscreen = !mainWindowIsFullscreen;
            event.preventDefault();
        }

        //f12 to hard reset
        if (input.key === "F12") {
            app.relaunch();
            app.exit();
        }
    })


    // Resource Swapper
    if (userPrefs['resourceSwapper'] == true) {
        let Swapper = require("./resourceswapper");

        let swapper = new Swapper(
            mainWindow,
			/** @type {string} */("normal"),
			/** @type {string} */(path.join(app.getPath("documents"), "GatoclientLite/swapper"))
        );
        swapper.init();
    }

    // Handle opening social/editor page
    mainWindow.webContents.on("new-window", (event, url) => {
        // I hope this fixes the bug with the shitty Amazon Ad
        event.preventDefault();
        if (url.includes('https://krunker.io/social.html')) {
            socialWindow.loadURL(url);
            socialWindow.show();
        }
        else {
            require('electron').shell.openExternal(url);
        }
    });

    // Handle Social Page Switching

    socialWindow.webContents.on("new-window", (event, url) => {
       event.preventDefault();
       urlToOpen = url;
       if (url.includes('https://krunker.io/social.html')) {
            socialWindow.loadURL(urlToOpen);
       }
    });

    socialWindow.on("close", (event) => {
       event.preventDefault();
       console.log("SOCIAL CLOSED")
       socialWindow.loadURL("about:blank");
       socialWindow.hide();
    });
    

    mainWindow.on('close', function () { //nice memory leak lmao
        app.exit();
    });
});

app.on('window-all-closed', () => {
  app.exit();
})
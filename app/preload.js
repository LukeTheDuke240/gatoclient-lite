const fs = require('fs');
const { ipcRenderer } = require('electron');
require('v8-compile-cache');
// Preload things

// get rid of client unsupported message
window.OffCliV = true;

var elements = {};

const settingsMenuHTML = '<style>@font-face{font-family:Bai;src:url(https://creepycats.github.io/api/gatoclient/fonts/BaiJamjuree-Light.ttf);font-weight:400}.backgroundSettings *{font-family:Bai;color:#fff;font-size:25px}.backgroundSettings{background-image:url(https://cdn.discordapp.com/attachments/901905234861883432/910340407949398046/background.jpg);background-size:cover}.titleHolder{font-size:50px;padding:30px;text-align:center}h3{font-size:46px!important;margin:0}p{margin-top:2px;margin-bottom:2px;padding:10px 30px 10px 30px}p:nth-child(even){background-color:rgba(92,92,92,.4)}.backgroundSettings input[type=checkbox].switch_1{height:25px;width:25px;margin:0;margin-top:4px;cursor:pointer;float:right}.backgroundSettings .form__input{float:right}.backgroundSettings .select-dropdown{float:right}.gatoSettingsDropdown,.gatoSettingsDropdown *{color:#000!important}</style><div class=backgroundSettings><div class=titleHolder><h3 class=title>Gatoclient-Lite Settings</h3></div><div class=container><div id=content><form action=""id=gatoclientsettings><div><p><span>Uncap FPS</span><label for=fpsUncap></label><span><input class=switch_1 name=fpsUncap type=checkbox value=true id=fpsUncap></span><p><span>ANGLE Backend</span><label for=angle-backend></label><span class=select-dropdown><select class=gatoSettingsDropdown id=angle-backend name=angle-backend><option value=default>Default<option value=gl>OpenGL<option value=d3d11>D3D11<option value=d3d9>D3D9<option value=d3d11on12>D3D11 on 12<option value=vulkan>Vulkan</select></span><p><span>Remove Chromium Features (Unstable)</span><label for=removeUselessFeatures></label><span><input class=switch_1 name=removeUselessFeatures type=checkbox value=false id=removeUselessFeatures></span><p><span>In Process GPU</span><label for=inProcessGPU></label><span><input class=switch_1 name=inProcessGPU type=checkbox value=false id=inProcessGPU></span><p><span>Disable Accelerated 2D Canvas</span><label for=disableAccelerated2D></label><span><input class=switch_1 name=disableAccelerated2D type=checkbox value=false id=disableAccelerated2D></span><p><span>Automatic Fullscreen</span><label for=fullscreen></label><span><input class=switch_1 name=fullscreen type=checkbox value=false id=fullscreen></span><p><span>Resource Swapper</span><label for=resourceSwapper></label><span><input class=switch_1 name=resourceSwapper type=checkbox value=false id=resourceSwapper></span><p><span>Custom Sky Color</span><label for=skyColor></label><span><input class=switch_1 name=skyColor type=checkbox value=false id=skyColor></span><p><span>Sky Color</span><label for=skyColorValue></label><span><input class="color form__input"name=skyColorValue type=color value=#78ddff placeholder=#000000></span></div></form></div></div></div>';

const settingsHeader = '<div class="settingTab " onmouseenter="playTick()" onclick="SOUND.play(&quot;select_0&quot;,0.1);window.windows[0].changeTab(0)">General</div> <div class="settingTab " onmouseenter="playTick()" onclick="SOUND.play(&quot;select_0&quot;,0.1);window.windows[0].changeTab(1)">Controls</div> <div class="settingTab " onmouseenter="playTick()" onclick="SOUND.play(&quot;select_0&quot;,0.1);window.windows[0].changeTab(2)">Display</div> <div class="settingTab " onmouseenter="playTick()" onclick="SOUND.play(&quot;select_0&quot;,0.1);window.windows[0].changeTab(3)">Render</div> <div class="settingTab " onmouseenter="playTick()" onclick="SOUND.play(&quot;select_0&quot;,0.1);window.windows[0].changeTab(4)">Game</div> <div class="settingTab " onmouseenter="playTick()" onclick="SOUND.play(&quot;select_0&quot;,0.1);window.windows[0].changeTab(5)">Sound</div> <div class="settingTab " onmouseenter="playTick()" onclick="SOUND.play(&quot;select_0&quot;,0.1)">Gato</div>'


// Lets us exit the game lmao
document.addEventListener("keydown", (event) => {
    if (event.code == "Escape") {
        document.exitPointerLock();
    }
})

// Settings Stuff
document.addEventListener("DOMContentLoaded", (event) => {

    ipcRenderer.send('preloadNeedSettings');

    // Swap
    ipcRenderer.send("swapFiles");

    const settingsButtons = document.querySelectorAll('[onclick*="showWindow(1)"]'); //get every settings button kek

    // Side Menu Settings Thing
    const settingsSideMenu = document.querySelectorAll('.menuItem')[6];
    settingsSideMenu.setAttribute("onclick", "showWindow(1);SOUND.play(`select_0`,0.15);window.windows[0].changeTab(0)");
    settingsSideMenu.addEventListener("click", (event) => {
        UpdateSettingsTabs(0);
    });
})

function UpdateSettingsTabs(activeTab) {
    // Settings Menu

    document.getElementById('settingsTabLayout').innerHTML = settingsHeader;
    

    const settingsTab = document.getElementById('settingsTabLayout').children[6];
    document.getElementById('menuWindow').setAttribute("style", "overflow-y: auto; width: 1200px;");

    settingsTab.addEventListener("click", (event) => {
        document.getElementById('settHolder').innerHTML = settingsMenuHTML;
        ipcRenderer.send('settingsNeedSettings');
        var form = document.getElementById("gatoclientsettings");

        form.addEventListener("change", function () {
            // Save Preferences/Settings
            var _inputs = document.getElementsByTagName('input');
            var _dropdowns = document.getElementsByTagName('select');
            var _preferences = {};
            for (var i = 0; i < _inputs.length; i++) {
                if (_inputs[i].className == 'switch_1' || _inputs[i].className == 'form__input' || _inputs[i].className == 'color' || _inputs[i].className == 'color form__input') {
                    if (_inputs[i].type == 'checkbox') {
                        _preferences[_inputs[i].name] = _inputs[i].checked;
                    }
                    else {
                        _preferences[_inputs[i].name] = _inputs[i].value;
                    }
                }
            };
            for (var i = 0; i < _dropdowns.length; i++) {
                if (_dropdowns[i].className == 'gatoSettingsDropdown') {
                    _preferences[_dropdowns[i].name] = _dropdowns[i].value;
                }
            };
            // Send data to be stored
            ipcRenderer.send('savedSettings', _preferences);
        });

        UpdateSettingsTabs(6);
    });

    const settingTabArray = document.getElementById('settingsTabLayout').children;
    for (let i = 0; i < settingTabArray.length; i++) {
        if (settingTabArray[i] != settingsTab) {
            settingTabArray[i].addEventListener("click", (event) => {
                UpdateSettingsTabs(i);
            });
        }
        if (i == activeTab) {
            settingTabArray[i].setAttribute('class', 'settingTab tabANew');
        }
    }
}

ipcRenderer.on('settingsSettings', (event, preferences) => {
    // I do a sneaky and use the event to store the file path
    let filePath = preferences;
    let userPrefs = JSON.parse(fs.readFileSync(filePath));

    // Load the settings into the form
    for (let pref in userPrefs) {
        if (!!document.querySelector(`select[name="${pref}"]`)) {
            document.querySelector(`select[name="${pref}"]`).value = userPrefs[pref];
        }
        else {
            if (document.querySelector(`input[name="${pref}"]`).type == 'checkbox') {
                document.querySelector(`input[name="${pref}"]`).checked = userPrefs[pref];
            }
            else {
                document.querySelector(`input[name="${pref}"]`).value = userPrefs[pref];
            }
        }
    }
});

ipcRenderer.on('preloadSettings', (event, preferences, version, filedir) => {
    let filePath = preferences;
    let userPrefs = JSON.parse(fs.readFileSync(filePath));

    // Sky color script: Thank you Janrex
    if (userPrefs['skyColor'] == true) {
        Reflect.defineProperty(Object.prototype, "skyCol", {
            value: userPrefs['skyColorValue'],
        });
    }
});

const electron = require('electron');
const url = require('url');
const path = require('path');
const {ipcMain} = require('electron')

const {app, BrowserWindow, Menu, globalShortcut} = electron;

let mainWindow;
let isInFullscreen = false;
let playAndPause;
let previousAudio;
let nextAudio;

// This tells the app that it's in a production enviroment
process.env.NODE_ENV = 'production';

// This runs once the app is ready
app.on('ready', function() {
    //create new window
    mainWindow = new BrowserWindow({width: 1100, height: 800, frame: false, fullscreenable: true});
    
    //load the html file into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    
    // This functions builds the menu template below
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    // This inserts that menu into the app so that we can use the shortcuts
    Menu.setApplicationMenu(mainMenu);
    
    // For debugging the main window (but not the webview inside it)
    // mainWindow.openDevTools();   
    
    registerMediaKeys();
});

ipcMain.on('start-pressed', () => {
    // console.log('Start Pressed');
    fullscreenMainWindow();
})

ipcMain.on('exit-icon-pressed', () => {
    app.quit();
    globalShortcut.unregisterAll();
})

app.on('browser-window-blur', () => {
    // console.log('You are not on the app anymore');
    mainWindow.webContents.executeJavaScript('windowNotFocused()');
})

app.on('browser-window-focus', () => {
    // console.log('You are on the app now');
    mainWindow.webContents.executeJavaScript('windowIsFocused()');
})

function fullscreenMainWindow() {
    // Toggle Fullscreen when F and either Command/Control is pressed.
    if (isInFullscreen) {
        mainWindow.unmaximize();
        isInFullscreen = false;
    } else {
        mainWindow.maximize();
        isInFullscreen = true;
    }
}

function registerMediaKeys() {
    playAndPause = globalShortcut.register('MediaPlayPause', () => {
        // console.log('pause/play button pressed is pressed');

        mainWindow.webContents.executeJavaScript('toggleAudio()');
    })
    previousAudio = globalShortcut.register('MediaPreviousTrack', () => {
        // console.log('Previous media button pressed is pressed');

        mainWindow.webContents.executeJavaScript('audioSkipBack()');
    })
    nextAudio = globalShortcut.register('MediaNextTrack', () => {
        // console.log('Next media button pressed is pressed');

        mainWindow.webContents.executeJavaScript('audioSkipForward()');
    })
}

// This is how you create a new menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Control+W',
                click(){
                    app.quit();
                    globalShortcut.unregisterAll();
                }
            },
            {
                label: 'Fullscreen Mode',
                accelerator: 'CmdOrCtrl+F',
                click(){ fullscreenMainWindow(); }
            }
        ]
    }
]
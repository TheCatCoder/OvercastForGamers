const {ipcRenderer} = require('electron')

var index = 0;
var gamepadController;
var gamepadCheckInterval;
var episodecellCount;
let gamepadID = 0;
var gamepadDetected = false;
var windowIsFocused = true;

// These variables help detect if a button was pressed and is just being held
let aButtonPressed = false;
let bButtonPressed = false;
let xButtonPressed = false;
let yButtonPressed = false;
let lbButtonPressed = false;
let rbButtonPressed = false;
let ltButtonPressed = false;
let rtButtonPressed = false;
let selectButtonPressed = false;
let startButtonPressed = false;
let dpadUpButtonPressed = false;
let dpadDownButtonPressed = false;

function scrollWindowUp(indexCount){
      //console.log("Scroll up ran");
      
      document.getElementsByClassName('episodecell')[indexCount].scrollIntoView({behavior: "auto", block: "center"});
};

function scrollWindowDown(indexCount){
      if (indexCount > 4) {
            //console.log("Scroll down ran");
            
            document.getElementsByClassName('episodecell')[indexCount].scrollIntoView({behavior: "auto", block: "center"});
      }
};

// I put most of the functions below as part of this JS object because they are allowed to use the scripts that overcast uses (eg jQuery)
__Controller = {
      // This adds the CSS rules that make the dark mode you see in the app
      injectDarkModeCSS: function() {
            //console.log('Dark mode styles were injected');
            const overcastCss = document.styleSheets[0];
            overcastCss.insertRule('body.darkMode { background-color: #312C2F !important; }', 0);
            overcastCss.insertRule('h2.ocseparatorbar.darkMode, div.caption2.darkMode, div.title.darkMode, div#episode_body.darkMode { color: #11A29D !important; }', 0);
            overcastCss.insertRule('a#playpausebutton.darkMode, a#seekbackbutton.darkMode, a#seekforwardbutton.darkMode, span#speedlabel.darkMode, a.darkMode, div.nav.darkMode { color: #11A29D !important; }', 0);
            overcastCss.insertRule('#progressslider.darkMode::-webkit-slider-thumb { background: #11A29D !important; }', 0);
            overcastCss.insertRule('#progresssliderbackground.darkMode::-webkit-progress-value { background-color: #00C2BB !important; }', 0);
            overcastCss.insertRule('#progresssliderbackground.darkMode { border: 1px solid #11A29D !important; }', 0);
            overcastCss.insertRule('.progresssliderloadedrange.darkMode { background-color: #11A29D !important; }', 0);
            overcastCss.insertRule('#speedcontrol.darkMode::-webkit-slider-runnable-track { background-color: #78CDD1 !important; }', 0);
            overcastCss.insertRule('#speedcontrol.darkMode::-webkit-slider-thumb { background: #11A29D !important; }', 0);
            overcastCss.insertRule('a#delete_episode_button.darkMode { color: #31C0CD !important; border: 1px solid #11A29D !important; }', 0);
            overcastCss.insertRule('.ocborderedbutton:active.darkMode, .ocsegmentedbuttonselected.darkMode { background-color: teal !important;}', 0);
            overcastCss.insertRule('.art.darkMode { border: 1px solid #11A29D !important }', 0);

            // These deal with the css for the login page
            overcastCss.insertRule('a.left.navlink.darkMode { color: #11A29D !important }', 0);
            overcastCss.insertRule('h2.darkMode { color: #11A29D !important }', 0);
            overcastCss.insertRule('.pure-form label.darkMode { color: #11A29D !important }', 0);
            overcastCss.insertRule('.ocbutton, .ocborderedbutton, .ocsegmentedbutton.darkMode { color: #11A29D !important }', 0);
            overcastCss.insertRule('button.ocborderedbutton.darkMode { border: 1px solid #11A29D !important; color: #11A29D !important }', 0);
            overcastCss.insertRule('.footer a.darkMode { color: #11A29D !important }', 0);

            
            // This deals with the color scheme of the scrollbar
            overcastCss.insertRule('.darkMode::-webkit-scrollbar { background-color: #312C2F !important; width: 1em !important; }', 0);
            overcastCss.insertRule('.darkMode::-webkit-scrollbar-thumb:window-inactive, .darkMode::-webkit-scrollbar-thumb { background:  #3a3437 !important; }', 0);
      },
      // These 2 functions are created here and then called in index.html
      // The turnDarkModeOff function isn't currently used, but I put it in there, 
      // in case I wanted to add a way to toggle dark mode in the future
      turnDarkModeOn: function() {
            //console.log('The dark mode classes were added');
            $('*').addClass("darkMode");
      },
      turnDarkModeOff: function() {
            //console.log('The darkMode classes were removed');
            $('*').removeClass("darkMode");
      },
      
      tellGamePadDetectionThatWindowisFocused: function() {
            windowIsFocused = true;
      },
      
      tellGamePadDetectionThatWindowisNotFocused: function() {
            windowIsFocused = false;
      },
      
      isThisThePodcastListPage: function() { 
            
            if ($(".episodecell").length) {
                  //console.log("We are in the podcast list page"); 
                  
                  // Starts off the selection border on the first podcast at the top of the page
                  $(".episodecell:eq(0)").css({"border": ".5em solid #11A29D" })
                  
                  // This scrolls the top of the window to whatever position the first podcast is at
                  document.getElementsByClassName('episodecell')[0].scrollIntoView({behavior: "auto", block: "start"});
                  return true;                          
            } else {
                  //console.log("We are in the podcast player page now");
                  return false;                          
            }
      }, // END isThisThePodcastListPage
      
      toggleAudioPlay: function() {
            if (document.getElementById('audioplayer')) {
                  let player = document.getElementById('audioplayer');
                  
                  // This ternary operater toggles the audio play state
                  player.paused ? player.play() : player.pause();
            }
      },
      
      audioGoBack: function() {
            if (document.getElementById('audioplayer')) {
                  let player = document.getElementById('audioplayer');
                  let seekBackButton = document.getElementById('seekbackbutton');
                  
                  player.currentTime -= parseInt(seekBackButton.getAttribute('data-seek-back-interval'));
            }
      },
      
      audioSkipAhead: function() {
            if (document.getElementById('audioplayer')) {
                  let player = document.getElementById('audioplayer');
                  let seekForwardButton = document.getElementById('seekforwardbutton');
                  
                  player.currentTime += parseInt(seekForwardButton.getAttribute('data-seek-forward-interval'));
            }
      },
      
      audioGoBackSmallAmount: function() {
            if (document.getElementById('audioplayer')) {
                  let player = document.getElementById('audioplayer');
                  let seekBackButton = document.getElementById('seekbackbutton');
                  
                  player.currentTime -= 5;
            }
      },
      
      audioSkipAheadSmallAmount: function() {
            if (document.getElementById('audioplayer')) {
                  let player = document.getElementById('audioplayer');
                  let seekForwardButton = document.getElementById('seekforwardbutton');
                  
                  player.currentTime += 5;
            }
      },
      
      // This is for all the gamepad input detection + gamepad button mapping
      checkGamepadInput: function() {
            
            if (windowIsFocused) {
                  
                  gamepadController = navigator.getGamepads()[gamepadID];
                  
                  // This series of if statments checks if a button that was being pressed before is now released
                  if (gamepadController.buttons[0].pressed == false) {
                        aButtonPressed = false;
                  }
                  if (gamepadController.buttons[1].pressed == false) {
                        bButtonPressed = false;
                  }
                  if (gamepadController.buttons[2].pressed == false) {
                        xButtonPressed = false;
                  }
                  if (gamepadController.buttons[3].pressed == false) {
                        yButtonPressed = false;
                  }
                  if (gamepadController.buttons[4].pressed == false) {
                        lbButtonPressed = false;
                  }
                  if (gamepadController.buttons[5].pressed == false) {
                        rbButtonPressed = false;
                  }
                  if (gamepadController.buttons[12].pressed == false) {
                        dpadUpButtonPressed = false;
                  }
                  if (gamepadController.buttons[13].pressed == false) {
                        dpadDownButtonPressed = false;
                  }
                  if (gamepadController.buttons[8].pressed == false) {
                        selectButtonPressed = false;
                  }
                  if (gamepadController.buttons[9].pressed == false) {
                        startButtonPressed = false;
                  }
                  if (gamepadController.buttons[6].pressed == false) {
                        ltButtonPressed = false;
                  }
                  if (gamepadController.buttons[7].pressed == false) {
                        rtButtonPressed = false;
                  }
                  
                  if ($(".episodecell").length) {                  
                        
                        if (gamepadController.axes[1] < -0.95 && index != 0) { // to navigate up in the episode cells
                              //console.log( "Up joystick pressed." );
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index -= 1;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowUp(index);
                        }
                        
                        if (gamepadController.axes[1] > 0.95 && index < episodecellCount) { // to navigate down in the episode cells
                              //console.log( "Down joystick pressed" );
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index += 1;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowDown(index);
                        }
                        
                        // These are the d-pad button detectors
                        if (gamepadController.buttons[12].pressed && index != 0 && dpadUpButtonPressed == false) { // to navigate up in the episode cells
                              //console.log( "Up Dpad pressed." );
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index -= 1;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowUp(index);
                              dpadUpButtonPressed = true;
                        }
                        
                        if (gamepadController.buttons[13].pressed == true && index < episodecellCount && dpadDownButtonPressed == false) { // to navigate down in the episode cells
                              //console.log( "Down Dpad pressed" );
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index += 1;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowDown(index);
                              dpadDownButtonPressed = true;
                        }     
                        
                        if (gamepadController.buttons[0].pressed == true && aButtonPressed == false) {
                              //console.log( "A Button Pressed on element " + index );
                              $(".titlestack:eq(" + index + ")").click();
                              aButtonPressed = true;
                        }
                        
                        if (gamepadController.buttons[4].pressed == true && lbButtonPressed == false) {
                              //console.log( "LB Button was pressed, going to top" );
                              
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index = 0;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowUp(index);
                              
                              lbButtonPressed = true;
                        }
                        
                        if (gamepadController.buttons[5].pressed == true && rbButtonPressed == false) {
                              //console.log( "RB Button was pressed, going to bottom" );
                              
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index = episodecellCount;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowDown(index);
                              
                              rbButtonPressed = true;
                        }
                        
                        if (gamepadController.buttons[6].pressed == true && ltButtonPressed == false) {
                              //console.log( "Left trigger is being pressed, going up 5" );
                              
                              if (index - 5 > 0) {
                                    $(".episodecell:eq(" + index + ")").css({"border": "none" })
                                    index -= 5;
                                    $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                                    scrollWindowUp(index);
                              } else {
                                    $(".episodecell:eq(" + index + ")").css({"border": "none" })
                                    index = 0;
                                    $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                                    scrollWindowUp(index);
                              }
                              
                              ltButtonPressed = true;
                        }
                        
                        if (gamepadController.buttons[7].pressed == true && rtButtonPressed == false) {
                              //console.log( "Right trigger is being pressed, Going down 5" );
                              
                              if (index + 5 < episodecellCount) {
                                    $(".episodecell:eq(" + index + ")").css({"border": "none" })
                                    index += 5;
                                    $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                                    scrollWindowDown(index);
                              } else {
                                    $(".episodecell:eq(" + index + ")").css({"border": "none" })
                                    index = episodecellCount;
                                    $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                                    scrollWindowDown(index);
                              }
                              
                              rtButtonPressed = true;
                        }
                        
                  } else { // This only applies to the podcast player page
                        if (gamepadController.buttons[0].pressed == true && aButtonPressed == false) {
                              //console.log( "A Button was pressed, audio should be toggled" );
                              
                              __Controller.toggleAudioPlay();
                              aButtonPressed = true;
                        }
                        if (gamepadController.buttons[2].pressed == true && xButtonPressed == false) {
                              //console.log( "X Button was pressed, audio going back" );
                              
                              __Controller.audioGoBack();
                              xButtonPressed = true;
                        }
                        if (gamepadController.buttons[4].pressed == true && lbButtonPressed == false) {
                              //console.log( "LB Button was pressed, audio going back" );
                              
                              __Controller.audioGoBack();
                              lbButtonPressed = true;
                        }
                        if (gamepadController.buttons[3].pressed == true && yButtonPressed == false) {
                              //console.log( "Y Button was pressed, audio skipping ahead" );
                              
                              __Controller.audioSkipAhead();
                              yButtonPressed = true;
                        }
                        if (gamepadController.buttons[5].pressed == true && rbButtonPressed == false) {
                              //console.log( "RB Button was pressed, audio skipping ahead" );
                              
                              __Controller.audioSkipAhead();
                              rbButtonPressed = true;
                        }
                        if (gamepadController.buttons[6].pressed == true) {
                              //console.log( "Left trigger is being pressed, audio going back" );
                              
                              __Controller.audioGoBackSmallAmount();
                        }
                        if (gamepadController.buttons[7].pressed == true) {
                              //console.log( "Right trigger is being pressed, audio skipping ahead" );
                              
                              __Controller.audioSkipAheadSmallAmount();
                        }
                        if (gamepadController.buttons[8].pressed == true && selectButtonPressed == false) {
                              //console.log( "Select button pressed, deleted podcase" );
                              document.getElementById('delete_episode_button').click();
                              selectButtonPressed = true;
                        }
                        if (gamepadController.buttons[1].pressed == true && bButtonPressed == false) {
                              //console.log( "B button pressed, Going back" );
                              window.history.back();
                              bButtonPressed = true;
                        }
                  }
                  // This is the fullscreen toggle button, so it applies to both views in the webpage
                  if (gamepadController.buttons[9].pressed == true && startButtonPressed == false) {
                        //console.log( "Start button pressed, toggling fullscreen" );
                        startButtonPressed = true;
                        ipcRenderer.send('start-pressed');
                  }
            }
      },
      
      // This initiates most of the variable above this JS object and also starts off the special navigation for the app
      initiatePodcastSelector: function() { 
            episodecellCount = $(".episodecell").length - 1;
            
            //console.log("Selector Initiator started");
            //console.log("There are currently " + episodecellCount + " episode cells");
            
            if ($(".episodecell").length) {
                  //console.log("We are in the podcast list page"); 
                  // Starts off the selection border on the first podcast at the top of the page
                  $(".episodecell:eq(0)").css({"border": ".5em solid #11A29D" })
                  
                  // This scrolls the top of the window to whatever position the first podcast is at
                  document.getElementsByClassName('episodecell')[index].scrollIntoView({behavior: "auto", block: "start"});                      
            }
            
            // This starts up the keyboard controls
            $( "body" ).keypress(function(e) {
                  
                  // For determining which keycode or just "key" should be used
                  //console.log("The keyCode for the key that was pressed was " + e.keyCode);
                  //console.log("The key for the key that was pressed was " + e.key);
                  
                  // Only applies to podcast player page
                  if (document.getElementById('audioplayer')) {
                        if (e.key == "a") {
                              //console.log( "A Pressed; Going back to list" );
                              window.history.back();
                        }
                  } else {
                  
                        if (e.key == 'w' && index != 0) { // to navigate up in the episode cells
                              //console.log( "W was pressed" );
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index -= 1;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowUp(index);
                        }
                        
                        if (e.key == 's' && index < episodecellCount) { // to navigate down in the episode cells
                              //console.log( "S was pressed" );
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index += 1;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowDown(index);
                        }
                        
                        if (e.key == "d") {
                              //console.log( "D Pressed on element " + index );
                              $(".titlestack:eq(" + index + ")").click();
                        }
                        
                        if (e.key == "q") {
                              //console.log( "Q Pressed : Going to top ");
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index = 0;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowUp(index);
                        }
                        
                        if (e.key == "e") {
                              //console.log( "E Pressed  : Going to bottom " );
                              $(".episodecell:eq(" + index + ")").css({"border": "none" })
                              index = episodecellCount;
                              $(".episodecell:eq(" + index + ")").css({"border": ".5em solid #11A29D" })
                              scrollWindowDown(index);
                        }
                  }
                  
            });
            
            
            window.addEventListener("gamepadconnected", function(e) {
                  // console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                  // e.gamepad.index, e.gamepad.id,
                  // e.gamepad.buttons.length, e.gamepad.axes.length);
                  
                  // Checks if the gamepad is an xbox style controller
                  if (e.gamepad.buttons.length == 17) {
                        
                        gamepadID = e.gamepad.index;
                        
                        gamepadDetected = true;
                        __Controller.checkGamepadInput();
                        gamepadCheckInterval = window.setInterval(__Controller.checkGamepadInput, 100);
                  }
            });
            
            window.addEventListener("gamepaddisconnected", function(e) {
                  // console.log("Gamepad disconnected from index %d: %s",
                  //   e.gamepad.index, e.gamepad.id);
                  
                  // This only disconnects a gamepad if it's the last xbox style controller that was connected
                  if (gamepadID == e.gamepad.index) {
                        
                        clearInterval(gamepadCheckInterval);
                        gamepadController = null;
                  }
                  
            });
            
      }
}

import { defaultControlMessage } from './defaultMessages.js';
import { gpState, defaultGamePadStateUbuntu} from './gamepadConfigurations.js'
import { getBrowser, getOS } from './clientChecks.js'
import { debug } from './debug'
 
/* --------------------------------
      COMBINED CHECK FOR OTHERS
---------------------------------- */

function getValueFromController(element, gpad){
    if (element.axis){
      return gpad.axes[element.gpindex];
    }
    else {
      return gpad.buttons[element.gpindex].value;
    }
  }
  
  function simplifyValue(value){
  value = Number.parseFloat(value).toFixed(1);
  if ((value <= 0.1) && (value >= -0.1)){value = 0;}
  return value;
  }
  
  function handleElementValue(element) {
    if (element.invert){element.value = element.value * -1;}
  
    // parse value to one decimal and set values close to 0 as 0
    element.value = simplifyValue(element.value);
    element.value = Number.parseFloat(element.value);
  }
  
  function fixErraneousAxes(element){
    /*
     * In some client environments, the triggers (LT, RT) behave weirdly
     * Seen in Ubuntu 22 & Firefox 
     */
  
    // Before the triggers are pressed their value in gp.axes is 0
    if (element.value) {
      element.initialized = true;
    }
    // after first pressed, the values are: default -1, fully pressed 1
    // thus fixed by adding 1 and dividing by 2 to adjust range to 0-1
    if (element.initialized){
      element.value = (element.value + 1)/2;
    }
  }
  
  function checkInput(state, gp, fixBehavior, sendJSON) {  
    /*
     * Checks controller input and sends commands to server
     * For axes, values near zero (-0.1 to 0.1) are filtered
     * Gripper buttons are sent only when changed
     * Other buttons are sent continuously if not 0
     */
  
    // generate bases for commands
    var axiscmd = defaultControlMessage;
    var grippercmd = {type: "gripper"}
    var buttoncmd = {type: "button"}
    var jointcmd = {type: "joint"}
    var axisChanges = false;
    
    Object.values(state).forEach(element => { 
      /* Axis values */
      if (element.category == "axiscmd") {
        element.value = getValueFromController(element, gp);
  
        if (fixBehavior && (element.name == "L2" || element.name == "R2")) {
          fixErraneousAxes(element);
        }
  
        handleElementValue(element);
        
        // send 0 to stop if previous value was not 0
        if ((element.previousValue != 0) && (element.value == 0)){
          axiscmd[element.controls] = element.value;
          axisChanges = true;
        }
        // otherwise send non-zero values
        else if (element.value != 0){
          axiscmd[element.controls] = element.value;
          console.log(element.name + " " + element.value);
          axisChanges = true;
        }
        // set checked value as previous
        element.previousValue = element.value;
      }
  
      /* Buttons */
      else if (element.category == "gripper"){
        if (getValueFromController(element, gp) && !element.pressed){
          // values are predetermined as 0: close and 1: open
          grippercmd[element.controls] = element.value;
          sendJSON(grippercmd);
          element.pressed = true;
        }
        else if (!getValueFromController(element, gp)) {
          element.pressed = false;
        }
      }
      else if (element.category == "joint") {
        if (getValueFromController(element, gp)) {
          console.log(element.name);
          jointcmd['name'] =  element.controls;
          jointcmd['value'] =  element.invert ? -1 : 1;
          element.pressed = true;
        }
        else if (element.pressed) {
          jointcmd['name'] =  element.controls;
          jointcmd['value'] = 0;
          element.pressed = false;
        }
        
      }
    });
  
    
    if (axisChanges){
      sendJSON(axiscmd);
    }
    if (Object.keys(jointcmd).length != 1){
      sendJSON(jointcmd);
    }
    
    return state;
  }

  /* --------------------------------------------
      CONTROLLER LOOP

  The controller loop is activated when a gamepad 
  is detected by the gamepadConnectionEvent listener.

----------------------------------------------- */

// button conf for windows/mac
var gamePadState = gpState;
// button conf for ubuntu
var gamePadStateUbuntu = defaultGamePadStateUbuntu;

function controllerLoop(messageCallback) {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  if (!gamepads) {
    return;
  }

  if (debug.controllerLoop) {
    console.log("Controller loop started!");
    console.log(gamepads);
  }
  debug.controllerLoop = false;

  Object.values(gamepads).forEach(gp => { 
    if(gp){
      // check buttons and axes
      // Linux & Firefox behavior differs from thers
      if (getOS() == "linux" && getBrowser() == "firefox"){
        gamePadStateUbuntu = checkInput(gamePadStateUbuntu, gp, true, messageCallback);
      }
      else {
        gamePadState = checkInput(gamePadState, gp, false, messageCallback);
      }
    }
  })
}

  
  export { checkInput, controllerLoop}
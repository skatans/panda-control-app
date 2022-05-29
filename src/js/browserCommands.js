import { defaultControlMessage } from './defaultMessages.js';

/* --------------------------------
      BROWSER JOYSTICK STUFF
---------------------------------- */

class SignalConverter {
    signalRate = 100; 
    joystickState = null;
    constructor(rate, sendJSON){
        this.sendJSON = sendJSON;
        if(rate){
            this.signalRate = rate;
        }
    }
    //provided to `move` and `start` callback
    onMove(joystickUpdate, axes){
        this.joystickState = joystickUpdate;
        this.joystickState.axes = axes;
    }
    //provided to `stop` callback
    onStop(){
        this.joystickState = null;
        this.sendJSON(defaultControlMessage);
    }
  
    streamUpdates(){
        //var that = this;
        setInterval(()=> {
          if (this.joystickState != null){
            let browserControlState = Object.assign({}, defaultControlMessage);
            //console.log(defaultBrowserControlState)
            //console.log(this.joystickState);
            //console.log("x", (this.joystickState.x/50).toFixed(1), "y", (this.joystickState.y/50).toFixed(1));
            browserControlState[this.joystickState.axes[0]] = 
              (this.joystickState.axes[0] == "linearZ") ? (parseInt(this.joystickState.y/5)/10 * -1) : parseInt(this.joystickState.y/5)/10;
            browserControlState[this.joystickState.axes[1]] = parseInt(this.joystickState.x/5)/10;
            this.sendJSON(browserControlState);
          }
        }, this.signalRate)
    }
  }

function operateGripper(operation, sendJSON){
var command = {}
// 0 = open gripper
// 1 = close gripper
// for now
command.type = "gripper";
if (operation){
    command.gripper = 0;
}
else {
    command.gripper = 1;
}
sendJSON(command);
}

function manualInputHandler(type, button, value, sendJSON){
    var command = {}
    command.type = type;
    command.name = button;
    command.value = value;
    sendJSON(command);
}

export { SignalConverter, operateGripper, manualInputHandler }
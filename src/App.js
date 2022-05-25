import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Component, React} from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import env from "react-dotenv";
import { Joystick } from 'react-joystick-component';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import socketIOClient from "socket.io-client";

import { defaultButtonState, defaultAxisState, gpState, defaultGamePadStateUbuntu, controllerButtons, defaultControlMessage } from './js/gamepad.js'
import { getBrowser, getOS } from './js/browserChecks.js'
import { debug } from './js/debug.js'

const client = new W3CWebSocket(env.REACT_APP_API_URL);
var controllerType;

client.onopen = () => {
  console.log('WebSocket Client Connected');
};

client.onmessage = (message) => {
    if (debug.incomingMessages) {console.log(message);}
    //document.querySelector('#server-message').textContent = message.data;
    var messageJSON = JSON.parse(message.data);
    if (messageJSON['type'] == 'connection'){
      document.querySelector('#server-info').textContent = messageJSON['message'] +' '+ messageJSON['url'];
    }
    else {
      document.querySelector('#server-message').textContent = messageJSON['message'];
    }
};

client.onerror = function() {
    console.log('Connection Error');
    document.querySelector('#server-info').textContent = 'Connection Error';
};


function sendJSON(controlObject) {
  if (debug.outgoingMessages) {console.log("sent gamepad object:", controlObject);}
  document.querySelector('#client-message').textContent = JSON.stringify(controlObject);
  if(client.OPEN){
    client.send(JSON.stringify(controlObject));
  }
}

/* --------------------------------
      GAMECONTROLLER STUFF
---------------------------------- */

// button conf for windows/mac
var gamePadState = gpState;

// button conf for ubuntu
var gamePadStateUbuntu = defaultGamePadStateUbuntu;
var buttonState = defaultButtonState;
var axisState = defaultAxisState;

var gamepadInfo = document.getElementById("gamepad-info");
var interval;
var start;

window.addEventListener("gamepadconnected", function(e) {
  var gp = navigator.getGamepads()[e.gamepad.index];

  document.querySelector('#round-button').className = 'connected';
  document.querySelector('#gamepad-status').textContent = 'Gamepad: '+ gp.id;

  controllerType = gp.id;
  // Interval to poll and send controller input
  interval = setInterval(controllerLoop, 60);
  
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    gp.index, gp.id,
    gp.buttons.length, gp.axes.length);
  console.log(gp.buttons);
});

window.addEventListener("gamepaddisconnected", function(e) {
  gamepadInfo.innerHTML = "Waiting for gamepad.";
  console.log(`Gamepad disconnected !`)
  document.querySelector('#gamepad-status').textContent = 'Gamepad disconnected :(';
  window.cancelRequestAnimationFrame(start);
});

/* --------------------------------
      BUTTON CHECKS FOR UBUNTU
---------------------------------- */

function buttonPressed(b) {
  if (typeof(b) == "object") {
    return b.pressed;
  }
  return b == 1.0;
}

function checkButtons(buttonState, gp){
  // check gripper buttons
  if(buttonPressed(gp.buttons[0]) || buttonPressed(gp.buttons[1])){
    if (!buttonState[0]["pressed"] && !buttonState[1]["pressed"]) {
      buttonState[0]["pressed"] = true;
      operateGripper(buttonPressed(gp.buttons[0]));
    }
  } else {
    buttonState[0]["pressed"] = false;
    buttonState[1]["pressed"] = false;
  }
  
  // L2 and R2, turning the base joint
  if(buttonPressed(gp.buttons[4]) || buttonPressed(gp.buttons[5])){
    baseJointButtonPressed = true;
    sendJSON({
      type: "joint",
      "name": "panda_joint1",
      "value": (
        (buttonPressed(gp.buttons[4]) ? 1.5 : -1.5)
        )
    })
  } else if (baseJointButtonPressed){
    sendJSON({
      type: "joint",
      "name": "panda_joint1",
      "value": 0
    })
    baseJointButtonPressed = false;
  }

  // for iterating throgh the buttons and axes
  var i;

  // Check other buttons (these are not in use atm)
  for (i = 0; i < gp.buttons.length; i++) {
    if (buttonPressed(gp.buttons[i]) && (i > 1)) {
      //console.log(i, gp.buttons[i]);
    }
    // L2 and R2 (6 & 7) are also axes, and exluded here from buttons
    // exclude also gripper operation buttons 0 and 1
    if ((i < 6 || i > 7) && buttonPressed(gp.buttons[i])) {
      if (debug.controllerInput) {console.log("pressed:", controllerButtons[i]);}
      //console.log(buttonPressed(gp.buttons[i]));
      //gpState[controllerButtons[i]] = 1;
      //sendJSON(gpState);
    }
  }

  return buttonState;
}

/* --------------------------------
      AXIS CHECKS FOR UBUNTU
---------------------------------- */

function checkAxes(axisState, gp){
  // Iterate through axes
  for (var i = 0; i < gp.axes.length; i++) {
    // get the value 
    axisState[i].value = gp.axes[i];

    // linearX needs to be inverted
    if (axisState[i].invert) {
      axisState[i].value = axisState[i].value * -1;
    }

    // problems with 2 and 5 having different value stuff
    // like first have default value of 0 then range from -1 to 1
    if (getOS() == "linux" && gp.id == "054c-05c4-Wireless Controller"){
      if (i == 2) {
        axisState[i].value = (axisState[i].value+1)/2;
        if (axisState[i].value != 1 && !linearZ2){
          axisState[i].value = 0;
        } else {
          linearZ2 = true;
        }
      } else if (i == 5) {
        axisState[i].value = (axisState[i].value+1)/2;
        if (axisState[i].value == 0.5 && !linearZ5){
          axisState[i].value = 0;
        } else {
          linearZ5 = true;
        }
        axisState[i].value = axisState[i].value *-1;
      }
    }
    axisState[i].value = parseFloat(axisState[i].value.toFixed(1));
  }
  return axisState;
}

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

function checkInput(state, gp) {  
  /*
   * Checks controller input and sends commands to server
   * For axes, values from -1 to -0.2 and 0.2 to 1 are sent
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
    if (element.category == "axis") {
      element.value = getValueFromController(element, gp);

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
    else if (element.category = "button") {
      if (element.controls == "gripper"){
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
      else if (element.controls != null) {
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


/* --------------------------------
      CONTROLLER LOOP
---------------------------------- */

var controllerLoopOn = false;
var baseJointButtonPressed = false;

// these have value fluctuation for some reason
var linearZ2 = false;
var linearZ5 = false;

function controllerLoop() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  if (!gamepads) {
    return;
  }

  //var gp = gamepads[0];
  

  if (debug.controllerLoop) {
    if (!controllerLoopOn){
      console.log("Controller loop started!");
      console.log(gamepads);
    }
    controllerLoopOn = true;
    console.log("Controller loop looping!");
  }

  Object.values(gamepads).forEach(gp => { 
    if(gp){
      // check buttons and axes
      // duct tape thing for ubuntu & firefox having a differing interpretation of things
      if (getOS() == "linux" && gp.id == "054c-05c4-Wireless Controller"){
        buttonState = checkButtons(buttonState, gp);
        axisState = checkAxes(axisState, gp);
      }
      else {
        gamePadState = checkInput(gamePadState, gp);
      }
    }
  })
}

function operateGripper(operation){
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

/* --------------------------------
      DISPLAY SENT MESSAGES & SERVER STATUS
---------------------------------- */

class ServerStatus extends Component {
  render() {
    return (
      <Card style={{ width: '20rem' }} className="align-self-center">
      <Card.Header>Server status</Card.Header>
      
      <Card.Body>
        <Card.Title>Connection</Card.Title>
        <Card.Text id="server-info">Not connected</Card.Text>
        <Card.Title>Last sent message</Card.Title>
        <Card.Text id="client-message">No messages sent.</Card.Text>
        <Card.Title>Messages from server</Card.Title>
        <Card.Text id="server-message">No messages from server</Card.Text>
      </Card.Body>
      </Card>
    )
  }
}

/* --------------------------------
      KEYBOARD CONTROLS
---------------------------------- */

document.addEventListener('keydown', (event) => {
  const keyName = event.key;

  if (keyName === 'w' || keyName === 'a' || keyName === 's' || keyName === 'd') {
    console.log(`Key pressed ${keyName}`);
    return;
  }
  else {
    console.log("Some other key is pressed");
  }
}, false);

document.addEventListener('keyup', (event) => {
  const keyName = event.key;
}, false);


/* --------------------------------
      BROWSER CONTROLS
---------------------------------- */

var defaultBrowserControlState = {
  type: "controller",
  linearX: 0,
  linearY: 0,
  linearZ: 0,
  angularX: 0,
  angularY: 0,
  angularZ: 0,
};

function manualInputHandler(type, button, value){
  console.log("cool");
  var command = {}
  command.type = type;
  command.name = button;
  command.value = value;
  sendJSON(command);
}

/* --------------------------------
      BROWSER JOYSTICK STUFF
---------------------------------- */

class SignalConverter {
  signalRate = 100; 
  joystickState = null;
  constructor(rate){
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
      sendJSON(defaultBrowserControlState);
  }

  streamUpdates(){
      setInterval(()=> {
        if (this.joystickState != null){
          let browserControlState = Object.assign({}, defaultBrowserControlState);
          //console.log(defaultBrowserControlState)
          //console.log(this.joystickState);
          //console.log("x", (this.joystickState.x/50).toFixed(1), "y", (this.joystickState.y/50).toFixed(1));
          browserControlState[this.joystickState.axes[0]] = 
            (this.joystickState.axes[0] == "linearZ") ? (parseInt(this.joystickState.y/5)/10 * -1) : parseInt(this.joystickState.y/5)/10;
          browserControlState[this.joystickState.axes[1]] = parseInt(this.joystickState.x/5)/10;
          sendJSON(browserControlState);
        }
      }, this.signalRate)
  }
}

const signalConverter = new SignalConverter(60);
signalConverter.streamUpdates((state) => {/*Logs every 100ms*/})
//React

/* --------------------------------
      JOYSTICK CONTROLS
---------------------------------- */

class ControllerStatus extends Component {
  render() {
    return (
      <Card style={{ width: '20rem' }} className="align-self-center">
      <Card.Header>Arm control</Card.Header>
        <Card.Body className='d-flex justify-content-around flex-column'>

          <Card.Subtitle className="mb-2 text-muted">Gripper actions</Card.Subtitle>
          
          <ButtonGroup className="me-2" aria-label="Gripper buttons">
            <Button variant="primary" onClick={ () => operateGripper(0) }>Open gripper</Button>
            <Button variant="primary" onClick={ () => operateGripper(1) }>Close gripper</Button>
          </ButtonGroup> 
          <ButtonGroup className="me-2" aria-label="Y axis buttons">
            <Button  variant="outline-primary" onClick={ () => manualInputHandler("joint", "panda_joint7", 1) }>Rotate left</Button>
            <Button variant="outline-primary" onClick={ () => manualInputHandler("joint", "panda_joint7", -1) }>Rotate right</Button>
          </ButtonGroup>
        </Card.Body>

        <Card.Subtitle className="mb-2 text-muted">Linear XY -- Linear ZY -- Angular XY</Card.Subtitle>

        <Card.Body className='d-flex justify-content-around'>

          <Joystick move={(update) => signalConverter.onMove(update, ["linearX", "linearY"])} start={(update) => signalConverter.onMove(update, ["linearX", "linearY"])} stop={(update) => signalConverter.onStop(update)}></Joystick>
          <Joystick baseColor={"#226699"} stickColor={"#8899DD"} move={(update) => signalConverter.onMove(update, ["linearZ", "linearY"])} start={(update) => signalConverter.onMove(update, ["linearZ", "linearY"])} stop={(update) => signalConverter.onStop(update)}></Joystick>
          <Joystick move={(update) => signalConverter.onMove(update, ["angularY", "angularX"])} start={(update) => signalConverter.onMove(update, ["angularY", "angularX"])} stop={(update) => signalConverter.onStop(update)}></Joystick>
        </Card.Body>

        <Card.Body className='d-flex justify-content-around'>
          <ButtonGroup className="me-2" aria-label="Y axis buttons">
            <Button  variant="primary" onClick={ () => manualInputHandler("joint", "panda_joint1", 1) }>Rotate base left</Button>
            <Button variant="primary" onClick={ () => manualInputHandler("joint", "panda_joint1", -1) }>Rotate base right</Button>
          </ButtonGroup>
        </Card.Body>
      <Card.Body>
        <Card.Text id="gamepad-status">Waiting for Gamepad.</Card.Text>
        <div id="round-button"></div>
        <p id="button-info"></p>
     
      </Card.Body>
      </Card>
    )
  }
}

/* --------------------------------
      VISUALIZE ROBOT
---------------------------------- */

const socket = socketIOClient(env.VIDEO, {
withCredentials: false
});
socket.on('image', (image) => { //capture 'image'-messages and as they're already encoded as jpg, no need to handle encoding/decoding stuff
  const imageElm = document.getElementById('image');
    imageElm.src = 'data:image/jpeg;base64,'+image;
});

class Visualization extends Component {
  componentDidMount() {
    
  }
  render() {
    return (
      <div>
        <img id="image"></img>

      </div>

    )
  }
}

function App() {
  return (
    <div className="App">
      <Container fluid className="Container">
        <Row>

          <Col id="server-col" className="d-flex justify-content-center align-items-center">
            <ServerStatus />
          </Col>

          <Col id="client-col" className="d-flex justify-content-center align-items-center text-center">
            <ControllerStatus />
          </Col>

          <Col id="server-col" className="d-flex justify-content-center align-items-center">  
          <Visualization />

          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default App;
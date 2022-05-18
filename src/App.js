import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Component, React} from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import env from "react-dotenv";
import { Joystick, IJoystickUpdateEvent } from 'react-joystick-component';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';


const debug = {
  incomingMessages: true,
  outgoingMessages: false,
  controllerLoop: false,
  controllerInput: false
};

function getBrowser(){
  // In Opera
  if ((navigator.userAgent.indexOf("Opera"))!=-1) {
  return "Opera";
 }
 // In MSIE
 else if ((navigator.userAgent.indexOf("MSIE"))!=-1) {
  return "Microsoft Internet Explorer";
 }
 // In Chrome
 else if ((navigator.userAgent.indexOf("Chrome"))!=-1) {
  return "Chrome";
 }
 // In Safari
 else if ((navigator.userAgent.indexOf("Safari"))!=-1) {
  return "Safari";
 }
 // In Firefox
 else if ((navigator.userAgent.indexOf("Firefox"))!==-1) {
  return "Firefox";
 }
 // In most other browsers, "name/version" is at the end of userAgent 
 else {
  return "Other";
 }
 
}

function getOS(){
   if ((navigator.userAgent.indexOf("Linux"))!=-1) {
   return "Linux";
  }
}


const client = new W3CWebSocket(env.API_URL);
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

var defaultGamepadState = {
  type: "controller",
  linearX: 0,
  linearY: 0,
  linearZ: 0,
  angularX: 0,
  angularY: 0,
  angularZ: 0//,
  //buttonX: 0,
  //buttonO: 0,
  //buttonTR: 0,
  //buttonSQ: 0,
  //gripperOpen: 0,
  //gripperClose: 0
};

const axes = {
  0: "linearY",
  1: "linearX",
  2: "linearZ", // linearZ-2
  3: "angularX",
  4: "angularY",
  5: "linearZ", // linearZ-5
  6: "linearX",
  7: "angularZ"
}

const controllerButtons = {
  0: "buttonX",
  1: "buttonO",
  2: "buttonTR",
  3: "buttonSQ",
  4: "gripperOpen", //L1
  5: "gripperClose", //R1
  6: "L2",
  7: "R2",
  8: "home",
  9: "start",
  10: "power",
  11: "LS",
  12: "RS"
}

var buttonState = {
  0: {name: "buttonX", controls: null, pressed: false},
  1: {name: "buttonO", controls: null, pressed: false},
  2: {name: "buttonTR", controls: null, pressed: false},
  3: {name: "buttonSQ", controls: null, pressed: false},
  4: {name: "L1", controls: "panda_joint1", pressed: false}, //L1
  5: {name: "R2", controls: "panda_joint1", pressed: false}, //R1
  6: {name: "L2", controls: null, pressed: false},
  7: {name: "R2", controls: null, pressed: false},
  8: {name: "home", controls: null, pressed: false},
  9: {name: "start", controls: null, pressed: false},
  10: {name: "power", controls: null, pressed: false},
  11: {name: "LS", controls: null, pressed: false},
  12: {name: "RS", controls: null, pressed: false}
}

var axisState = {
  0: {name: "leftStick", controls: "linearY", invert: false, value: 0, previousValue: 0},
  1: {name: "leftStick", controls: "linearX", invert: true, value: 0, previousValue: 0},
  2: {name: "leftTrigger", controls: "linearZ", invert: false, value: 0, previousValue: 0}, // linearZ-2
  3: {name: "rightStick", controls: "angularX", invert: false, value: 0, previousValue: 0},
  4: {name: "rightStick", controls: "angularY", invert: false, value: 0, previousValue: 0},
  5: {name: "rightTrigger", controls: "linearZ", invert: false, value: 0, previousValue: 0}, // linearZ-5
  6: {name: "leftStick", controls: "linearX", invert: false, value: 0, previousValue: 0},
  7: {name: "leftStick", controls: "angularZ", invert: false, value: 0, previousValue: 0}
}

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
});

window.addEventListener("gamepaddisconnected", function(e) {
  gamepadInfo.innerHTML = "Waiting for gamepad.";
  console.log(`Gamepad disconnected !`)
  document.querySelector('#gamepad-status').textContent = 'Gamepad disconnected :(';
  window.cancelRequestAnimationFrame(start);
});

/* --------------------------------
      BUTTON CHECKS
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
      AXIS CHECKS
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
    if (getOS() == "Linux" && gp.id == "054c-05c4-Wireless Controller"){
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

function parseAndSend(type, axisState){
  var cmd = {type: type}
  Object.values(axisState).forEach(element => {
    // send 0 to stop
    if ((element.previousValue != 0) && (element.value == 0)){
      cmd[element.controls] = element.value; 
    }
    // otherwise send non-zero values
    if (element.value != 0){
      cmd[element.controls] = element.value;
    }
    // set checked value as previous
    element.previousValue = element.value;
  });
  if (Object.keys(cmd).length != 1){
    sendJSON(cmd);
  }
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

  var gp = gamepads[0];  
  if (debug.controllerLoop) {
    if (!controllerLoopOn){
      console.log("Controller loop started!");
      console.log(gp);
    }
    controllerLoopOn = true;
    console.log("Controller loop looping!");
  }

  // check buttons and axes
  buttonState = checkButtons(buttonState, gp);
  axisState = checkAxes(axisState, gp);

  parseAndSend("controller", axisState);
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
  angularZ: 0//,
  //buttonX: 0,
  //buttonO: 0,
  //buttonTR: 0,
  //buttonSQ: 0,
  //gripperOpen: 0,
  //gripperClose: 0
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

class Visualization extends Component {
  componentDidMount() {
    
  }
  render() {
    return <Card style={{ width: '20rem' }} className="align-self-center"><div ref={ref => (this.mount = ref)} /></Card>;
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
          <video id="myVidPlayer" controls muted autoPlay></video>

          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default App;
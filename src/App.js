import logo from './panda.png';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Component, React} from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import env from "react-dotenv";
import { Joystick, IJoystickUpdateEvent } from 'react-joystick-component';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';

const client = new W3CWebSocket(env.PETTERI);
var connected = false;
var controllerType;

const debug = {
  incomingMessages: false,
  outgoingMessages: true,
  controllerLoop: false,
  controllerInput: true
};

client.onopen = () => {
  connected = true;
  console.log('WebSocket Client Connected');
  document.querySelector('#server-info').textContent = env.PETTERI;
};

client.onmessage = (message) => {
    if (debug.incomingMessages) {console.log(message);}
    document.querySelector('#server-message').textContent = message.data;
};

client.onerror = function() {
    console.log('Connection Error');
    document.querySelector('#server-info').textContent = 'Connection Error';
};


function sendJSON(controlObject) {
  if (debug.outgoingMessages) {console.log("sent gamepad object:", controlObject);}
    // 0 == LeftStickX (left/right)*/
    // 1 == LeftStickY (up/down)
    // 2 == L2
    // 3 == RightStickX (up/down)
    // 4 == RightStickY (up/down)
    // 5 == R2
    // 6 == dpadY
    // 7 == dpadX
  document.querySelector('#client-message').textContent = JSON.stringify(controlObject);
  if(connected){
    client.send(JSON.stringify(controlObject));
  }
}

/* --------------------------------
      GAMECONTROLLER STUFF
---------------------------------- */

// unfinished class not in use (yet)
/*
class Controller {
  constructor(controller) {
    this.state = {
      type: "",
      //linearX: 0,
      //linearY: 0,
      //linearZ: 0,
      //angularX: 0,
      //angularY: 0,
      //angularZ: 0,
      gripper: 0
    }
  }
    
  static axes = {
    0: "linearX",
    1: "linearY",
    2: "linearZ-2",
    3: "angularX",
    4: "angularY",
    5: "linearZ-5",
    6: "linearX",
    7: "linearX"
  }
    
  static controllerButtons = {
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
  
};
*/

var defaultGamepadState = {
  type: "",
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
  0: "linearX",
  1: "linearY",
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

var gamepadInfo = document.getElementById("gamepad-info");
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

var interval;

if (!('ongamepadconnected' in window)) {
  // No gamepad events available, poll instead.
  interval = setInterval(pollGamepads, 500);
}

function pollGamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  for (var i = 0; i < gamepads.length; i++) {
    var gp = gamepads[i];
    if (gp) {
      gamepadInfo.innerHTML = "Gamepad connected at index " + gp.index + ": " + gp.id +
        ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.";
      clearInterval(interval);
    }
  }
}

function buttonPressed(b) {
  if (typeof(b) == "object") {
    return b.pressed;
  }
  return b == 1.0;
}


/* --------------------------------
      CONTROLLER LOOP
---------------------------------- */

var controllerLoopOn = false;
var gripperButtonPressed = false;
// these have value fluctuation for some reason
var linearZ2 = false;
var linearZ5 = false;

function controllerLoop() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  if (!gamepads) {
    return;
  }

  var gp = gamepads[0];
  var gpState = defaultGamepadState;
  gpState.type = "controller";
  
  if (debug.controllerLoop) {
    if (!controllerLoopOn){
      console.log("Controller loop started!");
      console.log(gp);
    }
    controllerLoopOn = true;
    console.log("Controller loop looping!");
  }

  
  // check gripper buttons
  if(buttonPressed(gp.buttons[0]) || buttonPressed(gp.buttons[1])){
    if (!gripperButtonPressed) {
      gripperButtonPressed = true;
      console.log("uus painallus");
      operateGripper(buttonPressed(gp.buttons[1]));
    }
  } else {
    gripperButtonPressed = false;
  }
  
  // L2 and R2
  if(buttonPressed(gp.buttons[4]) || buttonPressed(gp.buttons[5])){
    sendJSON({
      type: "joint",
      "joint0": (
        (buttonPressed(gp.buttons[4]) ? 0.5 : -0.5)
        )
      })
    }
    
    
  // for iterating throgh the buttons and axes
  var i;

  // Check buttons
  for (i = 0; i < gp.buttons.length; i++) {
    //gpState[controllerButtons[i]] = 0;
    if (buttonPressed(gp.buttons[i]) && (i > 1)) {
      console.log(i, gp.buttons[i]);
    }
    // L2 and R2 (6 & 7) are also axes, and exluded here from buttons
    // exclude also gripper operation buttons 0 and 1
    if ((i < 6 || i > 7) && buttonPressed(gp.buttons[i])) {
      if (debug.controllerInput) {console.log("pressed:", controllerButtons[i]);}

      console.log(buttonPressed(gp.buttons[i]));
      //gpState[controllerButtons[i]] = 1;
      //sendJSON(gpState);
    }
  }

  var currentAxisValue;
  // Check axes
  for (i = 0; i < gp.axes.length; i++) {
    // get the value 
    currentAxisValue = gp.axes[i];
    // problems with 2 and 5 having different value stuff
    // like first have default value of 0 then range from -1 to 1
    if (i == 2) {
      currentAxisValue = (currentAxisValue+1)/2;
      if (currentAxisValue != 1 && !linearZ2){
        currentAxisValue = 0;
      } else {
        linearZ2 = true;
      }
    } else if (i == 5) {
      currentAxisValue = (currentAxisValue+1)/2;
      if (currentAxisValue == 0.5 && !linearZ5){
        currentAxisValue = 0;
      } else {
        linearZ5 = true;
      }
      currentAxisValue = currentAxisValue *-1;
    }
    
    currentAxisValue = currentAxisValue.toFixed(1);
    gpState[axes[i]] = currentAxisValue;
    if (currentAxisValue != 0){
      if (debug.controllerInput){
        console.log("axis", i, ":", axes[i], currentAxisValue);
      }
      sendJSON(gpState);
    }
  }
  
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

function manualInputHandler(button, value){
  console.log("cool");
  var command = {}
  command.type = "browser";
  command[button] = value;
  sendJSON(command);
}

function onStop(){
  console.log("stop");
}

const onMove = (stick:IJoystickUpdateEvent) => {
  console.log("x", (stick.x/50).toFixed(1), "y", (stick.y/50).toFixed(1));
}

class ControllerStatus extends Component {
  render() {
    return (
      <Card style={{ width: '20rem' }} className="align-self-center">
      <Card.Header>Arm control</Card.Header>
        <Card.Body>
          <ButtonGroup className="me-2" aria-label="Gripper buttons">
            <Button variant="primary" onClick={ () => operateGripper(1) }>Open gripper</Button>
            <Button variant="primary" onClick={ () => operateGripper(0) }>Close gripper</Button>
          </ButtonGroup> 
        </Card.Body>

        <Card.Body>
          <Joystick size={100} sticky={false} throttle={100} move={onMove} stop={onStop}></Joystick>
        </Card.Body>

        <Card.Body>
          <ButtonGroup vertical className="me-2" aria-label="Z axis buttons">
            <Button  variant="info" onClick={ () => manualInputHandler("Z", -0.2) }>Up</Button>
            <Button variant="secondary" onClick={ () => manualInputHandler("Z", 0)}>-</Button>
            <Button variant="info" onClick={ () => manualInputHandler("Z", 0.2) }>Down</Button>
          </ButtonGroup>

          <ButtonGroup vertical className="me-2" aria-label="X axis buttons">
            <Button  variant="info" onClick={ () => manualInputHandler("X", 0.2) }>Front</Button>
            <Button variant="secondary" onClick={ () => manualInputHandler("X", 0) }>-</Button>
            <Button variant="info" onClick={ () => manualInputHandler("X", -0.2)}>Back</Button>
          </ButtonGroup>
          </Card.Body>

        <Card.Body>
          <ButtonGroup className="me-2" aria-label="Y axis buttons">
            <Button  variant="info" onClick={ () => manualInputHandler("Y", -0.2) }>Left</Button>
            <Button variant="secondary" onClick={ () => manualInputHandler("Y", 0) }>-</Button>
            <Button variant="info" onClick={ () => manualInputHandler("Y", 0.2) }>Right</Button>
          </ButtonGroup>

        <Card.Text id="gamepad-status">Waiting for Gamepad.</Card.Text>
        <div id="round-button"></div>
        <p id="button-info"></p>
     
      </Card.Body>
      </Card>
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
           <p><img src={logo} className="App-logo" alt="logo" /></p>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default App;
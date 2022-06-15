import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Container, Row, Col } from 'react-bootstrap';
import { React, useEffect } from 'react';
import env from "react-dotenv";

import { handleKeyDown, handleKeyUp, handleGamepadConnection, handleGamepadDisconnection } from './js/events';
import { ServerStatus, Visualization, ControllerStatus } from './js/mainComponents';
import { gpState, defaultGamePadStateUbuntu} from './js/gamepadConfigurations.js'
import { getBrowser, getOS } from './js/clientChecks.js';
import { SignalConverter } from './js/browserCommands.js';
import { checkInput } from './js/controllerInput.js';
import { debug } from './js/debug.js';

/* --------------------------------------------
      CONNECTIONS
----------------------------------------------- */

const client = new W3CWebSocket(env.PETTERI);

client.onopen = () => {
  console.log('WebSocket Client Connected');
  document.querySelector('#server-info').textContent = 'Connected to '+ client.url;
};

client.onmessage = (message) => {
  
    if (debug.incomingMessages) {console.log(message);}
    try {
      var messageJSON = JSON.parse(message.data);
      if (messageJSON['type'] == 'connection'){
        document.querySelector('#server-info').textContent = messageJSON['message'] +' '+ messageJSON['url'];
      }
      if (true) {
        console.log(messageJSON);
        document.querySelector('#server-message').textContent = JSON.stringify(messageJSON, null, '\t');
      }
    } catch (e) {
      if (debug.incomingMessages) {console.log("Error while parsing message from server");}
    }
};

client.onerror = function() {
    console.log('Connection Error');
    document.querySelector('#server-info').textContent = 'Connection Error';
};

function sendJSON(controlObject) {
  if (debug.outgoingMessages) {console.log("sent gamepad object:", controlObject);}
  document.querySelector('#client-message').textContent = JSON.stringify(controlObject, null, '\t');
  if(client.OPEN){
    client.send(JSON.stringify(controlObject));
  }
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

function controllerLoop() {
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
        gamePadStateUbuntu = checkInput(gamePadStateUbuntu, gp, true, sendJSON);
      }
      else {
        gamePadState = checkInput(gamePadState, gp, false, sendJSON);
      }
    }
  })
}


function App() {

  document.title = "Panda Control App"

  var interval;

  /*
   * Event handling for gamepad connections
   */
  useEffect(() => {
    // Event handler for connected gamepad
    window.addEventListener('gamepadconnected', (event) => {
      handleGamepadConnection(event, interval, controllerLoop);
    });
    // Event handler for disconnected gamepad
    window.addEventListener('gamepaddisconnected', (event) => {
      handleGamepadDisconnection(event, interval);
    });
    // event handlers for keyboard events (not in use)
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // cleanup this component
    return () => {
      window.removeEventListener('gamepadconnected');
      window.removeEventListener('gamepaddisconnected');
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };

  }, []);

  // Give sendJSON messager function as argument so that the browser joysticks are able to send commands
  const signalConverter = new SignalConverter(60, sendJSON);
  signalConverter.streamUpdates((state) => {/*Logs every 100ms*/});

  return (
    <div className="App">
      <Container fluid className="Container">
        <Row>
          <Col id="client-col" className="d-flex justify-content-center align-items-center text-center">
            <ServerStatus />
          </Col>

          <Col id="client-col" className="d-flex justify-content-center align-items-center text-center">
            <ControllerStatus signalConverter={signalConverter} messageCallback={sendJSON}/>
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
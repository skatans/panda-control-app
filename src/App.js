import logo from './panda.png';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Gamepad from 'react-gamepad'
import {Component, React} from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import env from "react-dotenv";
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';

const client = new W3CWebSocket(env.PETTERI);

client.onopen = () => {
    console.log('WebSocket Client Connected');
    document.querySelector('#server-info').textContent = env.PETTERI;
};

client.onmessage = (message) => {
    console.log(message);
    document.querySelector('#server-message').textContent = message.data;
};

client.onerror = function() {
    console.log('Connection Error');
    document.querySelector('#server-info').textContent = 'Connection Error';
};

function sendControlMessage(type, identifier, value) {
  console.log("Sending to server:", type, identifier, value);
  document.querySelector('#client-message').textContent = "type: "+type+"\nid: "+identifier+"\nvalue: " + value;
  client.send(JSON.stringify({
    type: type,
    id: identifier,
    value: value
  }));
}

class GameControl extends Component {
  connectHandler(gamepadIndex) {
    console.log(`Gamepad ${gamepadIndex} connected !`)
    document.querySelector('#round-button').className = 'connected';
    document.querySelector('#gamepad-info').textContent = 'Gamepad connected!';
  }
 
  disconnectHandler(gamepadIndex) {
    console.log(`Gamepad ${gamepadIndex} disconnected !`)
    document.querySelector('#gamepad-info').textContent = 'Gamepad disconnected :(';
    // Send stop signal to server
    
  }
 
  buttonChangeHandler(buttonName, down) {
    sendControlMessage(
      "buttonChange",
      buttonName,
      down ? 0 : 1);
  }
 
  axisChangeHandler(axisName, value, previousValue) {
    /*
     * At the moment only the left stick has movement in both directions
     * right stick up/down is not captured
     */

    // LeftStickX = left stick right/left
    // LeftStickY = left stick up/down
    // axisMoveZ = 
    console.log(axisName, value)
    document.querySelector('#button-info').textContent = ('Latest input: ' + axisName);
    
    if (axisName == 'LeftStickX'){
      // Left/Right
      axisMoveY(value);
    }
    if (axisName == 'LeftStickY'){
      // Front/Back
      axisMoveX(value);
    }
    if (axisName == 'RightStickY'){
      // Up/Down
      axisMoveZ(value);
    }
  }
 
  buttonDownHandler(buttonName) {
    console.log(buttonName, 'down');
  }
 
  buttonUpHandler(buttonName) {
    console.log(buttonName, 'up')
    document.querySelector('#button-info').textContent = ('Latest input: ' + buttonName);
  }
 
  render() {
    return (
      <div>
      <Gamepad
        onConnect={this.connectHandler}
        onDisconnect={this.disconnectHandler}

        onButtonChange={this.buttonChangeHandler}
        onAxisChange={this.axisChangeHandler}

        onButtonDown={this.buttonDownHandler}
        onButtonUp={this.buttonUpHandler}
      >
        <p id="gamepad-info">Waiting for Gamepad.</p>
        </Gamepad>
      </div>
    )
  }
}

function operateGripper(operation){
  // 1 = open gripper
  // 0 = close gripper
  // for now
  if (operation){
    console.log("open gripper");
  }
  else {
    console.log("close gripper");
  }
  sendControlMessage(
    "action",
    "gripper",
    operation
  );
}

function axisMoveX(value){
  // Front/Back
  sendControlMessage(
    "axisChange",
    "X",
    value);
}
function axisMoveY(value){
  // Left/Right
  sendControlMessage(
    "axisChange",
    "Y",
    value);
}
function axisMoveZ(value){
  // Up/Down
  sendControlMessage(
    "axisChange",
    "Z",
    value);
}

class ServerStatus extends Component {
  render() {
    return (
      <Card style={{ width: '20rem' }} className="align-self-center">
      <Card.Header>Server status</Card.Header>
        <Card.Body>
          <Card.Title>Connection</Card.Title>
          <Card.Text id="server-info">Not connected</Card.Text>
          <Card.Title>Sent message</Card.Title>
          <Card.Text id="client-message">No messages sent.</Card.Text>
          <Card.Title>Messages from server</Card.Title>
          <Card.Text id="server-message">No messages from server</Card.Text>
        </Card.Body>
      </Card>
    )
  }
}

class ControlButtons extends Component {
    render() {
    return (
      <Container id="gripperButtons">
        <Col>
          <Row>Gripper control</Row>    
          <ButtonGroup className="me-2" aria-label="Gripper buttons">
            <Button variant="primary" onClick={ () => operateGripper(1) }>Open gripper</Button>
            <Button variant="primary" onClick={ () => operateGripper(0) }>Close gripper</Button>
          </ButtonGroup> 
          <Row>Arm movement</Row>    
          
          <ButtonGroup vertical className="me-2" aria-label="Z axis buttons">
            <Button  variant="info" onClick={ () => axisMoveZ(-0.2) }>Up</Button>
            <Button variant="secondary" onClick={ () => axisMoveZ(0) }>-</Button>
            <Button variant="info" onClick={ () => axisMoveZ(0.2) }>Down</Button>
          </ButtonGroup>

          <ButtonGroup vertical className="me-2" aria-label="X axis buttons">
            <Button  variant="info" onClick={ () => axisMoveX(0.2) }>Front</Button>
            <Button variant="secondary" onClick={ () => axisMoveX(0) }>-</Button>
            <Button variant="info" onClick={ () => axisMoveX(-0.2) }>Back</Button>
          </ButtonGroup>

          <ButtonGroup className="me-2" aria-label="Y axis buttons">
            <Button  variant="info" onClick={ () => axisMoveY(-0.2) }>Left</Button>
            <Button variant="secondary" onClick={ () => axisMoveY(0) }>-</Button>
            <Button variant="info" onClick={ () => axisMoveY(0.2) }>Right</Button>
          </ButtonGroup>

        </Col>
      </Container>
    )
  }
}

class ControllerStatus extends Component {
  render() {
    return (
    <div className="App-header">
        <ControlButtons/>
        <GameControl/>
      <div id="round-button"></div>
      <p id="button-info"></p>
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
           <p><img src={logo} className="App-logo" alt="logo" /></p>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default App;
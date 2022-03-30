import logo from './panda.png';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Gamepad from 'react-gamepad'
import {Component, React} from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import env from "react-dotenv";
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const client = new W3CWebSocket(env.API_URL);

client.onopen = () => {
    console.log('WebSocket Client Connected');
    document.querySelector('#server-info').textContent = 'Connected to ' + env.API_URL;
};

client.onmessage = (message) => {
    console.log(message);
    document.querySelector('#server-message').textContent = message.data;
};

client.onerror = function() {
    console.log('Connection Error');
    document.querySelector('#server-info').textContent = 'Connection Error';
};

function handleControllerInput(type, buttonName, value) {
  console.log("Sending to server:", type, buttonName, value);
  client.send(JSON.stringify({
    type: type,
    button: buttonName,
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
  }
 
  buttonChangeHandler(buttonName, down) {
    handleControllerInput(
      "buttonChange",
      buttonName,
      down ? 0 : 1);
  }
 
  axisChangeHandler(axisName, value, previousValue) {
    console.log(axisName, value)
    document.querySelector('#button-info').textContent = ('Latest input: ' + axisName + ' ' + value);
    handleControllerInput(
      "axisChange",
      axisName,
      value);
  }
 
  buttonDownHandler(buttonName) {
    console.log(buttonName, 'down');
    //client.send(JSON.stringify({
    //  type: "contentchange",
    //  content: "buttonDown"
    //}));
  }
 
  buttonUpHandler(buttonName) {
    console.log(buttonName, 'up')
    document.querySelector('#button-info').textContent = ('Latest input: ' + buttonName);
    //client.send(JSON.stringify({
    //  type: "contentchange",
    //  content: "buttonUp"
    //}));
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

function openGripper(){
  console.log("open gripper");
  client.send(JSON.stringify({
    type: "gripperCommand",
    command: "open"
  }));
}

function closeGripper(){
  console.log("close gripper");
  client.send(JSON.stringify({
    type: "gripperCommand",
    command: "close"
  }));
}

class ServerStatus extends Component {
  render() {
    return (
      <Card style={{ width: '20rem' }} className="align-self-center">
      <Card.Header>Server status</Card.Header>
        <Card.Body>
          <Card.Title>Connection</Card.Title>
          <Card.Text id="server-info">Not connected</Card.Text>
          <Card.Title>Messages from server</Card.Title>
          <Card.Text id="server-message">No messages from server</Card.Text>
        </Card.Body>
      </Card>
    )
  }
}

class ControllerStatus extends Component {
  render() {
    return (
    <div className="App-header">
      <p><img src={logo} className="App-logo" alt="logo" /></p>
      <div id="gripperButtons">
        <button onClick={openGripper}>Open gripper</button>
        <button onClick={closeGripper}>Close gripper</button>
      </div>
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
        </Row>
      </Container>
    </div>
  );
}

export default App;
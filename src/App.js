import logo from './panda.png';
import './App.css';
import Gamepad from 'react-gamepad'
import {Component, React} from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import env from "react-dotenv";

const client = new W3CWebSocket(env.API_URL);

client.onopen = () => {
    console.log('WebSocket Client Connected');
};

client.onmessage = (message) => {
    console.log(message);
};

client.onerror = function() {
    console.log('Connection Error');
};

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
    //console.log(buttonName, down);
    client.send(JSON.stringify({
      type: "contentchange",
      button: buttonName,
      up: !down,
      down: down
    }));
  }
 
  axisChangeHandler(axisName, value, previousValue) {
    console.log(axisName, value)
    document.querySelector('#button-info').textContent = ('Latest input: ' + axisName + ' ' + value);
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

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <p><img src={logo} className="App-logo" alt="logo" /></p>
      <div id="gripperButtons">
        <button onClick={openGripper}>Open gripper</button>
        <button onClick={closeGripper}>Close gripper</button>
      </div>
          <GameControl/>
        <div id="round-button"></div>
        <p id="button-info"></p>
      </header>
    </div>
  );
}

export default App;
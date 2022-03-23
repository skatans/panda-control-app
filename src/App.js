import logo from './panda.png';
import './App.css';
import Gamepad from 'react-gamepad'
import {Component, React} from 'react'

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
    console.log(buttonName, down)
  }
 
  axisChangeHandler(axisName, value, previousValue) {
    console.log(axisName, value)
    document.querySelector('#button-info').textContent = ('Latest input: ' + axisName + ' ' + value);
  }
 
  buttonDownHandler(buttonName) {
    console.log(buttonName, 'down')
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

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <p><img src={logo} className="App-logo" alt="logo" /></p>
          <GameControl/>
        <div id="round-button"></div>
        <p id="button-info"></p>
      </header>
    </div>
  );
}

export default App;
import logo from './logo.svg';
import './App.css';
import React from 'react';

function getGamepadState() {

  // Returns up to 4 gamepads.
  const gamepads = navigator.getGamepads();

  // We take the first one, for simplicity
  const gamepad = gamepads[0];

  // Escape if no gamepad was found
  if (!gamepad) {
      console.log('No gamepad found.');
      return;
  }

  // Filter out only the buttons which are pressed
  const pressedButtons = gamepad.buttons
      .map((button, id) => ({id, button}))
      .filter(isPressed);

  // Print the pressed buttons
  for (const button of pressedButtons) {
    //console.log(gamepad);
      console.log(button);
      console.log(`Button ${button.id} was pressed.`)
  }

}

function isPressed({button: {pressed}}) {
  return !!pressed;
}

function App() {

  const refreshRate = 100;
  const output = document.getElementById('output');

  setInterval(getGamepadState, refreshRate);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and sdsd to reload. Add Petteri stuff and uujee
        </p>
        <p id="gamepad-info">Waiting for Gamepad.</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
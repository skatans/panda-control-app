function handleGamepadConnection(event, interval, controllerLoop) {
  var gp = navigator.getGamepads()[event.gamepad.index];
  document.querySelector('#round-button').className = 'connected';
  document.querySelector('#gamepad-status').textContent = 'Gamepad: '+ gp.id;

  // Interval to poll and send controller input
  interval = setInterval(controllerLoop, 60);
  
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    gp.index, gp.id,
    gp.buttons.length, gp.axes.length);
  console.log(gp.buttons);
}

function handleGamepadDisconnection(event, interval) {
  console.log(`Gamepad disconnected !`)
  document.querySelector('#gamepad-status').textContent = 'Gamepad disconnected !';
  interval = clearInterval();
}

function toggleMessageWindow(){
  if (document.querySelector('#message-card').className == "d-none"){
    document.querySelector('#message-card').className = "bg-light"
  }
  else {
    document.querySelector('#message-card').className = "d-none";
  }
}

/* --------------------------------
      KEYBOARD CONTROLS
    
  Not yet implemented
---------------------------------- */

const handleKeyDown = (event) => {
    const keyName = event.key;

  if (keyName === 'w' || keyName === 'a' || keyName === 's' || keyName === 'd') {
    console.log(`Key pressed ${keyName}`);
  }
  else if (keyName === 'Escape' || keyName === 'Home') {
    toggleMessageWindow();
  }
};

const handleKeyUp = (event) => {
    const keyName = event.key;

  if (keyName === 'w' || keyName === 'a' || keyName === 's' || keyName === 'd') {
    //console.log(`Key up ${keyName}`);
  }
  else {
    //console.log("Some other key is up");
  }
};

export { handleKeyDown, handleKeyUp, handleGamepadConnection, handleGamepadDisconnection, toggleMessageWindow }
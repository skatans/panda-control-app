function getValueFromController(element, gp){
  if (element.axis){
    
    console.log(gp.axes[element.gpindex]);
    return gp.axes[element.gpindex];
  }
  else {
    return gp.buttons[element.gpindex].value;
  }
}

function simplifyValue(value){
value = Number.parseFloat(value).toFixed(1);
if ((value <= 0.1) && (value >= -0.1)){value = 0;}
return value;
}


const defaultButtonState = {
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
  
const defaultAxisState = {
  0: {name: "leftStick", controls: "linearY", invert: false, value: 0, previousValue: 0},
  1: {name: "leftStick", controls: "linearX", invert: true, value: 0, previousValue: 0},
  2: {name: "leftTrigger", controls: "linearZ", invert: false, value: 0, previousValue: 0}, // linearZ-2
  3: {name: "rightStick", controls: "angularX", invert: false, value: 0, previousValue: 0},
  4: {name: "rightStick", controls: "angularY", invert: false, value: 0, previousValue: 0},
  5: {name: "rightTrigger", controls: "linearZ", invert: false, value: 0, previousValue: 0}, // linearZ-5
  6: {name: "leftStick", controls: "linearX", invert: false, value: 0, previousValue: 0},
  7: {name: "leftStick", controls: "angularZ", invert: false, value: 0, previousValue: 0}
}
  
  // button conf for windows/mac
const gpState = {
  0:  {category: "button", button: true, axis:false, gpindex: 0, name: "X/A", controls: "gripper", invert: true, pressed: false, value: 0, previousValue: 0},
  1:  {category: "button", button: true, axis:false, gpindex: 1, name: "O/B", controls: "gripper", invert: true, pressed: false, value: 1, previousValue: 0},
  2:  {category: "button", button: true, axis:false, gpindex: 2, name: "TR/X", controls: "panda_joint5", invert: false, pressed: false, value: 0, previousValue: 0},
  3:  {category: "button", button: true, axis:false, gpindex: 3, name: "SQ/Y", controls: "panda_joint5", invert: true, pressed: false, value: 0, previousValue: 0},
  4:  {category: "button", button: true, axis:false, gpindex: 4, name: "L1", controls: "panda_joint1", invert: false, pressed: false, value: 0, previousValue: 0},
  5:  {category: "button", button: true, axis:false, gpindex: 5, name: "R1", controls: "panda_joint1", invert: true, pressed: false, value: 0, previousValue: 0},
  6:  {category: "axis", button: true, axis:false, gpindex: 6, name: "L2", controls: "linearZ", invert: false, value: 0, previousValue: 0},
  7:  {category: "axis", button: true, axis:false, gpindex: 7, name: "R2", controls: "linearZ", invert: true, value: 0, previousValue: 0},
  8:  {category: "button", button: true, axis:false, gpindex: 8, name: "home", controls: null, pressed: false, value: 0, previousValue: 0},
  9:  {category: "button", button: true, axis:false, gpindex: 9, name: "start", controls: null, pressed: false, value: 0, previousValue: 0},
  10: {category: "button", button: true, axis:false, gpindex: 10, name: "power", controls: null, pressed: false, value: 0, previousValue: 0},
  11: {category: "button", button: true, axis:false, gpindex: 11, name: "LS", controls: null, pressed: false, value: 0, previousValue: 0},
  12: {category: "button", button: true, axis:false, gpindex: 12, name: "dpUp", controls: "panda_joint6", pressed: false, invert: false, value: 0, previousValue: 0},
  13: {category: "button", button: true, axis:false, gpindex: 13, name: "dpDown", controls: "panda_joint6", pressed: false, invert: true, value: 0, previousValue: 0},
  14: {category: "button", button: true, axis:false, gpindex: 14, name: "dpLeft", controls: "panda_joint7", pressed: false, invert: true, value: 0, previousValue: 0},
  15: {category: "button", button: true, axis:false, gpindex: 15, name: "dpRight", controls: "panda_joint7", pressed: false, invert: false, value: 0, previousValue: 0},
  16: {category: "button", button: true, axis:false, gpindex: 16, name: "rightStick", controls: null, pressed: false, invert: false, value: 0, previousValue: 0},
  17: {category: "axis", button: false, axis:true, gpindex: 0, name: "lStickLR", controls: "linearY", pressed: false, invert: false, value: 0, previousValue: 0},
  18: {category: "axis", button: false, axis:true, gpindex: 1, name: "lStickUD", controls: "linearX", pressed: false, invert: true, value: 0, previousValue: 0},
  19: {category: "axis", button: false, axis:true, gpindex: 2, name: "rStickLR", controls: "angularX", pressed: false, invert: false, value: 0, previousValue: 0},
  10: {category: "axis", button: false, axis:true, gpindex: 3, name: "rStickUR", controls: "angularY", pressed: false, invert: false, value: 0, previousValue: 0}
}
  
// button conf for ubuntu
const defaultGamePadStateUbuntu = {
  0:  {category: "button", button: true, axis:false, gpindex: 0, name: "X/A", controls: "gripper", invert: true, pressed: false, value: 0, previousValue: 0},
  1:  {category: "button", button: true, axis:false, gpindex: 1, name: "O/B", controls: "gripper", invert: true, pressed: false, value: 1, previousValue: 0},
  2:  {category: "button", button: true, axis:false, gpindex: 2, name: "TR/X", controls: null, invert: true, pressed: false, value: 0, previousValue: 0},
  3:  {category: "button", button: true, axis:false, gpindex: 3, name: "SQ/Y", controls: null, invert: true, pressed: false, value: 0, previousValue: 0},
  4:  {category: "button", button: true, axis:false, gpindex: 4, name: "L1", controls: "panda_joint1", invert: true, pressed: false, value: 0, previousValue: 0},
  5:  {category: "button", button: true, axis:false, gpindex: 5, name: "R1", controls: "panda_joint1", invert: true, pressed: false, value: 0, previousValue: 0},
  6:  {category: "axis", button: false, axis:true, gpindex: 4, name: "L2", controls: "linearZ", invert: false, value: 0, previousValue: 0},
  7:  {category: "axis", button: false, axis:true, gpindex: 5, name: "R2", controls: "linearZ", invert: true, value: 0, previousValue: 0},
  8:  {category: "button", button: true, axis:false, gpindex: 8, name: "home", controls: null, pressed: false, value: 0, previousValue: 0},
  9:  {category: "button", button: true, axis:false, gpindex: 9, name: "start", controls: null, pressed: false, value: 0, previousValue: 0},
  10: {category: "button", button: true, axis:false, gpindex: null, name: "power", controls: null, pressed: false, value: 0, previousValue: 0},
  11: {category: "button", button: true, axis:false, gpindex: null, name: "LS", controls: null, pressed: false, value: 0, previousValue: 0},
  12: {category: "button", button: true, axis:false, gpindex: null, name: "dpUp", controls: null, pressed: false, value: 0, previousValue: 0},
  13: {category: "button", button: true, axis:false, gpindex: 8, name: "dpDown", controls: null, pressed: false, invert: false, value: 0, previousValue: 0},
  14: {category: "button", button: true, axis:false, gpindex: 8, name: "dpLeft", controls: "panda_joint7", pressed: false, invert: true, value: 0, previousValue: 0},
  15: {category: "button", button: true, axis:false, gpindex: 8, name: "dpRight", controls: "panda_joint7", pressed: false, invert: false, value: 0, previousValue: 0},
  16: {category: "button", button: true, axis:false, gpindex: 8, name: "rightStick", controls: null, pressed: false, invert: false, value: 0, previousValue: 0},
  17: {category: "axis", button: false, axis:true, gpindex: 0, name: "lStickLR", controls: "linearY", pressed: false, invert: false, value: 0, previousValue: 0},
  18: {category: "axis", button: false, axis:true, gpindex: 1, name: "lStickUD", controls: "linearX", pressed: false, invert: true, value: 0, previousValue: 0},
  19: {category: "axis", button: false, axis:true, gpindex: 2, name: "rStickLR", controls: "angularX", pressed: false, invert: false, value: 0, previousValue: 0},
  10: {category: "axis", button: false, axis:true, gpindex: 3, name: "rStickUR", controls: "angularY", pressed: false, invert: false, value: 0, previousValue: 0}
}

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

var defaultControlMessage = {
  type: "controller",
  linearX: 0,
  linearY: 0,
  linearZ: 0,
  angularX: 0,
  angularY: 0,
  angularZ: 0
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

export { defaultButtonState, defaultAxisState, gpState, defaultGamePadStateUbuntu, axes, controllerButtons, defaultControlMessage, getValueFromController, simplifyValue }
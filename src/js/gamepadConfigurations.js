// button conf for windows/mac
const gpState = {
  0:  {category: "gripper", button: true, axis:false, gpindex: 0, name: "X/A", controls: "gripper", invert: true, pressed: false, value: 0, previousValue: 0},
  1:  {category: "gripper", button: true, axis:false, gpindex: 1, name: "O/B", controls: "gripper", invert: true, pressed: false, value: 1, previousValue: 0},
  2:  {category: "other", button: true, axis:false, gpindex: 2, name: "TR/X", controls: "panda_joint5", invert: false, pressed: false, value: 0, previousValue: 0},
  3:  {category: "other", button: true, axis:false, gpindex: 3, name: "SQ/Y", controls: "panda_joint5", invert: true, pressed: false, value: 0, previousValue: 0},
  4:  {category: "joint", button: true, axis:false, gpindex: 4, name: "L1", controls: "panda_joint1", invert: false, pressed: false, value: 0, previousValue: 0},
  5:  {category: "joint", button: true, axis:false, gpindex: 5, name: "R1", controls: "panda_joint1", invert: true, pressed: false, value: 0, previousValue: 0},
  6:  {category: "axiscmd", button: true, axis:false, gpindex: 6, name: "L2", controls: "linearZ", invert: false, value: 0, previousValue: 0},
  7:  {category: "axiscmd", button: true, axis:false, gpindex: 7, name: "R2", controls: "linearZ", invert: true, value: 0, previousValue: 0},
  8:  {category: "other", button: true, axis:false, gpindex: 8, name: "home", controls: null, pressed: false, value: 0, previousValue: 0},
  9:  {category: "other", button: true, axis:false, gpindex: 9, name: "start", controls: null, pressed: false, value: 0, previousValue: 0},
  10: {category: "other", button: true, axis:false, gpindex: 10, name: "power", controls: null, pressed: false, value: 0, previousValue: 0},
  11: {category: "other", button: true, axis:false, gpindex: 11, name: "LS", controls: null, pressed: false, value: 0, previousValue: 0},
  12: {category: "joint", button: true, axis:false, gpindex: 12, name: "dpUp", controls: "panda_joint6", pressed: false, invert: false, value: 0, previousValue: 0},
  13: {category: "joint", button: true, axis:false, gpindex: 13, name: "dpDown", controls: "panda_joint6", pressed: false, invert: true, value: 0, previousValue: 0},
  14: {category: "joint", button: true, axis:false, gpindex: 14, name: "dpLeft", controls: "panda_joint7", pressed: false, invert: true, value: 0, previousValue: 0},
  15: {category: "joint", button: true, axis:false, gpindex: 15, name: "dpRight", controls: "panda_joint7", pressed: false, invert: false, value: 0, previousValue: 0},
  16: {category: "other", button: true, axis:false, gpindex: 16, name: "rightStick", controls: null, pressed: false, invert: false, value: 0, previousValue: 0},
  17: {category: "axiscmd", button: false, axis:true, gpindex: 0, name: "lStickLR", controls: "linearY", pressed: false, invert: false, value: 0, previousValue: 0},
  18: {category: "axiscmd", button: false, axis:true, gpindex: 1, name: "lStickUD", controls: "linearX", pressed: false, invert: true, value: 0, previousValue: 0},
  19: {category: "axiscmd", button: false, axis:true, gpindex: 2, name: "rStickLR", controls: "angularX", pressed: false, invert: false, value: 0, previousValue: 0},
  10: {category: "axiscmd", button: false, axis:true, gpindex: 3, name: "rStickUD", controls: "angularY", pressed: false, invert: false, value: 0, previousValue: 0}
}
  
// button conf for ubuntu
const defaultGamePadStateUbuntu = {
  0:  {category: "gripper", button: true, axis:false, gpindex: 0, name: "X/A", controls: "gripper", invert: true, pressed: false, value: 0, previousValue: 0},
  1:  {category: "gripper", button: true, axis:false, gpindex: 1, name: "O/B", controls: "gripper", invert: true, pressed: false, value: 1, previousValue: 0},
  2:  {category: "other", button: true, axis:false, gpindex: 2, name: "TR/X", controls: null, invert: true, pressed: false, value: 0, previousValue: 0},
  3:  {category: "other", button: true, axis:false, gpindex: 3, name: "SQ/Y", controls: null, invert: true, pressed: false, value: 0, previousValue: 0},
  4:  {category: "joint", button: true, axis:false, gpindex: 4, name: "L1", controls: "panda_joint1", invert: true, pressed: false, value: 0, previousValue: 0},
  5:  {category: "joint", button: true, axis:false, gpindex: 5, name: "R1", controls: "panda_joint1", invert: true, pressed: false, value: 0, previousValue: 0},
  6:  {category: "axiscmd", button: false, axis:true, gpindex: 2, name: "L2", controls: "linearZ", invert: false, value: 0, previousValue: 0, initialized: false},
  7:  {category: "axiscmd", button: false, axis:true, gpindex: 5, name: "R2", controls: "linearZ", invert: true, value: 0, previousValue: 0, initialized: false},
  8:  {category: "other", button: true, axis:false, gpindex: 6, name: "home", controls: null, pressed: false, value: 0, previousValue: 0},
  9:  {category: "other", button: true, axis:false, gpindex: 7, name: "start", controls: null, pressed: false, value: 0, previousValue: 0},
  10: {category: "other", button: true, axis:false, gpindex: null, name: "power", controls: null, pressed: false, value: 0, previousValue: 0},
  11: {category: "other", button: true, axis:false, gpindex: 9, name: "leftStick", controls: null, pressed: false, value: 0, previousValue: 0},
  12: {category: "other", button: false, axis:true, gpindex: null, name: "dpUp", controls: null, pressed: false, value: 0, previousValue: 0},
  13: {category: "other", button: false, axis:true, gpindex: null, name: "dpDown", controls: null, pressed: false, invert: false, value: 0, previousValue: 0},
  14: {category: "joint", button: false, axis:true, gpindex: null, name: "dpLeft", controls: "panda_joint7", pressed: false, invert: true, value: 0, previousValue: 0},
  15: {category: "joint", button: false, axis:true, gpindex: null, name: "dpRight", controls: "panda_joint7", pressed: false, invert: false, value: 0, previousValue: 0},
  16: {category: "other", button: true, axis:false, gpindex: 10, name: "rightStick", controls: null, pressed: false, invert: false, value: 0, previousValue: 0},
  17: {category: "axiscmd", button: false, axis:true, gpindex: 0, name: "lStickLR", controls: "linearY", pressed: false, invert: false, value: 0, previousValue: 0},
  18: {category: "axiscmd", button: false, axis:true, gpindex: 1, name: "lStickUD", controls: "linearX", pressed: false, invert: true, value: 0, previousValue: 0},
  19: {category: "axiscmd", button: false, axis:true, gpindex: 3, name: "rStickLR", controls: "angularX", pressed: false, invert: false, value: 0, previousValue: 0, initialized: false},
  10: {category: "axiscmd", button: false, axis:true, gpindex: 4, name: "rStickUD", controls: "angularY", pressed: false, invert: false, value: 0, previousValue: 0, initialized: false}
}

var defaultControlMessage = {
  type: "controller",
  linearX: 0,
  linearY: 0,
  linearZ: 0,
  angularX: 0,
  angularY: 0,
  angularZ: 0
};

export { gpState, defaultGamePadStateUbuntu, defaultControlMessage }
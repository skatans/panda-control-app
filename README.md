# Web app for panda robot arm control

Frontend component of Panda Control App

## About
Panda from Franka Emika is a robotic manipulator that is marketed as an easy collaborative robot. Thoe goal of this poject was to create a teleoperator for moving Panda. We decided to build a web-based UI that allows the control of Panda remotely via ZeroTier network. We set the following requirements:

* Must be able to grasp objects and move them from place A to place B (within the reach of the arm)
* Easy to use
* Shows live camera feed from the arm
* Allow intuitive control with and without external bluetooth gamepad (PS4, XBOX one)

During the process we had a bit more ambitious ideas of autonomous motion planning based on sensory data from lidar- and rgb-sensors, but we had to narrow our scope, as our resources were found to be too limited for that.

## Usage instructions
The app is used via browser. Navigate to the address where the app is hosted (by default port 3000). The site contains an image feed from the robot’s camera and two panels, one on each side of the image. The leftmost panel contains control buttons and three touch screen joystick elements that can also be used by dragging them with the cursor. The rightmost panel displays the data sent to the server as well as any messages received.

The most convenient way to use the app is to connect a gamepad controller.

## Controller
The app supports most common modern wireless gamepads. Once the control app is running in the browser, make sure the gamepad is connected to the computer and press any button while the browser window with the app is active. The gamepad connection info will change when the gamepad is detected.

The app has limited support for using multiple controllers simultaneously, and using only one controller at a time is recommended.

## Receiving and sending commands to backend
The app uses websockets (https://www.npmjs.com/package/websocket) to transfer messages between the frontend and backend. User input is parsed to structured JSON objects that include the type of message, name of the aspect or part to be controlled and a value. The value is always float or int.

## Linear XYZ and angular XYZ 
Linear and angular XYZ control messages are identified by the type “controller”. They are always sent as a full set of all 6 values, even if only one of them has changed. Reimplementing how the backend handles the incoming controller type message could potentially enable sending only relevant labels, which would allow for input from two different controllers to be sent without interfering with each other.

  `var defaultControlMessage = {
    type: "controller",
    linearX: 0,
    linearY: 0,
    linearZ: 0,
    angularX: 0,
    angularY: 0,
    angularZ: 0
  };  `

## Gripper actions
The gripper operation values include 1 and 0, where 1 closes the gripper and 0 opens it. The app sends the gripper command once when the corresponding button is pressed.

 ` var exampleGripperMessage = {
    type: "gripper",
    gripper: 0
  }; ` 

## Joint actions
The joint actions turn a single joint either clockwise or counter-clockwise. They include the command type, joint name and move value. The value indicates the speed and direction of the turn. The default turn values are 1.5 and -1.5, whilst 0 indicates stop. The app sends the turn command at a 60 Hz interval as long as the corresponding turn button is pressed, and a single 0 when it is released.

The app is configured by default to control the joints 1, 6 and 7.

 `var exampleJointMessage = {
    type: "joint",
    name: "panda_joint1",
    value: 0,
  };  `

The frontend also has means to display messages sent from the backend to the user.

## Web camera feed
The camera feed is streamed through a separate web socket. Cross-Origin Resource Sharing has been enabled both in the backend and the frontend for the stream to be available. For more information, visit the websocket documentation. If the camera feed is slow, make sure that only one frontend client is connected to the backend.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

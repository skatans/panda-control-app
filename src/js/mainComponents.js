import 'bootstrap/dist/css/bootstrap.min.css';
import { operateGripper, manualInputHandler } from './browserCommands.js'
import { Card, Button, ButtonGroup } from 'react-bootstrap';
import { Joystick } from 'react-joystick-component';
import socketIOClient from "socket.io-client";
import {Component, React } from 'react'
import env from "react-dotenv";

/* --------------------------------
      DISPLAY SENT MESSAGES & SERVER STATUS
---------------------------------- */

class ServerStatus extends Component {
    render() {
      return (
        <Card style={{ width: '20rem' }} className="align-self-center">
        <Card.Header>Server status</Card.Header>
        
        <Card.Body>
          <Card.Title>Connection</Card.Title>
          <Card.Text id="server-info">Not connected</Card.Text>
          <Card.Title>Last sent message</Card.Title>
          <Card.Text id="client-message">No messages sent.</Card.Text>
          <Card.Title>Messages from server</Card.Title>
          <Card.Text id="server-message">No messages from server</Card.Text>
        </Card.Body>
        </Card>
      )
    }
  }

/* --------------------------------
      DISPLAY WEBCAM STREAM
---------------------------------- */

const socket = socketIOClient(env.VIDEO, {
    withCredentials: false
    });

socket.on('image', (image) => { //capture 'image'-messages and as they're already encoded as jpg, no need to handle encoding/decoding stuff
    const imageElm = document.getElementById('image');
    imageElm.src = 'data:image/jpeg;base64,'+image;
});

class Visualization extends Component {
    componentDidMount() {
    
    }
    render() {
    return (
        <div>
        <img id="image"></img>

        </div>

    )
    }
}

/* --------------------------------
      CONTROL ELEMENT
---------------------------------- */

class ControllerStatus extends Component {

    render() {
      return (
        <Card style={{ width: '20rem' }} className="align-self-center">
        <Card.Header>Arm control</Card.Header>
          <Card.Body className='d-flex justify-content-around flex-column'>
  
            <Card.Subtitle className="mb-2 text-muted">Gripper actions</Card.Subtitle>
            
            <ButtonGroup className="me-2" aria-label="Gripper buttons">
              <Button variant="primary" onClick={ () => operateGripper(0, this.props.messageCallback) }>Open gripper</Button>
              <Button variant="primary" onClick={ () => operateGripper(1, this.props.messageCallback) }>Close gripper</Button>
            </ButtonGroup> 
            <ButtonGroup className="me-2" aria-label="Y axis buttons">
              <Button  variant="outline-primary" onClick={ () => manualInputHandler("joint", "panda_joint7", 1, this.props.messageCallback) }>Rotate left</Button>
              <Button variant="outline-primary" onClick={ () => manualInputHandler("joint", "panda_joint7", -1, this.props.messageCallback) }>Rotate right</Button>
            </ButtonGroup>
          </Card.Body>
  
          <Card.Subtitle className="mb-2 text-muted">Linear XY -- Linear ZY -- Angular XY</Card.Subtitle>
  
          <Card.Body className='d-flex justify-content-around'>
            <Joystick 
              move={(update) => this.props.signalConverter.onMove(update, ["linearX", "linearY"])} 
              start={(update) => this.props.signalConverter.onMove(update, ["linearX", "linearY"])} 
              stop={(update) => this.props.signalConverter.onStop(update)}>
            </Joystick>
            <Joystick baseColor={"#226699"} stickColor={"#8899DD"} 
              move={(update) => this.props.signalConverter.onMove(update, ["linearZ", "linearY"])} 
              start={(update) => this.props.signalConverter.onMove(update, ["linearZ", "linearY"])} 
              stop={(update) => this.props.signalConverter.onStop(update)}>
            </Joystick>
            <Joystick move={(update) => this.props.signalConverter.onMove(update, ["angularY", "angularX"])} 
              start={(update) => this.props.signalConverter.onMove(update, ["angularY", "angularX"])} 
              stop={(update) => this.props.signalConverter.onStop(update)}>
            </Joystick>
          </Card.Body>
  
          <Card.Body className='d-flex justify-content-around'>
            <ButtonGroup className="me-2" aria-label="Y axis buttons">
              <Button  variant="primary" onClick={ () => manualInputHandler("joint", "panda_joint1", 1, this.props.messageCallback) }>Rotate base left</Button>
              <Button variant="primary" onClick={ () => manualInputHandler("joint", "panda_joint1", -1, this.props.messageCallback) }>Rotate base right</Button>
            </ButtonGroup>
          </Card.Body>
        <Card.Body>
          <Card.Text id="gamepad-status">Waiting for Gamepad.</Card.Text>
          <div id="round-button"></div>
          <p id="button-info"></p>
       
        </Card.Body>
        </Card>
      )
    }
  }

export { ServerStatus, Visualization, ControllerStatus }
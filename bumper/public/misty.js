// misty.js

const MISTY_IP = "10.134.71.237"; // Replace with Misty's IP address
const WEBSOCKET_URL = `ws://${MISTY_IP}/pubsub`;

// WebSocket connection
let socket;

// Function to initialize the WebSocket connection
function initWebSocket() {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log("WebSocket connection established.");

      // Subscribe to the BumperSensor event
      sendCommand("subscribe", {
        Type: "BumpSensor",
        EventName: "BumperSensor",
        Message: "",
        DebounceMs: 100
      });

      resolve();
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
      // Retry the connection after a delay
      setTimeout(() => {
        console.log("Retrying WebSocket connection...");
        initWebSocket().then(resolve).catch(reject);
      }, 3000); // Retry after 3 seconds
    };

    // Handle incoming WebSocket messages
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received data:", data);

      // Check if the message is a BumperSensor event
      if (data.eventName === "BumperSensor") {
        const bumper = data.message.sensorPosition; // e.g., "FrontLeft", "FrontRight", "BackLeft", "BackRight"
        const isContact = data.message.isContact; // true if pressed, false if released

        // Update the UI and perform actions based on the bumper pressed
        handleBumperPress(bumper, isContact);
      }
    };
  });
}

// Function to send commands to Misty
function sendCommand(command, parameters = {}) {
  const message = {
    Operation: command,
    ...parameters
  };
  console.log("Sending command:", message);

  // Check if the WebSocket connection is open
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket is not open. Current state:", socket.readyState);
  }
}

// Function to handle bumper press events
function handleBumperPress(bumper, isContact) {
  const statusElement = getBumperStatusElement(bumper);
  if (!statusElement) return;

  if (isContact) {
    console.log(`${bumper} bumper pressed!`);
    statusElement.textContent = "Pressed";
    statusElement.style.color = "red";

    // Perform actions based on the bumper pressed
    switch (bumper) {
      case "bfl":
        sendCommand("Speak", { Text: "Front Left bumper pressed!" });
        sendCommand("ChangeLED", { Red: 255, Green: 0, Blue: 0 }); // Red LED
        sendCommand("MoveHead", { Pitch: 10, Roll: 0, Yaw: 20 }); // Tilt head slightly
        sendCommand("MoveArm", { Arm: "left", Position: 90 }); // Raise left arm
        break;

      case "bfr":
        sendCommand("Speak", { Text: "Front Right bumper pressed!" });
        sendCommand("ChangeLED", { Red: 0, Green: 255, Blue: 0 }); // Green LED
        sendCommand("MoveHead", { Pitch: -10, Roll: 0, Yaw: -20 }); // Tilt head slightly
        sendCommand("MoveArm", { Arm: "right", Position: 90 }); // Raise right arm
        break;

      case "brl":
        sendCommand("Speak", { Text: "Back Left bumper pressed!" });
        sendCommand("ChangeLED", { Red: 0, Green: 0, Blue: 255 }); // Blue LED
        sendCommand("MoveHead", { Pitch: 20, Roll: 10, Yaw: 30 }); // Tilt head more
        sendCommand("MoveArm", { Arm: "left", Position: -90 }); // Lower left arm
        break;

      case "brr":
        sendCommand("Speak", { Text: "Back Right bumper pressed!" });
        sendCommand("ChangeLED", { Red: 255, Green: 255, Blue: 0 }); // Yellow LED
        sendCommand("MoveHead", { Pitch: -20, Roll: 0, Yaw: -30 }); // Tilt head down
        sendCommand("MoveArm", { Arm: "right", Position: -90 }); // Lower right arm
        break;

      default:
        console.log("Unknown bumper pressed:", bumper);
        break;
    }
  } else {
    console.log(`${bumper} bumper released.`);
    statusElement.textContent = "Not Pressed";
    statusElement.style.color = "black";

    // Reset actions when the bumper is released
    switch (bumper) {
      case "FrontLeft":
      case "FrontRight":
      case "BackLeft":
      case "BackRight":
        sendCommand("ChangeLED", { Red: 0, Green: 0, Blue: 0 }); // Turn off LED
        sendCommand("MoveHead", { Pitch: 0, Roll: 0, Yaw: 0 }); // Reset head position
        sendCommand("MoveArm", { Arm: "both", Position: 0 }); // Reset arms to neutral
        break;
    }
  }
}

// Function to get the corresponding status element for a bumper
function getBumperStatusElement(bumper) {
  switch (bumper) {
    case "FrontLeft":
      return document.getElementById("frontLeftStatus");
    case "FrontRight":
      return document.getElementById("frontRightStatus");
    case "BackLeft":
      return document.getElementById("backLeftStatus");
    case "BackRight":
      return document.getElementById("backRightStatus");
    default:
      return null;
  }
}

// Initialize the WebSocket connection when the page loads
initWebSocket().then(() => {
  console.log("WebSocket connection is ready.");
}).catch((error) => {
  console.error("Failed to initialize WebSocket connection:", error);
});
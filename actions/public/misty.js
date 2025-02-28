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
      resolve();
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      reject(error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };
  });
}

// Sentences to be spoken
const sentences = [
  "This is the first sentence.",
  "This is the second sentence.",
  "This is the third sentence."
];

// Current sentence index
let currentSentenceIndex = 0;

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

// Function to speak the next sentence
function speakNextSentence() {
  const sentence = sentences[currentSentenceIndex];
  console.log(`Speaking: ${sentence}`);
  sendCommand("Speak", { Text: sentence });

  // After speaking, say "Let's go to the next sentence"
  setTimeout(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      sendCommand("Speak", { Text: "Let's go to the next sentence." });
    }
  }, 3000); // Wait 3 seconds before saying the next prompt
}

// Start button click handler
async function startSequence() {
  console.log("Start button clicked.");
  currentSentenceIndex = 0; // Reset to the first sentence

  // Ensure the WebSocket connection is open
  if (socket.readyState !== WebSocket.OPEN) {
    console.log("WebSocket is not open. Reconnecting...");
    await initWebSocket();
  }

  speakNextSentence();
}

// Define actions
const actions = [
  {
    face: "e_DefaultContent.jpg", // Neutral expression
    arms: 90, // Arms up
    head: { pitch: 10, roll: 0, yaw: 20 }, // Head tilted slightly
    audio: "expression_1.mp3", // Audio for Action 1
    led: { red: 255, green: 255, blue: 255 } // White LED
  },
  {
    face: "e_Joy.jpg", // Happy expression
    arms: -90, // Arms down
    head: { pitch: -10, roll: 0, yaw: -20 }, // Head tilted slightly
    audio: "expression_2.mp3", // Audio for Action 2
    led: { red: 0, green: 255, blue: 0 } // Green LED
  },
  {
    face: "e_Amazement.jpg", // Surprised expression
    arms: 45, // Arms halfway up
    head: { pitch: 0, roll: 0, yaw: 0 }, // Head straight
    audio: "expression_3.mp3", // Audio for Action 3
    led: { red: 255, green: 0, blue: 0 } // Red LED
  },
  {
    face: "e_Disoriented.jpg", // Confused expression
    arms: 0, // Arms neutral
    head: { pitch: 20, roll: 10, yaw: 30 }, // Head tilted more
    audio: "expression_4.mp3", // Audio for Action 4
    led: { red: 255, green: 165, blue: 0 } // Orange LED
  },
  {
    face: "e_Sleeping.jpg", // Sleeping expression
    arms: -45, // Arms halfway down
    head: { pitch: -20, roll: 0, yaw: -30 }, // Head tilted down
    audio: "expression_5.mp3", // Audio for Action 5
    led: { red: 0, green: 0, blue: 255 } // Blue LED
  }
];

// Function to perform an action
function performAction(index) {
  const action = actions[index];
  if (!action) return;

  // Display facial expression (image)
  fetch(`http://${MISTY_IP}/api/images/display`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ FileName: action.face })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Facial expression request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Facial expression response:", data);
  })
  .catch(error => {
    console.error("Error changing facial expression:", error);
  });

  // Move arms
  fetch(`http://${MISTY_IP}/api/arms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Arm: "both", Position: action.arms })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Arm movement request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Arm movement response:", data);
  })
  .catch(error => {
    console.error("Error moving arms:", error);
  });

  // Move head
  fetch(`http://${MISTY_IP}/api/head`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Pitch: action.head.pitch, Roll: action.head.roll, Yaw: action.head.yaw })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Head movement request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Head movement response:", data);
  })
  .catch(error => {
    console.error("Error moving head:", error);
  });

  // Change LED color
  fetch(`http://${MISTY_IP}/api/led`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Red: action.led.red, Green: action.led.green, Blue: action.led.blue })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`LED request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("LED response:", data);
  })
  .catch(error => {
    console.error("Error changing LED color:", error);
  });

  // Play audio
  fetch(`http://${MISTY_IP}/api/audio/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ FileName: action.audio })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Audio request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Audio response:", data);
  })
  .catch(error => {
    console.error("Error playing audio:", error);
  });

  // Show status icon
  document.getElementById("status-icon").style.display = "block";
}

// Initialize the WebSocket connection when the page loads
initWebSocket().then(() => {
  console.log("WebSocket connection is ready.");

  // Attach event listeners to action buttons
  document.getElementById("actionButton1").addEventListener("click", () => performAction(0));
  document.getElementById("actionButton2").addEventListener("click", () => performAction(1));
  document.getElementById("actionButton3").addEventListener("click", () => performAction(2));
  document.getElementById("actionButton4").addEventListener("click", () => performAction(3));
  document.getElementById("actionButton5").addEventListener("click", () => performAction(4));

  // Attach event listener to the start button
  document.getElementById("startButton").addEventListener("click", startSequence);
}).catch((error) => {
  console.error("Failed to initialize WebSocket connection:", error);
});
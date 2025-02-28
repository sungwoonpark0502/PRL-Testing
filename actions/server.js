import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';
import fs from 'fs';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const MISTY_IP = "10.134.71.237"; // Replace with Misty's IP address

// Load actions from JSON file
const actions = JSON.parse(fs.readFileSync('expressions.json')).actions;

// Serve static files (e.g., index.html)
app.use(express.static('public'));

// Proxy API requests to Misty
app.use('/api', async (req, res) => {
  const url = `http://${MISTY_IP}${req.url}`;
  const options = {
    method: req.method,
    headers: req.headers,
    body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to communicate with Misty" });
  }
});

// WebSocket connection for real-time communication
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Forward the message to Misty (if needed)
    ws.send(JSON.stringify({ type: "audio_done" }));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
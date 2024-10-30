// Load environment variables from .env only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const axios = require('axios');
const ACTIONS = require('./src/Actions');

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Create HTTP server and initialize Socket.IO without CORS configuration
const server = http.createServer(app);
const io = new Server(server);

// API Endpoint for code compilation
app.post('/api/compile', async (req, res) => {
  const { sourceCode, languageId, stdin } = req.body;
  const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Ensure RAPIDAPI_KEY is set in your environment variables

  try {
    // Corrected axios POST request
    const response = await axios.post(
      `${JUDGE0_API_URL}?base64_encoded=true&wait=true`,
      {
        source_code: Buffer.from(sourceCode).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin || '').toString('base64'),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error compiling code:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error compiling code.' });
  }
});

// Socket.IO Event Handling (code sync, room management, etc.)
const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

// Fallback to serve React app for all unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

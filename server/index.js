require('dotenv').config();
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const apiRoutes = require('./routes');
const SocketHandler = require('./services/socketHandler');
const requestLogger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : '*';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, timestamp: Date.now() }));

// API Routes (MVC controllers and REST endpoints)
app.use('/api', apiRoutes);

// Serve frontend in production
const distDir = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

// Global error handlers
app.use(notFound);
app.use(errorHandler);

// HTTP and Socket.IO Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const socketHandler = new SocketHandler(io);
io.on('connection', (socket) => socketHandler.attach(socket));
socketHandler.startHeartbeat();

server.listen(PORT, () => {
  console.log(`[WatchParty Server] Running on http://localhost:${PORT}`);
  console.log(`[WatchParty Server] API endpoints available at http://localhost:${PORT}/api`);
});

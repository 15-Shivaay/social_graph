require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { WebSocketServer } = require('ws');

const usersRouter = require('./routes/users');
const friendsRouter = require('./routes/friends');
const graphRouter = require('./routes/graph');

const app = express();
const server = http.createServer(app);

// ─── WebSocket for real-time updates ────────────────────────────────────────
const wss = new WebSocketServer({ server });
const broadcast = (data) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify(data));
  });
};
app.set('broadcast', broadcast);

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Social Graph' }));
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// Broadcast middleware — fires after mutations
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (['POST', 'DELETE', 'PUT', 'PATCH'].includes(req.method)) {
      broadcast({ type: 'update', endpoint: req.path, method: req.method });
    }
    return originalJson(data);
  };
  next();
});

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/users', usersRouter);
app.use('/friends', friendsRouter);
app.use('/graph', graphRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ─── DB + Start ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/socialgraph';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = { app, broadcast };

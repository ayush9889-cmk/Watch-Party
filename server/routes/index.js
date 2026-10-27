const express = require('express');
const router = express.Router();

const roomRoutes = require('./roomRoutes');
const messageRoutes = require('./messageRoutes');
const requestRoutes = require('./requestRoutes');

router.use('/rooms', roomRoutes);
router.use('/rooms/:code/messages', messageRoutes);
router.use('/rooms/:code/requests', requestRoutes);

router.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

module.exports = router;

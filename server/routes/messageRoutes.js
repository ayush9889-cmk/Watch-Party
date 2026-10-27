const express = require('express');
const router = express.Router({ mergeParams: true });
const messageController = require('../controllers/messageController');

router.get('/', messageController.getRoomMessages);
router.post('/', messageController.postMessage);

module.exports = router;

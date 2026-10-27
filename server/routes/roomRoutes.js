const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.post('/', roomController.createRoom);
router.get('/', roomController.getAllRooms);
router.get('/:code', roomController.getRoom);
router.put('/:code/video', roomController.updateVideo);

module.exports = router;

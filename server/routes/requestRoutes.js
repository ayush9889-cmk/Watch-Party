const express = require('express');
const router = express.Router({ mergeParams: true });
const requestController = require('../controllers/requestController');

router.get('/', requestController.getRoomRequests);

module.exports = router;

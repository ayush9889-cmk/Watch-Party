const roomService = require('../services/roomService');

const getRoomRequests = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { userId } = req.query;
    const room = await roomService.getRoom(code);
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' });
    }

    const requests = userId ? room.requestsFor(userId) : [...room.requests.values()];
    res.json({ ok: true, requests });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoomRequests,
};

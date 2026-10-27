const roomService = require('../services/roomService');

const getRoomMessages = async (req, res, next) => {
  try {
    const { code } = req.params;
    const messages = await roomService.getRecentChat(code);
    res.json({ ok: true, messages });
  } catch (error) {
    next(error);
  }
};

const postMessage = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { userId, text } = req.body;
    const room = await roomService.getRoom(code);
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' });
    }

    const cleanText = String(text || '').trim().slice(0, 500);
    if (!cleanText) {
      return res.status(400).json({ ok: false, error: 'Text cannot be empty' });
    }

    const msg = room.addChat(userId, cleanText);
    await roomService.persistMessage(msg);

    res.status(201).json({ ok: true, message: msg });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoomMessages,
  postMessage,
};

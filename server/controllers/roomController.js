const roomService = require('../services/roomService');
const { DEFAULT_VIDEO } = require('../utils/constants');

const createRoom = async (req, res, next) => {
  try {
    const { username, userId, title, videoId } = req.body;
    if (!username || !userId) {
      return res.status(400).json({ ok: false, error: 'Username and userId are required' });
    }

    const room = await roomService.createRoom({
      username: username.trim(),
      userId: String(userId),
      title: title ? title.trim() : 'Watch Party',
      videoId: videoId || DEFAULT_VIDEO,
    });

    res.status(201).json({
      ok: true,
      room: {
        code: room.id,
        title: room.title,
        state: room.getState(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRoom = async (req, res, next) => {
  try {
    const { code } = req.params;
    const room = await roomService.getRoom(code);
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' });
    }

    res.json({
      ok: true,
      room: {
        code: room.id,
        title: room.title,
        state: room.getState(),
        participants: room.list(),
        participantCount: room.participants.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.listActiveRooms();
    res.json({ ok: true, rooms });
  } catch (error) {
    next(error);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { videoId, videoTitle } = req.body;
    const room = await roomService.getRoom(code);
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' });
    }

    const success = room.applyAction('change_video', { videoId, videoTitle });
    if (!success) {
      return res.status(400).json({ ok: false, error: 'Invalid video ID' });
    }

    await roomService.syncRoomStateToDb(room);
    res.json({ ok: true, state: room.getState() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRoom,
  getAllRooms,
  updateVideo,
};

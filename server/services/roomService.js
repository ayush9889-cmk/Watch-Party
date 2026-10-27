const crypto = require('crypto');
const RoomModel = require('../models/Room');
const MessageModel = require('../models/Message');
const RequestModel = require('../models/Request');
const Participant = require('../models/Participant');
const { ROLES, can } = require('../utils/roles');
const { DEFAULT_VIDEO, REQUEST_TYPES } = require('../utils/constants');
const { generateRoomCode } = require('../utils/codeGenerator');
const { isDbConnected } = require('../config/db');

/**
 * MemoryRoom encapsulates in-memory live state and syncs with MongoDB
 */
class MemoryRoom {
  constructor(id, title = 'Watch Party', hostId = '', hostName = 'Host') {
    this.id = id.toUpperCase();
    this.title = title;
    this.participants = new Map(); // userId -> Participant
    this.requests = new Map(); // requestId -> request
    this.chat = []; // recent chat cache
    this.hostId = hostId;
    this.state = {
      videoId: DEFAULT_VIDEO,
      videoTitle: 'YouTube Video',
      playState: 'paused',
      currentTime: 0,
      updatedAt: Date.now(),
    };
  }

  getParticipant(userId) {
    return this.participants.get(userId);
  }

  get host() {
    return [...this.participants.values()].find((p) => p.role === ROLES.HOST);
  }

  list() {
    return [...this.participants.values()].map((p) => p.toJSON());
  }

  addParticipant({ userId, username, socketId }) {
    const role = this.participants.size === 0 ? ROLES.HOST : ROLES.PARTICIPANT;
    const p = new Participant({ id: userId, username, role, socketId });
    this.participants.set(userId, p);
    if (role === ROLES.HOST) this.hostId = userId;
    return p;
  }

  removeParticipant(userId) {
    const p = this.participants.get(userId);
    if (!p) return { removed: null, newHost: null };
    clearTimeout(p.disconnectTimer);
    this.participants.delete(userId);
    for (const [id, r] of this.requests) {
      if (r.userId === userId) this.requests.delete(id);
    }

    let newHost = null;
    if (p.role === ROLES.HOST && this.participants.size > 0) {
      const rest = [...this.participants.values()].sort((a, b) => a.joinedAt - b.joinedAt);
      newHost = rest.find((x) => x.role === ROLES.MODERATOR) || rest[0];
      newHost.role = ROLES.HOST;
      this.hostId = newHost.id;
    }
    return { removed: p, newHost };
  }

  can(userId, action) {
    const p = this.participants.get(userId);
    return !!p && can(p.role, action);
  }

  assignRole(userId, role) {
    const p = this.participants.get(userId);
    if (p) p.role = role;
    return p;
  }

  transferHost(fromId, toId) {
    const from = this.participants.get(fromId);
    const to = this.participants.get(toId);
    if (from && to) {
      from.role = ROLES.MODERATOR;
      to.role = ROLES.HOST;
      this.hostId = to.id;
    }
    return { from, to };
  }

  currentTime() {
    const s = this.state;
    return s.playState === 'playing' ? s.currentTime + (Date.now() - s.updatedAt) / 1000 : s.currentTime;
  }

  getState() {
    return {
      videoId: this.state.videoId,
      videoTitle: this.state.videoTitle || 'YouTube Video',
      playState: this.state.playState,
      currentTime: this.currentTime(),
      serverTime: Date.now(),
      updatedAt: this.state.updatedAt,
    };
  }

  applyAction(type, payload = {}) {
    const t = Number(payload.time ?? payload.currentTime);
    const hasTime = Number.isFinite(t) && t >= 0;
    const now = Date.now();
    switch (type) {
      case 'play':
        this.state = {
          ...this.state,
          currentTime: hasTime ? t : this.currentTime(),
          playState: 'playing',
          updatedAt: now,
        };
        return true;
      case 'pause':
        this.state = {
          ...this.state,
          currentTime: hasTime ? t : this.currentTime(),
          playState: 'paused',
          updatedAt: now,
        };
        return true;
      case 'seek':
        if (!hasTime) return false;
        this.state = { ...this.state, currentTime: t, updatedAt: now };
        return true;
      case 'change_video':
        if (!/^[\w-]{11}$/.test(String(payload.videoId || ''))) return false;
        this.state = {
          ...this.state,
          videoId: payload.videoId,
          videoTitle: payload.videoTitle || 'YouTube Video',
          playState: 'playing',
          currentTime: 0,
          updatedAt: now,
        };
        return true;
      default:
        return false;
    }
  }

  createRequest(userId, type, payload) {
    const p = this.participants.get(userId);
    if (!p || !REQUEST_TYPES.includes(type)) return null;
    if (this.requests.size >= 50) return null;
    const clean = {};
    if (type === 'seek') clean.time = Number(payload.time);
    if (type === 'change_video') clean.videoId = String(payload.videoId || '');
    if (type === 'seek' && !(clean.time >= 0)) return null;
    if (type === 'change_video' && !/^[\w-]{11}$/.test(clean.videoId)) return null;

    const req = {
      id: crypto.randomBytes(4).toString('hex'),
      roomId: this.id,
      userId,
      username: p.username,
      type,
      payload: clean,
      status: 'pending',
      createdAt: Date.now(),
    };
    this.requests.set(req.id, req);
    return req;
  }

  requestsFor(userId) {
    const p = this.participants.get(userId);
    if (!p) return [];
    const all = [...this.requests.values()];
    return can(p.role, 'review_requests') ? all : all.filter((r) => r.userId === userId);
  }

  addChat(userId, text) {
    const p = this.participants.get(userId);
    const msg = {
      id: crypto.randomBytes(4).toString('hex'),
      roomId: this.id,
      userId,
      username: p ? p.username : 'Anonymous',
      role: p ? p.role : 'viewer',
      text,
      at: Date.now(),
    };
    this.chat.push(msg);
    if (this.chat.length > 100) this.chat.shift();
    return msg;
  }

  get isEmpty() {
    return this.participants.size === 0;
  }
}

class RoomService {
  constructor() {
    this.activeRooms = new Map(); // code -> MemoryRoom
  }

  async createRoom({ username, userId, title, videoId }) {
    let code;
    do {
      code = generateRoomCode(6);
    } while (this.activeRooms.has(code));

    const room = new MemoryRoom(code, title || 'Watch Party', userId, username);
    if (videoId && /^[\w-]{11}$/.test(videoId)) {
      room.state.videoId = videoId;
    }
    this.activeRooms.set(code, room);

    // Persist to MongoDB if connected
    if (isDbConnected()) {
      try {
        await RoomModel.create({
          code,
          title: room.title,
          videoId: room.state.videoId,
          hostId: userId,
          hostName: username,
          playState: room.state.playState,
          currentTime: room.state.currentTime,
        });
      } catch (err) {
        console.error('[RoomService] DB createRoom error:', err.message);
      }
    }

    return room;
  }

  async getRoom(code) {
    if (!code) return null;
    const cleanCode = String(code).trim().toUpperCase();
    let room = this.activeRooms.get(cleanCode);

    // If not in memory but DB is connected, restore it
    if (!room && isDbConnected()) {
      try {
        const doc = await RoomModel.findOne({ code: cleanCode, isActive: true });
        if (doc) {
          room = new MemoryRoom(doc.code, doc.title, doc.hostId, doc.hostName);
          room.state.videoId = doc.videoId;
          room.state.playState = doc.playState;
          room.state.currentTime = doc.currentTime;
          this.activeRooms.set(cleanCode, room);
        }
      } catch (err) {
        console.error('[RoomService] DB getRoom error:', err.message);
      }
    }

    return room;
  }

  async listActiveRooms() {
    const rooms = [];
    for (const [code, r] of this.activeRooms.entries()) {
      rooms.push({
        code,
        title: r.title,
        videoId: r.state.videoId,
        playState: r.state.playState,
        participantCount: r.participants.size,
        host: r.host ? r.host.username : 'Unknown',
        createdAt: r.state.updatedAt,
      });
    }

    // If memory is empty and DB is available, fetch recent from MongoDB
    if (rooms.length === 0 && isDbConnected()) {
      try {
        const docs = await RoomModel.find({ isActive: true }).sort({ updatedAt: -1 }).limit(10);
        return docs.map((d) => ({
          code: d.code,
          title: d.title,
          videoId: d.videoId,
          playState: d.playState,
          participantCount: d.participants.filter((p) => p.isOnline).length,
          host: d.hostName || 'Host',
          createdAt: d.updatedAt,
        }));
      } catch (err) {
        console.error('[RoomService] DB listActiveRooms error:', err.message);
      }
    }

    return rooms;
  }

  deleteIfEmpty(room) {
    if (room.isEmpty) {
      this.activeRooms.delete(room.id);
      if (isDbConnected()) {
        RoomModel.updateOne({ code: room.id }, { isActive: false }).catch(() => {});
      }
    }
  }

  playingRooms() {
    return [...this.activeRooms.values()].filter((r) => r.state.playState === 'playing');
  }

  // MongoDB sync helper
  async syncRoomStateToDb(room) {
    if (!isDbConnected() || !room) return;
    try {
      await RoomModel.updateOne(
        { code: room.id },
        {
          videoId: room.state.videoId,
          playState: room.state.playState,
          currentTime: room.currentTime(),
          participants: [...room.participants.values()].map((p) => ({
            userId: p.id,
            username: p.username,
            role: p.role,
            isOnline: p.online,
            socketId: p.socketId,
          })),
        }
      );
    } catch (err) {
      console.error('[RoomService] syncRoomStateToDb error:', err.message);
    }
  }

  // Chat message persistence
  async persistMessage(msg) {
    if (!isDbConnected() || !msg) return;
    try {
      await MessageModel.create({
        roomId: msg.roomId,
        userId: msg.userId,
        username: msg.username,
        role: msg.role,
        text: msg.text,
      });
    } catch (err) {
      console.error('[RoomService] persistMessage error:', err.message);
    }
  }

  // Request persistence
  async persistRequest(req) {
    if (!isDbConnected() || !req) return;
    try {
      await RequestModel.create({
        requestId: req.id,
        roomId: req.roomId,
        userId: req.userId,
        username: req.username,
        type: req.type,
        payload: req.payload,
        status: req.status || 'pending',
      });
    } catch (err) {
      console.error('[RoomService] persistRequest error:', err.message);
    }
  }

  async resolveRequestInDb(requestId, status, reviewedBy) {
    if (!isDbConnected()) return;
    try {
      await RequestModel.updateOne(
        { requestId },
        { status, reviewedBy, reviewedAt: new Date() }
      );
    } catch (err) {
      console.error('[RoomService] resolveRequestInDb error:', err.message);
    }
  }

  async getRecentChat(roomId) {
    if (isDbConnected()) {
      try {
        const msgs = await MessageModel.find({ roomId: roomId.toUpperCase() })
          .sort({ createdAt: -1 })
          .limit(50);
        return msgs.reverse().map((m) => ({
          id: m._id.toString(),
          roomId: m.roomId,
          userId: m.userId,
          username: m.username,
          role: m.role,
          text: m.text,
          at: m.createdAt.getTime(),
        }));
      } catch (err) {
        console.error('[RoomService] getRecentChat error:', err.message);
      }
    }
    const memRoom = this.activeRooms.get(roomId.toUpperCase());
    return memRoom ? memRoom.chat : [];
  }
}

module.exports = new RoomService();

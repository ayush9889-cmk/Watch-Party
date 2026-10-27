const { ROLES, ASSIGNABLE_ROLES, can } = require('../utils/roles');
const { ACTION_LABEL } = require('../utils/constants');
const roomService = require('./roomService');

const GRACE_MS = 15000;

class SocketHandler {
  constructor(io) {
    this.io = io;
  }

  attach(socket) {
    const on = (event, fn) => {
      socket.on(event, (payload, ack) => {
        const reply = typeof ack === 'function' ? ack : () => {};
        try {
          fn(payload && typeof payload === 'object' ? payload : {}, reply);
        } catch (err) {
          console.error(`[Socket:${event}]`, err);
          reply({ ok: false, error: 'Internal server error' });
        }
      });
    };

    const getContext = () => {
      const { roomId, userId } = socket.data || {};
      if (!roomId || !userId) return null;
      const room = roomService.activeRooms.get(roomId);
      const me = room && room.getParticipant(userId);
      return room && me ? { room, me } : null;
    };

    const authorise = (action, reply) => {
      const c = getContext();
      if (!c) {
        reply({ ok: false, error: 'You are not connected to a room' });
        return null;
      }
      if (!c.room.can(c.me.id, action)) {
        const isPrivileged = ['assign_role', 'remove_participant', 'transfer_host'].includes(action);
        const error = `Only the Host${isPrivileged ? '' : ' or a Moderator'} can ${ACTION_LABEL[action]}`;
        socket.emit('error_message', { message: error });
        reply({ ok: false, error });
        return null;
      }
      return c;
    };

    /* ===== ROOM LIFECYCLE ===== */

    on('create_room', async ({ username, userId, title, videoId }, reply) => {
      const name = this.cleanName(username);
      if (!name || !userId) return reply({ ok: false, error: 'Please enter a name first' });

      const room = await roomService.createRoom({
        username: name,
        userId: String(userId),
        title,
        videoId,
      });

      room.addParticipant({ userId: String(userId), username: name, socketId: socket.id });
      socket.join(room.id);
      socket.data = { roomId: room.id, userId: String(userId) };

      reply({ ok: true, roomId: room.id });
    });

    on('join_room', async ({ roomId, username, userId }, reply) => {
      const name = this.cleanName(username);
      if (!name || !userId) return reply({ ok: false, error: 'Please enter your name' });

      const room = await roomService.getRoom(roomId);
      if (!room) return reply({ ok: false, error: 'Room not found. Please verify the 6-character code.' });

      userId = String(userId);
      let participant = room.getParticipant(userId);
      const isNew = !participant;

      if (isNew) {
        participant = room.addParticipant({ userId, username: name, socketId: socket.id });
      } else {
        clearTimeout(participant.disconnectTimer);
        participant.socketId = socket.id;
        participant.username = name; // allow updating display name
      }

      socket.join(room.id);
      socket.data = { roomId: room.id, userId };

      // Load chat history from DB if in-memory chat is fresh
      let chatHistory = room.chat;
      if (chatHistory.length === 0) {
        chatHistory = await roomService.getRecentChat(room.id);
        room.chat = chatHistory;
      }

      if (isNew) {
        socket.to(room.id).emit('user_joined', {
          username: participant.username,
          userId,
          role: participant.role,
          participants: room.list(),
        });
      } else {
        this.io.to(room.id).emit('participants_updated', { participants: room.list() });
      }

      // Sync state to DB
      roomService.syncRoomStateToDb(room);

      reply({
        ok: true,
        roomId: room.id,
        roomTitle: room.title,
        you: { userId, username: participant.username, role: participant.role },
        participants: room.list(),
        state: room.getState(),
        requests: room.requestsFor(userId),
        chat: room.chat,
      });
    });

    on('leave_room', (_p, reply) => {
      this.leave(socket);
      reply({ ok: true });
    });

    socket.on('disconnect', () => {
      const c = getContext();
      if (!c) return;
      const { room, me } = c;
      if (me.socketId !== socket.id) return;
      me.socketId = null;
      this.io.to(room.id).emit('participants_updated', { participants: room.list() });
      me.disconnectTimer = setTimeout(() => this.removeUser(room, me.id, 'disconnected'), GRACE_MS);
    });

    /* ===== PLAYBACK ACTIONS (Host / Moderator) ===== */

    for (const action of ['play', 'pause', 'seek', 'change_video']) {
      on(action, async (payload, reply) => {
        const c = authorise(action, reply);
        if (!c) return;

        if (!c.room.applyAction(action, payload)) {
          return reply({ ok: false, error: 'Invalid playback value' });
        }

        const state = c.room.getState();
        this.io.to(c.room.id).emit('sync_state', state);
        roomService.syncRoomStateToDb(c.room);
        reply({ ok: true, state });
      });
    }

    on('request_sync', (_p, reply) => {
      const c = getContext();
      if (c) socket.emit('sync_state', c.room.getState());
      reply({ ok: !!c });
    });

    /* ===== PARTICIPANT REQUEST APPROVAL WORKFLOW ===== */

    on('request_action', async ({ type, payload }, reply) => {
      const c = getContext();
      if (!c) return reply({ ok: false, error: 'You are not in a room' });
      if (c.room.can(c.me.id, type)) return reply({ ok: false, error: 'You have direct permission to perform this action' });

      const req = c.room.createRequest(c.me.id, type, payload || {});
      if (!req) return reply({ ok: false, error: 'Could not create request. Please check values.' });

      await roomService.persistRequest(req);
      this.broadcastRequests(c.room);
      this.io.to(c.room.id).emit('request_created', { request: req });
      reply({ ok: true, request: req });
    });

    for (const [event, approve] of [['approve_request', true], ['reject_request', false]]) {
      on(event, async ({ requestId }, reply) => {
        const c = authorise('review_requests', reply);
        if (!c) return;

        const req = c.room.requests.get(requestId);
        if (!req) return reply({ ok: false, error: 'Request was already handled or expired' });

        c.room.requests.delete(requestId);
        const status = approve ? 'approved' : 'rejected';

        if (approve) {
          c.room.applyAction(req.type, req.payload);
          this.io.to(c.room.id).emit('sync_state', c.room.getState());
          roomService.syncRoomStateToDb(c.room);
        }

        await roomService.resolveRequestInDb(requestId, status, c.me.username);

        this.io.to(c.room.id).emit('request_resolved', {
          requestId,
          status,
          request: req,
          by: c.me.username,
        });

        this.broadcastRequests(c.room);
        reply({ ok: true });
      });
    }

    /* ===== ROLE & USER MANAGEMENT (Host only) ===== */

    on('assign_role', async ({ userId, role }, reply) => {
      const c = authorise('assign_role', reply);
      if (!c) return;

      const target = c.room.getParticipant(userId);
      if (!target) return reply({ ok: false, error: 'User not found in room' });
      if (target.id === c.me.id) return reply({ ok: false, error: 'You cannot change your own role' });
      if (!ASSIGNABLE_ROLES.includes(role)) return reply({ ok: false, error: 'Invalid role selection' });

      c.room.assignRole(target.id, role);
      this.io.to(c.room.id).emit('role_assigned', {
        userId: target.id,
        username: target.username,
        role,
        participants: c.room.list(),
      });

      this.broadcastRequests(c.room);
      roomService.syncRoomStateToDb(c.room);
      reply({ ok: true });
    });

    on('remove_participant', ({ userId }, reply) => {
      const c = authorise('remove_participant', reply);
      if (!c) return;

      if (userId === c.me.id) return reply({ ok: false, error: 'Host cannot kick themselves' });
      const target = c.room.getParticipant(userId);
      if (!target) return reply({ ok: false, error: 'User not found' });

      if (target.socketId) {
        this.io.to(target.socketId).emit('removed', { message: 'The Host removed you from the room' });
        const s = this.io.sockets.sockets.get(target.socketId);
        if (s) {
          s.leave(c.room.id);
          s.data = {};
        }
      }

      c.room.removeParticipant(userId);
      this.io.to(c.room.id).emit('participant_removed', {
        userId,
        username: target.username,
        participants: c.room.list(),
      });

      this.broadcastRequests(c.room);
      roomService.syncRoomStateToDb(c.room);
      reply({ ok: true });
    });

    on('transfer_host', ({ userId }, reply) => {
      const c = authorise('transfer_host', reply);
      if (!c) return;

      const target = c.room.getParticipant(userId);
      if (!target || target.id === c.me.id) return reply({ ok: false, error: 'Please choose another participant' });

      c.room.transferHost(c.me.id, target.id);
      this.io.to(c.room.id).emit('host_transferred', {
        fromUserId: c.me.id,
        toUserId: target.id,
        username: target.username,
        participants: c.room.list(),
      });

      this.broadcastRequests(c.room);
      roomService.syncRoomStateToDb(c.room);
      reply({ ok: true });
    });

    /* ===== CHAT ===== */

    on('chat_message', async ({ text }, reply) => {
      const c = getContext();
      if (!c) return reply({ ok: false, error: 'Not in room' });

      const clean = String(text || '').trim().slice(0, 500);
      if (!clean) return reply({ ok: false });

      const msg = c.room.addChat(c.me.id, clean);
      this.io.to(c.room.id).emit('chat_message', msg);
      await roomService.persistMessage(msg);

      reply({ ok: true });
    });
  }

  cleanName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').slice(0, 24);
  }

  leave(socket) {
    const { roomId, userId } = socket.data || {};
    const room = roomService.activeRooms.get(roomId);
    if (!room) return;
    socket.leave(room.id);
    socket.data = {};
    this.removeUser(room, userId, 'left');
  }

  removeUser(room, userId, reason) {
    const { removed, newHost } = room.removeParticipant(userId);
    if (!removed) return;

    this.io.to(room.id).emit('user_left', {
      username: removed.username,
      userId,
      participants: room.list(),
    });

    if (newHost) {
      this.io.to(room.id).emit('host_transferred', {
        fromUserId: userId,
        toUserId: newHost.id,
        username: newHost.username,
        participants: room.list(),
      });
    }

    this.broadcastRequests(room);
    roomService.syncRoomStateToDb(room);
    roomService.deleteIfEmpty(room);
  }

  broadcastRequests(room) {
    for (const p of room.participants.values()) {
      if (p.socketId) {
        this.io.to(p.socketId).emit('requests_updated', {
          requests: room.requestsFor(p.id),
        });
      }
    }
  }

  startHeartbeat(intervalMs = 5000) {
    setInterval(() => {
      for (const room of roomService.playingRooms()) {
        this.io.to(room.id).emit('sync_state', room.getState());
      }
    }, intervalMs).unref();
  }
}

module.exports = SocketHandler;

class Participant {
  constructor({ id, username, role, socketId }) {
    this.id = id;
    this.username = username;
    this.role = role;
    this.socketId = socketId;
    this.joinedAt = Date.now();
    this.disconnectTimer = null;
  }

  get online() {
    return !!this.socketId;
  }

  toJSON() {
    return {
      userId: this.id,
      username: this.username,
      role: this.role,
      online: this.online,
      joinedAt: this.joinedAt,
    };
  }
}

module.exports = Participant;

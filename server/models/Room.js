const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, enum: ['host', 'moderator', 'participant', 'viewer'], default: 'participant' },
  isOnline: { type: Boolean, default: true },
  socketId: { type: String, default: null },
  joinedAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Watch Party',
      trim: true,
      maxlength: 100,
    },
    videoId: {
      type: String,
      required: true,
      default: 'jNQXAC9IVRw',
    },
    videoTitle: {
      type: String,
      default: 'YouTube Video',
    },
    playState: {
      type: String,
      enum: ['playing', 'paused'],
      default: 'paused',
    },
    currentTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    hostId: {
      type: String,
      required: true,
    },
    hostName: {
      type: String,
      default: 'Host',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    participants: [participantSchema],
    settings: {
      allowParticipantRequests: { type: Boolean, default: true },
      isPublic: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Method to get client-safe playback state
roomSchema.methods.getPlaybackState = function () {
  return {
    videoId: this.videoId,
    videoTitle: this.videoTitle,
    playState: this.playState,
    currentTime: this.currentTime,
    updatedAt: this.updatedAt ? this.updatedAt.getTime() : Date.now(),
    serverTime: Date.now(),
  };
};

module.exports = mongoose.model('Room', roomSchema);

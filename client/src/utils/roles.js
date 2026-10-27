export const ROLES = {
  HOST: 'host',
  MODERATOR: 'moderator',
  PARTICIPANT: 'participant',
  VIEWER: 'viewer',
};

export const ROLE_CONFIG = {
  host: {
    label: 'Host',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
    description: 'Room Creator - Full playback, role assignment, and moderation control',
  },
  moderator: {
    label: 'Moderator',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
    description: 'Controller - Direct play/pause/seek and review participant requests',
  },
  participant: {
    label: 'Participant',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    description: 'Viewer with permission to send playback approval requests and chat',
  },
  viewer: {
    label: 'Viewer',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400',
    description: 'Read-only viewer',
  },
};

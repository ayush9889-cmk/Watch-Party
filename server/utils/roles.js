// Single source of truth for roles and permissions
const ROLES = Object.freeze({
  HOST: 'host',
  MODERATOR: 'moderator',
  PARTICIPANT: 'participant',
  VIEWER: 'viewer', // alias of participant
});

const ASSIGNABLE_ROLES = [ROLES.MODERATOR, ROLES.PARTICIPANT, ROLES.VIEWER];

const PERMISSIONS = Object.freeze({
  [ROLES.HOST]: new Set([
    'play', 'pause', 'seek', 'change_video',
    'assign_role', 'remove_participant', 'transfer_host', 'review_requests',
  ]),
  [ROLES.MODERATOR]: new Set([
    'play', 'pause', 'seek', 'change_video', 'review_requests',
  ]),
  [ROLES.PARTICIPANT]: new Set([]),
  [ROLES.VIEWER]: new Set([]),
});

const can = (role, action) => !!PERMISSIONS[role] && PERMISSIONS[role].has(action);

module.exports = { ROLES, ASSIGNABLE_ROLES, PERMISSIONS, can };

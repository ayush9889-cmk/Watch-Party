const DEFAULT_VIDEO = 'jNQXAC9IVRw'; // "Me at the zoo" - First YouTube video
const REQUEST_TYPES = ['play', 'pause', 'seek', 'change_video'];

const ACTION_LABEL = {
  play: 'play the video',
  pause: 'pause the video',
  seek: 'seek the video',
  change_video: 'change the video',
  assign_role: 'assign roles',
  remove_participant: 'remove participants',
  transfer_host: 'transfer the host role',
  review_requests: 'review requests',
};

module.exports = {
  DEFAULT_VIDEO,
  REQUEST_TYPES,
  ACTION_LABEL,
};

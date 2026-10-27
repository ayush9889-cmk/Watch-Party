import React, { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/layout/Navbar';
import Player from './components/room/Player';
import PlaybackControls from './components/room/PlaybackControls';
import ParticipantsPanel from './components/room/ParticipantsPanel';
import RequestsPanel from './components/room/RequestsPanel';
import ChatPanel from './components/room/ChatPanel';
import ShareModal from './components/room/ShareModal';
import VideoChangeModal from './components/room/VideoChangeModal';
import Toast from './components/common/Toast';
import { socket, emitAck, getUserId } from './services/socket';
import { ROLE_CONFIG } from './utils/roles';
import { describeRequest } from './utils/youtube';

export default function Room({ roomId, username, onLeave }) {
  const userId = getUserId();
  const [roomTitle, setRoomTitle] = useState('Watch Party');
  const [participants, setParticipants] = useState([]);
  const [videoState, setVideoState] = useState(null);
  const [requests, setRequests] = useState([]);
  const [chat, setChat] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const me = participants.find((p) => p.userId === userId);
  const role = me ? me.role : 'viewer';
  const isHost = role === 'host';
  const canControl = role === 'host' || role === 'moderator';
  const canRef = useRef(false);
  canRef.current = canControl;

  const toast = useCallback((message, kind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let alive = true;

    const join = async () => {
      const res = await emitAck('join_room', { roomId, username, userId });
      if (!alive) return;
      if (!res.ok) return onLeave(res.error);

      setRoomTitle(res.roomTitle || 'Watch Party');
      setParticipants(res.participants || []);
      setVideoState({ ...res.state, receivedAt: Date.now() });
      setRequests(res.requests || []);
      setChat(res.chat || []);
    };

    const handlers = {
      sync_state: (s) => setVideoState({ ...s, receivedAt: Date.now() }),
      participants_updated: (d) => setParticipants(d.participants),
      user_joined: (d) => {
        setParticipants(d.participants);
        toast(`${d.username} joined the party`, 'success');
      },
      user_left: (d) => {
        setParticipants(d.participants);
        toast(`${d.username} left`, 'info');
      },
      participant_removed: (d) => {
        setParticipants(d.participants);
        toast(`${d.username} was removed`, 'error');
      },
      role_assigned: (d) => {
        setParticipants(d.participants);
        const roleLabel = ROLE_CONFIG[d.role]?.label || d.role;
        toast(
          d.userId === userId
            ? `You were promoted to ${roleLabel}`
            : `${d.username} is now ${roleLabel}`,
          'info'
        );
      },
      host_transferred: (d) => {
        setParticipants(d.participants);
        toast(
          d.toUserId === userId ? 'You are now the Room Host' : `${d.username} is now Host`,
          'info'
        );
      },
      removed: (d) => onLeave(d.message),
      requests_updated: (d) => setRequests(d.requests || []),
      request_created: (d) => {
        if (canRef.current && d.request.userId !== userId) {
          toast(`${d.request.username} wants to ${describeRequest(d.request)}`, 'info');
        }
      },
      request_resolved: (d) => {
        if (d.request.userId === userId) {
          toast(
            `Your request to ${describeRequest(d.request)} was ${d.status}`,
            d.status === 'approved' ? 'success' : 'error'
          );
        }
      },
      chat_message: (m) => setChat((c) => [...c.slice(-99), m]),
      error_message: (d) => toast(d.message, 'error'),
    };

    if (socket.connected) join();
    socket.on('connect', join);
    Object.entries(handlers).forEach(([e, h]) => socket.on(e, h));

    return () => {
      alive = false;
      socket.off('connect', join);
      Object.entries(handlers).forEach(([e, h]) => socket.off(e, h));
    };
  }, [roomId, username, userId, onLeave, toast]);

  // Actions
  const handleAction = async (type, payload = {}) => {
    if (canControl) {
      const res = await emitAck(type, payload);
      if (!res.ok) toast(res.error, 'error');
    } else {
      const res = await emitAck('request_action', { type, payload });
      if (!res.ok) toast(res.error, 'error');
      else toast('Request submitted. Waiting for Moderator approval.', 'info');
    }
  };

  const handleSendMessage = async (text) => {
    await emitAck('chat_message', { text });
  };

  const handleAssignRole = async (targetUserId, newRole) => {
    const res = await emitAck('assign_role', { userId: targetUserId, role: newRole });
    if (!res.ok) toast(res.error, 'error');
  };

  const handleRemoveUser = async (p) => {
    if (!window.confirm(`Remove ${p.username} from the room?`)) return;
    const res = await emitAck('remove_participant', { userId: p.userId });
    if (!res.ok) toast(res.error, 'error');
  };

  const handleTransferHost = async (p) => {
    if (!window.confirm(`Make ${p.username} the new Host? You will become a Moderator.`)) return;
    const res = await emitAck('transfer_host', { userId: p.userId });
    if (!res.ok) toast(res.error, 'error');
  };

  const handleResolveRequest = async (requestId, approve) => {
    const res = await emitAck(approve ? 'approve_request' : 'reject_request', { requestId });
    if (!res.ok) toast(res.error, 'error');
  };

  const handleLeaveRoom = async () => {
    await emitAck('leave_room');
    onLeave();
  };

  if (!videoState || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium">Entering Room {roomId}…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar
        roomId={roomId}
        roomTitle={roomTitle}
        role={role}
        participantCount={participants.length}
        onLeave={handleLeaveRoom}
        onOpenShare={() => setShareModalOpen(true)}
      />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Stage (Player & Controls) */}
          <div className="lg:col-span-8 space-y-4">
            <Player
              state={videoState}
              canControl={canControl}
              onAction={handleAction}
            />

            <PlaybackControls
              videoState={videoState}
              canControl={canControl}
              onAction={handleAction}
              onOpenVideoModal={() => setVideoModalOpen(true)}
            />

            {/* Mobile / Tablet requests panel */}
            <div className="block lg:hidden">
              <RequestsPanel
                requests={requests}
                canControl={canControl}
                onResolveRequest={handleResolveRequest}
              />
            </div>
          </div>

          {/* Right Sidebar (Tabs/Panels for Chat, People, Moderation) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Moderation Approval Queue (Desktop) */}
            <div className="hidden lg:block">
              <RequestsPanel
                requests={requests}
                canControl={canControl}
                onResolveRequest={handleResolveRequest}
              />
            </div>

            {/* Participants */}
            <ParticipantsPanel
              participants={participants}
              currentUserId={userId}
              isHost={isHost}
              onAssignRole={handleAssignRole}
              onRemoveUser={handleRemoveUser}
              onTransferHost={handleTransferHost}
            />

            {/* Chat */}
            <ChatPanel
              chat={chat}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </main>

      {/* Modals & Toasts */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        roomId={roomId}
      />

      <VideoChangeModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        canControl={canControl}
        onSelectVideo={(id) => handleAction('change_video', { videoId: id })}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

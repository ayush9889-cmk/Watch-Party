import React, { useState } from 'react';
import Hero from './components/home/Hero';
import CreateRoomCard from './components/home/CreateRoomCard';
import JoinRoomCard from './components/home/JoinRoomCard';
import Features from './components/home/Features';
import ActiveRoomsPreview from './components/home/ActiveRoomsPreview';
import Footer from './components/layout/Footer';
import { emitAck, getUserId } from './services/socket';

export default function Home({ initialRoom, onEnter }) {
  const [username, setUsername] = useState(sessionStorage.getItem('wp_username') || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const enter = (roomId) => {
    sessionStorage.setItem('wp_username', username.trim());
    onEnter({ roomId, username: username.trim() });
  };

  const handleCreate = async ({ title, videoId }) => {
    if (!username.trim()) return setError('Please enter your name first');
    setError('');
    setBusy(true);

    const res = await emitAck('create_room', {
      username: username.trim(),
      userId: getUserId(),
      title,
      videoId,
    });

    setBusy(false);
    if (res.ok) {
      enter(res.roomId);
    } else {
      setError(res.error || 'Failed to create room');
    }
  };

  const handleJoin = (code) => {
    if (!username.trim()) return setError('Please enter your name first');
    setError('');
    enter(code);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 lg:py-12">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <Hero />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <CreateRoomCard
            username={username}
            setUsername={setUsername}
            onCreate={handleCreate}
            busy={busy}
            error={error}
          />
          <JoinRoomCard
            username={username}
            setUsername={setUsername}
            initialCode={initialRoom}
            onJoin={handleJoin}
            error={error}
          />
        </div>

        <ActiveRoomsPreview onSelectRoom={handleJoin} />
        <Features />
      </div>

      <Footer />
    </div>
  );
}

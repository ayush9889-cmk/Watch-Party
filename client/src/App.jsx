import React, { useState } from 'react';
import Home from './Home';
import Room from './Room';

const readSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem('wp_session')) || null;
  } catch {
    return null;
  }
};

export default function App() {
  const [session, setSession] = useState(readSession);
  const [notice, setNotice] = useState('');
  const urlRoom = new URLSearchParams(window.location.search).get('room') || '';

  const enter = (s) => {
    sessionStorage.setItem('wp_session', JSON.stringify(s));
    window.history.replaceState({}, '', `/?room=${s.roomId}`);
    setNotice('');
    setSession(s);
  };

  const leave = (message = '') => {
    sessionStorage.removeItem('wp_session');
    window.history.replaceState({}, '', '/');
    setNotice(message);
    setSession(null);
  };

  if (session) {
    return (
      <Room
        roomId={session.roomId}
        username={session.username}
        onLeave={leave}
      />
    );
  }

  return (
    <>
      {notice && (
        <div className="bg-brand-900/90 border-b border-brand-500/40 text-brand-200 text-xs py-2 px-4 text-center font-medium">
          {notice}
        </div>
      )}
      <Home initialRoom={urlRoom} onEnter={enter} />
    </>
  );
}

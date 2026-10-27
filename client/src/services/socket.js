import { io } from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL;
export const socket = serverUrl ? io(serverUrl) : io();

export function getUserId() {
  let id = sessionStorage.getItem('wp_user_id');
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('wp_user_id', id);
  }
  return id;
}

export const emitAck = (event, payload = {}) =>
  new Promise((resolve) =>
    socket.timeout(8000).emit(event, payload, (err, res) =>
      resolve(err ? { ok: false, error: 'Server connection timed out' } : res)
    )
  );

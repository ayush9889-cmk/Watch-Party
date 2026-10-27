const API_BASE = '/api';

export async function fetchActiveRooms() {
  try {
    const res = await fetch(`${API_BASE}/rooms`);
    const data = await res.json();
    return data.ok ? data.rooms : [];
  } catch {
    return [];
  }
}

export async function fetchRoomDetails(code) {
  try {
    const res = await fetch(`${API_BASE}/rooms/${code}`);
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function fetchRoomMessages(code) {
  try {
    const res = await fetch(`${API_BASE}/rooms/${code}/messages`);
    const data = await res.json();
    return data.ok ? data.messages : [];
  } catch {
    return [];
  }
}

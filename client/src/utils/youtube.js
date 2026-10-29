export function extractVideoId(input) {
  const s = String(input || "").trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1, 12);
    if (u.searchParams.get("v")) return u.searchParams.get("v").slice(0, 11);
    const m = u.pathname.match(/\/(embed|shorts|live)\/([\w-]{11})/);
    if (m) return m[2];
  } catch {}
  return null;
}

export function getThumbnailUrl(videoId, quality = "hqdefault") {
  if (!videoId) return "";
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function parseTime(input) {
  const parts = String(input || "")
    .trim()
    .split(":")
    .map(Number);
  if (!parts.length || parts.some((n) => !Number.isFinite(n) || n < 0))
    return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = String(sec % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function describeRequest(r) {
  if (!r) return "";
  if (r.type === "play") return "play the video";
  if (r.type === "pause") return "pause the video";
  if (r.type === "seek")
    return `jump to ${fmtTime(r.payload && r.payload.time)}`;
  return `change the video (${r.payload && r.payload.videoId})`;
}

// Preset popular watch party sample videos for rapid demoing
export const PRESET_VIDEOS = [
  {
    title: "Agentic Ai Course",
    videoId: "rV3HJ4LEZ7k",
    category: "Education",
  },

  {
    title: "Tum Hi Ho",
    videoId: "81qmmlsIE3k",
    category: "Music",
  },
  {
    title: "Next JS Full Course",
    videoId: "u3r8dXw0rD8",
    category: "Education",
  },
];

# 🎬 YouTube Watch Party (Pro Edition)

A high-performance, real-time synchronized YouTube watch party application built with a robust **MVC (Model-View-Controller)** backend, **MongoDB** persistence, **Socket.IO** real-time events, and a modular **React + Tailwind CSS** frontend with role-based access control.

---

## 🌟 Key Highlights & Enhancements

- **Architectural Refactoring (MVC)**: Clean separation of concerns with dedicated **Models** (Mongoose Schemas for Rooms, Messages, and Requests), **Controllers** for business logic, and modular Express **Routes**.
- **MongoDB Persistence**:
  - Live persistence of active room state, participant sessions, and playback timelines.
  - Full chat history preserved across sessions with indexed MongoDB queries.
  - Persistent moderation approval audit log for tracking member action requests.
  - Automatic in-memory fallback if MongoDB is not running locally, ensuring zero crashes.
- **Modular Frontend Design**:
  - Structured modular components divided by domain (`components/layout`, `components/home`, `components/room`, `components/common`).
  - Reusable design system primitives: `Button`, `Input`, `Badge`, `Modal`, `Toast`, `Icons`.
- **Modern Professional UI with Tailwind CSS**:
  - Sleek dark aesthetic with glassmorphism (`backdrop-blur`), ambient glowing borders, and custom scrollbars.
  - YouTube player embed with autoplay unlock gate, frame-accurate drift correction, and quick-jump playback controls (-10s / +10s).
  - Video change modal with real-time YouTube thumbnail preview and curated preset categories (Music, Nature, Lo-Fi, Retro).
  - Live participant management panel with real-time online status indicators.
  - Interactive live chat with quick emoji reaction bar and role badges.
  - One-click invite link generator and modal with room code copy feedback.

---

## 🏗 Project Architecture & MVC Structure

```text
watch-party/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & reconnect handling
│   ├── models/
│   │   ├── Room.js               # Mongoose Schema: rooms, playback status, settings
│   │   ├── Message.js            # Mongoose Schema: persistent chat history
│   │   ├── Request.js            # Mongoose Schema: participant approval queue
│   │   └── Participant.js        # Participant domain model
│   ├── controllers/
│   │   ├── roomController.js     # Room creation, retrieval, active room listings
│   │   ├── messageController.js  # Chat queries and message dispatch
│   │   └── requestController.js  # Pending approval requests
│   ├── routes/
│   │   ├── roomRoutes.js         # /api/rooms endpoints
│   │   ├── messageRoutes.js      # /api/rooms/:code/messages endpoints
│   │   ├── requestRoutes.js      # /api/rooms/:code/requests endpoints
│   │   └── index.js              # Aggregated API router
│   ├── services/
│   │   ├── roomService.js        # Core room state management & DB synchronization
│   │   └── socketHandler.js      # Socket.IO authorization & event routing
│   ├── middleware/
│   │   ├── errorHandler.js       # Global 404 & centralized error handlers
│   │   └── logger.js             # HTTP request logger
│   ├── utils/
│   │   ├── roles.js              # Role definitions & permission matrix
│   │   ├── constants.js          # Default video IDs, action labels
│   │   └── codeGenerator.js      # 6-character room code generator
│   ├── package.json
│   └── index.js                  # Express + Socket.IO server entry point
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable UI primitives (Button, Input, Modal, Badge, Toast, Icons)
│   │   │   ├── layout/           # Navbar, Footer
│   │   │   ├── home/             # Hero, CreateRoomCard, JoinRoomCard, ActiveRoomsPreview, Features
│   │   │   └── room/             # Player, PlaybackControls, VideoChangeModal, ChatPanel, ParticipantsPanel, RequestsPanel, ShareModal
│   │   ├── services/
│   │   │   ├── socket.js         # Socket.IO client instance & typed emitAck
│   │   │   └── api.js            # Fetch API client for REST backend endpoints
│   │   ├── utils/
│   │   │   ├── youtube.js        # URL parsers, thumbnail extractors, time formatters
│   │   │   └── roles.js          # Role configs and UI badges
│   │   ├── styles/
│   │   │   └── index.css         # Tailwind directives, custom scrollbars, glass utilities
│   │   ├── App.jsx               # App container & session router
│   │   ├── Home.jsx              # Landing / Join page
│   │   ├── Room.jsx              # Main Watch Party room view
│   │   └── main.jsx              # React DOM entry
│   ├── tailwind.config.js        # Custom dark palette, fonts, animations
│   ├── postcss.config.js
│   ├── vite.config.js            # Vite build & local dev reverse proxy
│   ├── package.json
│   └── index.html
│
├── .env.example
├── render.yaml                   # Production deployment manifest
├── package.json                  # Workspace orchestrator scripts
└── README.md
```

---

## 👥 Role & Permission Matrix

All permissions are strictly verified **on the server** before any action executes:

| Action | Host | Moderator | Participant | Viewer |
|---|:---:|:---:|:---:|:---:|
| **Play / Pause / Seek / Change Video** | ✅ Direct | ✅ Direct | ⏳ Approval Request | ⏳ Approval Request |
| **Approve / Reject Requests** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Assign Roles (Mod / Participant / Viewer)** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Remove Participant** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Transfer Host Role** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Chat & Send Reactions** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (or [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI)

### 1. Installation

Clone or extract the repository and install all dependencies:

```bash
# Install dependencies for both server and client
npm run install:all
```

Or install separately:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root or in `server/` (refer to `.env.example`):

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/watch_party
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

> **Note on MongoDB**: If MongoDB is not running locally, the server automatically enables an in-memory fallback cache so you can test immediately without interruptions.

### 3. Run Development Servers

Run backend and frontend concurrently or in two terminal tabs:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
# Server starts at http://localhost:4000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Vite dev server starts at http://localhost:5173
```

Open `http://localhost:5173` in your browser. Open an **Incognito / Private Window** to test synchronized streaming with multiple participants in real time!

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health status and uptime |
| `GET` | `/api/rooms` | Lists active public rooms with video details & participant counts |
| `POST` | `/api/rooms` | Creates a new room (`{ username, userId, title, videoId }`) |
| `GET` | `/api/rooms/:code` | Fetches metadata and state for a specific room |
| `PUT` | `/api/rooms/:code/video` | Updates current video (`{ videoId, videoTitle }`) |
| `GET` | `/api/rooms/:code/messages`| Retrieves persistent chat history from MongoDB |
| `POST` | `/api/rooms/:code/messages`| Dispatches a new chat message |
| `GET` | `/api/rooms/:code/requests`| Retrieves current pending approval requests |

---

## 🔄 WebSocket Event Protocol (Socket.IO)

- `create_room`: Client requests room creation. Returns `{ ok, roomId }`.
- `join_room`: Client connects to room. Receives initial state, chat history, participant roster.
- `sync_state`: Authoritative state broadcast (`{ videoId, playState, currentTime, serverTime }`).
- `play`, `pause`, `seek`, `change_video`: Emitted by controllers to adjust playback.
- `request_action`: Sent by participants to request an action.
- `approve_request` / `reject_request`: Handled by Host or Moderator.
- `assign_role`, `remove_participant`, `transfer_host`: Moderation events for Host.
- `chat_message`: Real-time chat messages persisted to MongoDB and broadcasted to the room.

---

## 🚢 Production Build & Deployment

To build the client and serve everything from the single Node.js Express server:

```bash
# 1. Build client bundle
npm run build

# 2. Start production server
npm start
```

### Deploy to Render

This repository includes a `render.yaml` blueprint:
1. Push code to your GitHub repository.
2. Link the repository in **Render** using **New -> Blueprint**.
3. Set the optional `MONGO_URI` environment variable to your MongoDB Atlas connection string.
4. Render will run `npm run build` and launch `npm start` automatically.

---

## 📄 License

MIT License. Designed and built for seamless watch party streaming.

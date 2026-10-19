# IntellMeet - Turn Every Meeting Into Action

**IntellMeet** is a modern, enterprise-grade, AI-powered meeting and team collaboration platform designed for remote teams, engineering organizations, product managers, and enterprise collaboration.

---

## 🌟 Key Features

1. **Real-Time WebRTC Audio & Video Conferencing**: High-definition peer-to-peer audio and video streaming, media device toggling, and room participant management.
2. **Real-Time Screen Sharing**: Native screen and browser window sharing via `getDisplayMedia` with automatic track restoration.
3. **AI Meeting Intelligence**: Speech-to-text transcript processing, AI executive summaries (overview, decisions made, outcomes, recommendations), and automatic action item extraction.
4. **Interactive AI Copilot**: Ask natural language questions about meeting context, past decisions, or unresolved action items.
5. **Team Workspaces & Kanban Board**: Full-featured Kanban task management (Backlog, To Do, In Progress, Review, Completed) with 1-click conversion from meeting action items to tasks.
6. **Post-Meeting Intelligence Reports**: Comprehensive post-meeting reports with transcript search, copyable summaries, and task links.
7. **Secure Authentication & RBAC**: JWT access token and refresh token rotation, password hashing with bcrypt, input validation with Zod, and rate limiting protection.
8. **Real-Time Chat & Notifications**: Persistent meeting chat and workspace notifications for task assignments and meeting reminders.
9. **Analytics & Insights**: Recharts visualization dashboard tracking weekly meeting hours, task completion rate, and action items.

---

## 🏗️ Architecture Overview

```
intellmeet/
├── client/                 # React 19 + TypeScript + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/     # UI, Navbar, Sidebar
│   │   ├── hooks/          # useWebRTC.ts (Peer Connection & Media Stream Engine)
│   │   ├── pages/          # 24 Complete Application Pages
│   │   ├── services/       # REST API Client with JWT Refresh Rotation
│   │   ├── store/          # Zustand Auth & Meeting Stores
│   │   └── types/          # TypeScript Type Interfaces
├── server/                 # Node.js + Express + TypeScript + Socket.io Backend
│   ├── src/
│   │   ├── config/         # MongoDB, Redis & Env configuration
│   │   ├── controllers/    # Auth, User, Meeting, Workspace, Task, AI, Analytics
│   │   ├── middleware/     # JWT Auth, Role Authorization, Zod Validation, Rate Limiter
│   │   ├── models/         # Mongoose Schemas (User, RefreshToken, Workspace, Meeting, Task, etc.)
│   │   ├── routes/         # Express REST Endpoints
│   │   ├── services/       # OpenAI & Fallback AI Intelligence Engine
│   │   └── sockets/        # WebRTC Offer/Answer/ICE Signaling & Chat Sockets
└── docker-compose.yml       # Docker Compose multi-container deployment
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or v22)
- npm (v10 or v11)
- MongoDB (optional for local dev; built-in fallback active)
- Redis (optional for background jobs queue; built-in fallback active)

### 1. Installation

```bash
# Clone or navigate to the repository
cd d:/portfolio/intellmeet

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Running in Development Mode

```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: React Client (Port 5173)
cd client
npm run dev
```

### 3. Docker Deployment

```bash
docker-compose up --build
```

Access the client at `http://localhost:3000` (or `http://localhost:5173` in Vite dev mode) and backend API health check at `http://localhost:5000/health`.

---

## 🧪 Testing

```bash
# Run server test suite
cd server
npm test
```

---

## 📄 License
MIT License. Built with excellence for high-performance enterprise team collaboration.

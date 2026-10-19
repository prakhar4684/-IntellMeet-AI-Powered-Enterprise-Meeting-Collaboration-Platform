import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { setupMeetingSockets } from './sockets/meetingSocket';

const startServer = async () => {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin: true, // Allow any local development origin
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  setupMeetingSockets(io);

  server.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  IntellMeet Server Running on http://localhost:${env.PORT}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log(`  Socket.io & WebRTC Signaling Ready`);
    console.log(`=======================================================`);
  });
};

startServer().catch((err) => {
  console.error('[Fatal Server Startup Error]', err);
});

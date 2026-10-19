import { Server, Socket } from 'socket.io';
import { MeetingMessage } from '../models/MeetingMessage';

interface PeerUser {
  socketId: string;
  userId: string;
  displayName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

const roomParticipantsMap = new Map<string, Map<string, PeerUser>>();

export const setupMeetingSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join Meeting Room
    socket.on('join-room', ({ roomId, userId, displayName, isMuted, isVideoOff }) => {
      socket.join(roomId);

      if (!roomParticipantsMap.has(roomId)) {
        roomParticipantsMap.set(roomId, new Map());
      }
      const participants = roomParticipantsMap.get(roomId)!;

      const newPeer: PeerUser = {
        socketId: socket.id,
        userId: userId || `guest_${socket.id.slice(0, 5)}`,
        displayName: displayName || 'Anonymous Guest',
        isMuted: !!isMuted,
        isVideoOff: !!isVideoOff,
        isScreenSharing: false,
      };

      participants.set(socket.id, newPeer);

      // Notify existing peers in room about new participant
      socket.to(roomId).emit('user-joined', newPeer);

      // Send current room participants list to joining peer
      const existingPeers = Array.from(participants.values()).filter((p) => p.socketId !== socket.id);
      socket.emit('room-peers', existingPeers);

      console.log(`[Socket] User "${displayName}" (${socket.id}) joined room "${roomId}". Total participants: ${participants.size}`);
    });

    // WebRTC Offer
    socket.on('offer', ({ targetSocketId, offer, callerInfo }) => {
      io.to(targetSocketId).emit('offer', {
        callerSocketId: socket.id,
        offer,
        callerInfo,
      });
    });

    // WebRTC Answer
    socket.on('answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('answer', {
        responderSocketId: socket.id,
        answer,
      });
    });

    // ICE Candidate exchange
    socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('ice-candidate', {
        senderSocketId: socket.id,
        candidate,
      });
    });

    // Media State Toggles
    socket.on('toggle-media', ({ roomId, isMuted, isVideoOff }) => {
      const participants = roomParticipantsMap.get(roomId);
      if (participants && participants.has(socket.id)) {
        const peer = participants.get(socket.id)!;
        peer.isMuted = isMuted;
        peer.isVideoOff = isVideoOff;
        io.to(roomId).emit('user-media-updated', {
          socketId: socket.id,
          isMuted,
          isVideoOff,
        });
      }
    });

    // Screen Share State
    socket.on('screen-share-changed', ({ roomId, isScreenSharing }) => {
      const participants = roomParticipantsMap.get(roomId);
      if (participants && participants.has(socket.id)) {
        const peer = participants.get(socket.id)!;
        peer.isScreenSharing = isScreenSharing;
        io.to(roomId).emit('user-screenshare-updated', {
          socketId: socket.id,
          isScreenSharing,
        });
      }
    });

    // Real-Time Chat Message
    socket.on('send-chat-message', async ({ roomId, senderId, senderName, text }) => {
      const messageData = {
        meeting: roomId,
        sender: senderId,
        senderName,
        text,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all participants in meeting room
      io.to(roomId).emit('receive-chat-message', messageData);

      // Persist in MongoDB
      try {
        await MeetingMessage.create({
          meeting: roomId as any,
          sender: senderId as any,
          senderName,
          text,
        });
      } catch {
        // Log notice if transient ID
      }
    });

    // Typing Indicators
    socket.on('typing', ({ roomId, displayName }) => {
      socket.to(roomId).emit('user-typing', { socketId: socket.id, displayName });
    });

    socket.on('stop-typing', ({ roomId }) => {
      socket.to(roomId).emit('user-stop-typing', { socketId: socket.id });
    });

    // Handle Disconnect
    socket.on('disconnecting', () => {
      for (const roomId of socket.rooms) {
        if (roomParticipantsMap.has(roomId)) {
          const participants = roomParticipantsMap.get(roomId)!;
          participants.delete(socket.id);
          io.to(roomId).emit('user-left', { socketId: socket.id });
          if (participants.size === 0) {
            roomParticipantsMap.delete(roomId);
          }
        }
      }
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

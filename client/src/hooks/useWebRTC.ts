import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMeetingStore, MeetingParticipantInfo } from '../store/useMeetingStore';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

export const useWebRTC = (roomId: string, userId: string, displayName: string) => {
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceCandidateQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const {
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    setAudioMuted,
    setVideoOff,
    addChatMessage,
    setParticipants,
    addParticipant,
    removeParticipant,
    updateParticipantMedia,
    updateParticipantStream,
    resetMeeting,
  } = useMeetingStore();

  // Helper: Safely add queued ICE candidates
  const drainIceQueue = useCallback(async (targetSocketId: string, pc: RTCPeerConnection) => {
    const queue = iceCandidateQueuesRef.current.get(targetSocketId) || [];
    while (queue.length > 0) {
      const candidate = queue.shift();
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTC] Failed to add queued ICE candidate:', err);
        }
      }
    }
  }, []);

  // Helper: Create RTCPeerConnection for a peer
  const createPeerConnection = useCallback(
    (targetSocketId: string, peerInfo: { userId: string; displayName: string }) => {
      // Return existing connection if present and open
      const existing = peerConnectionsRef.current.get(targetSocketId);
      if (existing && existing.connectionState !== 'closed') {
        return existing;
      }

      console.log(`[WebRTC] Creating RTCPeerConnection for ${peerInfo.displayName} (${targetSocketId})`);
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(targetSocketId, pc);

      // Attach local tracks or transceivers
      if (localStreamRef.current && localStreamRef.current.getTracks().length > 0) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      } else {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
        pc.addTransceiver('video', { direction: 'sendrecv' });
      }

      // ICE candidate gathering
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Remote stream arrival
      pc.ontrack = (event) => {
        console.log(`[WebRTC] Received remote track (${event.track.kind}) from ${peerInfo.displayName}`);
        const remoteStream = event.streams[0] || new MediaStream([event.track]);
        updateParticipantStream(targetSocketId, remoteStream);
      };

      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state with ${peerInfo.displayName}: ${pc.connectionState}`);
      };

      return pc;
    },
    [updateParticipantStream]
  );

  // Initialize Media and Socket Connection
  useEffect(() => {
    let isMounted = true;
    resetMeeting();

    const startWebRTC = async () => {
      // 1. Resilient Media Acquisition
      let mediaStream: MediaStream | null = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (videoError) {
        console.warn('[WebRTC] Video/Audio capture failed, falling back to audio only:', videoError);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          setVideoOff(true);
        } catch (audioError) {
          console.warn('[WebRTC] Media permission denied or hardware unavailable, joining listen-only:', audioError);
          setVideoOff(true);
          setAudioMuted(true);
        }
      }

      if (!isMounted) {
        if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
        return;
      }

      if (mediaStream) {
        localStreamRef.current = mediaStream;
        setLocalStream(mediaStream);
      }

      // 2. Connect to Socket.io directly to avoid proxy drops
      const socketUrl =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:5000'
          : window.location.origin;

      console.log(`[Socket] Connecting to ${socketUrl}...`);
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log(`[Socket] Connected to server as ID: ${socket.id}. Joining room: ${roomId}`);
        socket.emit('join-room', {
          roomId,
          userId,
          displayName,
          isMuted: isAudioMuted,
          isVideoOff,
        });
      });

      socket.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
      });

      // Existing peers in the room
      socket.on('room-peers', async (peers: MeetingParticipantInfo[]) => {
        console.log(`[Socket] Received existing room peers:`, peers);
        setParticipants(peers);

        for (const peer of peers) {
          try {
            const pc = createPeerConnection(peer.socketId, peer);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', {
              targetSocketId: peer.socketId,
              offer,
              callerInfo: { userId, displayName },
            });
          } catch (offerErr) {
            console.error('[WebRTC] Error initiating offer to peer:', peer.displayName, offerErr);
          }
        }
      });

      // New peer joined
      socket.on('user-joined', (peer: MeetingParticipantInfo) => {
        console.log(`[Socket] New peer joined the meeting: ${peer.displayName} (${peer.socketId})`);
        addParticipant(peer);
        createPeerConnection(peer.socketId, peer);
      });

      // Offer received from joining peer
      socket.on('offer', async ({ callerSocketId, offer, callerInfo }) => {
        console.log(`[WebRTC] Received offer from ${callerInfo.displayName} (${callerSocketId})`);
        try {
          let pc = peerConnectionsRef.current.get(callerSocketId);
          if (!pc) {
            pc = createPeerConnection(callerSocketId, callerInfo);
          }
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          await drainIceQueue(callerSocketId, pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { targetSocketId: callerSocketId, answer });
        } catch (offerHandleErr) {
          console.error('[WebRTC] Failed to handle offer:', offerHandleErr);
        }
      });

      // Answer received
      socket.on('answer', async ({ responderSocketId, answer }) => {
        console.log(`[WebRTC] Received answer from socket ${responderSocketId}`);
        try {
          const pc = peerConnectionsRef.current.get(responderSocketId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            await drainIceQueue(responderSocketId, pc);
          }
        } catch (ansErr) {
          console.error('[WebRTC] Failed to set remote answer:', ansErr);
        }
      });

      // ICE candidate received
      socket.on('ice-candidate', async ({ senderSocketId, candidate }) => {
        const pc = peerConnectionsRef.current.get(senderSocketId);
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (iceErr) {
            console.warn('[WebRTC] Error adding ICE candidate:', iceErr);
          }
        } else {
          // Queue candidates until setRemoteDescription completes
          const queue = iceCandidateQueuesRef.current.get(senderSocketId) || [];
          queue.push(candidate);
          iceCandidateQueuesRef.current.set(senderSocketId, queue);
        }
      });

      // User left
      socket.on('user-left', ({ socketId }) => {
        console.log(`[Socket] Peer left the room: ${socketId}`);
        removeParticipant(socketId);
        const pc = peerConnectionsRef.current.get(socketId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(socketId);
        }
        iceCandidateQueuesRef.current.delete(socketId);
      });

      // Remote peer toggled mic or camera
      socket.on('user-media-updated', ({ socketId, isMuted, isVideoOff: remoteVideoOff }) => {
        updateParticipantMedia(socketId, isMuted, remoteVideoOff);
      });

      // Remote peer chat message
      socket.on('receive-chat-message', (msg) => {
        addChatMessage(msg);
      });
    };

    startWebRTC();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      iceCandidateQueuesRef.current.clear();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      resetMeeting();
    };
  }, [roomId, userId, displayName, createPeerConnection, drainIceQueue, addParticipant, removeParticipant, setParticipants, addChatMessage, updateParticipantMedia, setVideoOff, setAudioMuted, resetMeeting]);

  // Audio / Video Mute & Unmute Handling
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioMuted;
      });
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOff;
      });
      if (socketRef.current) {
        socketRef.current.emit('toggle-media', { roomId, isMuted: isAudioMuted, isVideoOff });
      }
    }
  }, [isAudioMuted, isVideoOff, roomId]);

  // Native Screen Share Handling
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in all active peer connections
      peerConnectionsRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      if (socketRef.current) {
        socketRef.current.emit('screen-share-changed', { roomId, isScreenSharing: true });
      }

      screenTrack.onended = () => {
        // Restore local camera video track when screen share ends
        if (localStreamRef.current) {
          const cameraTrack = localStreamRef.current.getVideoTracks()[0];
          peerConnectionsRef.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
            if (sender && cameraTrack) {
              sender.replaceTrack(cameraTrack);
            }
          });
        }
        if (socketRef.current) {
          socketRef.current.emit('screen-share-changed', { roomId, isScreenSharing: false });
        }
      };
    } catch (err) {
      console.warn('[ScreenShare] Denied or cancelled:', err);
    }
  }, [roomId]);

  // Send Chat Message
  const sendChatMessage = useCallback(
    (text: string) => {
      if (socketRef.current && text.trim()) {
        socketRef.current.emit('send-chat-message', {
          roomId,
          senderId: userId,
          senderName: displayName,
          text,
        });
      }
    },
    [roomId, userId, displayName]
  );

  return {
    localStream,
    startScreenShare,
    sendChatMessage,
  };
};

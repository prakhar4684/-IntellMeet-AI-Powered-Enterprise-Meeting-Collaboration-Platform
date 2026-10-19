import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMeetingStore, MeetingParticipantInfo } from '../store/useMeetingStore';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

export const useWebRTC = (roomId: string, userId: string, displayName: string) => {
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceCandidateQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const remoteStreamsMapRef = useRef<Map<string, MediaStream>>(new Map());

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const {
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    setAudioMuted,
    setVideoOff,
    setScreenSharing,
    addChatMessage,
    setParticipants,
    addParticipant,
    removeParticipant,
    updateParticipantMedia,
    updateParticipantScreenShare,
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
          console.warn('[WebRTC] Error adding queued ICE candidate:', err);
        }
      }
    }
  }, []);

  // Helper: Create RTCPeerConnection for a peer
  const createPeerConnection = useCallback(
    (targetSocketId: string, peerInfo: { userId: string; displayName: string }) => {
      const existing = peerConnectionsRef.current.get(targetSocketId);
      if (existing && existing.connectionState !== 'closed') {
        return existing;
      }

      console.log(`[WebRTC] Creating RTCPeerConnection for ${peerInfo.displayName} (${targetSocketId})`);
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(targetSocketId, pc);

      // Attach current active stream tracks (screen share or camera)
      const currentVideoTrack = screenTrackRef.current || localStreamRef.current?.getVideoTracks()[0];
      const currentAudioTrack = localStreamRef.current?.getAudioTracks()[0];

      if (currentAudioTrack) {
        pc.addTrack(currentAudioTrack, localStreamRef.current!);
      } else {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
      }

      if (currentVideoTrack) {
        pc.addTrack(currentVideoTrack, localStreamRef.current || new MediaStream([currentVideoTrack]));
      } else {
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

      // Remote stream arrival: combine native WebRTC stream with fallback tracking
      pc.ontrack = (event) => {
        console.log(`[WebRTC] Received remote track (${event.track.kind}) from ${peerInfo.displayName}`, event.track.id);
        
        let remoteStream = remoteStreamsMapRef.current.get(targetSocketId);
        if (!remoteStream) {
          remoteStream = new MediaStream();
        }

        // Add track to peer's media stream if not present
        if (!remoteStream.getTracks().some((t) => t.id === event.track.id)) {
          remoteStream.addTrack(event.track);
        }

        // Also add any additional tracks that came in the native event.streams[0]
        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach((track) => {
            if (!remoteStream!.getTracks().some((t) => t.id === track.id)) {
              remoteStream!.addTrack(track);
            }
          });
        }

        // Ensure track is enabled
        event.track.enabled = true;

        // Fresh MediaStream instance so React hook & component effect detects change
        const updatedStream = new MediaStream(remoteStream.getTracks());
        remoteStreamsMapRef.current.set(targetSocketId, updatedStream);
        updateParticipantStream(targetSocketId, updatedStream);
      };

      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state with ${peerInfo.displayName}: ${pc.connectionState}`);
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE connection state with ${peerInfo.displayName}: ${pc.iceConnectionState}`);
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
      // 1. Resilient Media Acquisition with Multi-stage Delay Retry for Browser Refresh
      let mediaStream: MediaStream | null = null;
      const idealVideoConstraints: MediaTrackConstraints = {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 30 },
      };
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: idealVideoConstraints,
          audio: audioConstraints,
        });
      } catch (videoError) {
        console.warn('[WebRTC] Primary capture failed, waiting 350ms for device release on refresh...', videoError);
        // Wait 350ms for previous page's device handle to be freed by OS/browser
        await new Promise((resolve) => setTimeout(resolve, 350));
        if (!isMounted) return;

        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: audioConstraints,
          });
        } catch (retryError) {
          console.warn('[WebRTC] Video capture retry 1 failed, waiting 500ms...', retryError);
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (!isMounted) return;

          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: audioConstraints,
            });
          } catch (retry2Error) {
            console.warn('[WebRTC] Video capture retries failed, falling back to audio-only:', retry2Error);
            try {
              mediaStream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: audioConstraints,
              });
              setVideoOff(true);
            } catch (audioError) {
              console.warn('[WebRTC] Media permission denied, joining in view/listen mode:', audioError);
              setVideoOff(true);
              setAudioMuted(true);
            }
          }
        }
      }

      if (!isMounted) {
        if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
        return;
      }

      if (mediaStream) {
        // Explicitly set audio track state
        mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = !isAudioMuted;
        });
        localStreamRef.current = mediaStream;
        setLocalStream(mediaStream);
      }

      // 2. Connect to Socket.io directly
      const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
      const socketUrl = envUrl
        ? envUrl.replace(/\/+$/, '').replace(/\/api$/, '')
        : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
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
        console.log(`[Socket] New peer joined: ${peer.displayName} (${peer.socketId})`);
        addParticipant(peer);
        createPeerConnection(peer.socketId, peer);
      });

      // Offer received from joining peer
      socket.on('offer', async ({ callerSocketId, offer, callerInfo }) => {
        console.log(`[WebRTC] Received offer from ${callerInfo.displayName} (${callerSocketId})`);
        try {
          addParticipant({
            socketId: callerSocketId,
            userId: callerInfo.userId,
            displayName: callerInfo.displayName,
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
          });

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
          const queue = iceCandidateQueuesRef.current.get(senderSocketId) || [];
          queue.push(candidate);
          iceCandidateQueuesRef.current.set(senderSocketId, queue);
        }
      });

      // User left
      socket.on('user-left', ({ socketId }) => {
        console.log(`[Socket] Peer left: ${socketId}`);
        removeParticipant(socketId);
        const pc = peerConnectionsRef.current.get(socketId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(socketId);
        }
        iceCandidateQueuesRef.current.delete(socketId);
        remoteStreamsMapRef.current.delete(socketId);
      });

      // Remote peer toggled mic or camera
      socket.on('user-media-updated', ({ socketId, isMuted, isVideoOff: remoteVideoOff }) => {
        updateParticipantMedia(socketId, isMuted, remoteVideoOff);
      });

      // Remote peer toggled screen share
      socket.on('user-screenshare-updated', ({ socketId, isScreenSharing: remoteScreenSharing }) => {
        console.log(`[Socket] Remote peer screen share state:`, socketId, remoteScreenSharing);
        updateParticipantScreenShare(socketId, remoteScreenSharing);
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
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      iceCandidateQueuesRef.current.clear();
      remoteStreamsMapRef.current.clear();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      resetMeeting();
    };
  }, [roomId, userId, displayName, createPeerConnection, drainIceQueue, addParticipant, removeParticipant, setParticipants, addChatMessage, updateParticipantMedia, updateParticipantScreenShare, setVideoOff, setAudioMuted, resetMeeting]);

  // Audio / Video Mute & Unmute Handling
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioMuted;
      });

      const videoTracks = localStreamRef.current.getVideoTracks();
      if (!isVideoOff && (videoTracks.length === 0 || videoTracks[0].readyState === 'ended')) {
        // Camera was previously unavailable or ended, dynamically acquire camera track
        navigator.mediaDevices
          .getUserMedia({
            video: {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 30 },
            },
          })
          .then((newStream) => {
            const newTrack = newStream.getVideoTracks()[0];
            if (newTrack && localStreamRef.current) {
              localStreamRef.current.getVideoTracks().forEach((t) => localStreamRef.current?.removeTrack(t));
              localStreamRef.current.addTrack(newTrack);
              setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

              peerConnectionsRef.current.forEach((pc) => {
                const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
                if (videoSender) {
                  videoSender.replaceTrack(newTrack).catch(() => {});
                } else {
                  try {
                    pc.addTrack(newTrack, localStreamRef.current!);
                  } catch (e) {
                    console.warn('[WebRTC] addTrack caught:', e);
                  }
                }
              });
            }
          })
          .catch((err) => {
            console.warn('[WebRTC] Dynamic camera acquisition failed:', err);
            setVideoOff(true);
          });
      } else {
        videoTracks.forEach((track) => {
          track.enabled = !isVideoOff;
        });
      }

      if (socketRef.current) {
        socketRef.current.emit('toggle-media', { roomId, isMuted: isAudioMuted, isVideoOff });
      }
    }
  }, [isAudioMuted, isVideoOff, roomId, setVideoOff]);

  // Screen Share Actions
  const stopScreenShare = useCallback(() => {
    console.log('[ScreenShare] Stopping screen share');
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    setScreenStream(null);
    setScreenSharing(false);

    // Restore local camera video track
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    if (cameraTrack) {
      cameraTrack.enabled = !isVideoOff;
    }

    peerConnectionsRef.current.forEach((pc) => {
      const videoTransceiver = pc.getTransceivers().find(
        (t) => (t.receiver && t.receiver.track && t.receiver.track.kind === 'video') ||
               (t.sender && t.sender.track && t.sender.track.kind === 'video')
      );
      if (videoTransceiver && videoTransceiver.sender) {
        videoTransceiver.sender.replaceTrack(cameraTrack).catch((err) => {
          console.warn('[WebRTC] replaceTrack error restoring camera:', err);
        });
      } else {
        const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(cameraTrack).catch((err) => {
            console.warn('[WebRTC] replaceTrack error restoring camera:', err);
          });
        }
      }
    });

    if (socketRef.current) {
      socketRef.current.emit('screen-share-changed', { roomId, isScreenSharing: false });
    }
  }, [roomId, isVideoOff, setScreenSharing]);

  const startScreenShare = useCallback(async () => {
    try {
      console.log('[ScreenShare] Requesting display media...');
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = displayStream.getVideoTracks()[0];
      if (!screenTrack) return;

      screenTrackRef.current = screenTrack;
      setScreenStream(displayStream);
      setScreenSharing(true);

      // Replace track on all existing peer connections
      peerConnectionsRef.current.forEach((pc) => {
        const videoTransceiver = pc.getTransceivers().find(
          (t) => (t.receiver && t.receiver.track && t.receiver.track.kind === 'video') ||
                 (t.sender && t.sender.track && t.sender.track.kind === 'video')
        );
        if (videoTransceiver && videoTransceiver.sender) {
          videoTransceiver.sender.replaceTrack(screenTrack).catch((err) => {
            console.warn('[WebRTC] replaceTrack error for screen:', err);
          });
        } else {
          const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack).catch((err) => {
              console.warn('[WebRTC] replaceTrack error for screen:', err);
            });
          } else {
            try {
              pc.addTrack(screenTrack, displayStream);
            } catch (e) {
              console.warn('[WebRTC] addTrack for screen:', e);
            }
          }
        }
      });

      if (socketRef.current) {
        socketRef.current.emit('screen-share-changed', { roomId, isScreenSharing: true });
      }

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn('[ScreenShare] Cancelled or denied:', err);
      setScreenSharing(false);
    }
  }, [roomId, setScreenSharing, stopScreenShare]);

  const toggleScreenShare = useCallback(async () => {
    if (screenTrackRef.current) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [startScreenShare, stopScreenShare]);

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
    screenStream,
    isSharingScreen: isScreenSharing,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
    sendChatMessage,
  };
};

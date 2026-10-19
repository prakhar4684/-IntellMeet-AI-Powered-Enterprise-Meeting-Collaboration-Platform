import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useMeetingStore, MeetingParticipantInfo } from '../store/useMeetingStore';
import { useWebRTC } from '../hooks/useWebRTC';
import { api } from '../services/api';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  Bot,
  PhoneOff,
  Send,
  Sparkles,
  Maximize2,
  Volume2,
  Share2,
  Check,
} from 'lucide-react';

// Dedicated Sub-component for Local User Video Tile (Guarantees fresh srcObject attachment across mode switches)
const LocalVideoTile: React.FC<{
  stream: MediaStream | null;
  isVideoOff: boolean;
  isAudioMuted: boolean;
  displayName: string;
  isCompact?: boolean;
  tileClass?: string;
}> = ({
  stream,
  isVideoOff,
  isAudioMuted,
  displayName,
  isCompact = false,
  tileClass = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isVideoOff]);

  const hasVideoStream =
    stream &&
    stream.getVideoTracks().length > 0 &&
    stream.getVideoTracks().some((t) => t.enabled) &&
    !isVideoOff;

  const containerClasses = isCompact
    ? 'w-44 h-28 sm:w-52 sm:h-32 shrink-0 relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-md'
    : `relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg ${tileClass}`;

  return (
    <div className={containerClasses}>
      {hasVideoStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          className="w-full h-full object-cover transform -scale-x-100"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400 p-2 text-center">
          <div
            className={`${
              isCompact ? 'h-10 w-10 text-sm' : 'h-16 w-16 sm:h-20 sm:w-20 text-xl sm:text-2xl'
            } rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-xl shadow-indigo-600/30`}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[140px]">
            {displayName} (You)
          </span>
          {!isCompact && <span className="text-[11px] text-slate-500">Camera is off</span>}
        </div>
      )}

      {/* Participant Name & Status Badge */}
      <div className="absolute bottom-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-white flex items-center gap-1.5 border border-slate-800/80 shadow-md">
        {isAudioMuted ? (
          <MicOff className="h-3 w-3 text-red-400" />
        ) : (
          <Mic className="h-3 w-3 text-emerald-400" />
        )}
        <span className="truncate max-w-[110px]">{displayName} (You)</span>
      </div>
    </div>
  );
};

// Dedicated Sub-component for Remote Participant Video & Audio Tile
const RemoteVideoTile: React.FC<{
  participant: MeetingParticipantInfo;
  isCompact?: boolean;
  tileClass?: string;
  onAudioBlocked?: () => void;
  registerAudio?: (el: HTMLAudioElement) => void;
  unregisterAudio?: () => void;
}> = ({
  participant,
  isCompact = false,
  tileClass = '',
  onAudioBlocked,
  registerAudio,
  unregisterAudio,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Register audio element with global audio manager for autoplay unblock
  useEffect(() => {
    const el = audioRef.current;
    if (el && registerAudio) {
      registerAudio(el);
    }
    return () => {
      if (unregisterAudio) {
        unregisterAudio();
      }
    };
  }, [participant.socketId, registerAudio, unregisterAudio]);

  // Synchronize media stream to video and audio elements
  useEffect(() => {
    if (participant.stream) {
      // 1. Attach to Video element (muted to ensure 100% autoplay compliance)
      if (videoRef.current) {
        videoRef.current.srcObject = participant.stream;
        videoRef.current.play().catch(() => {});
      }

      // 2. Attach to Audio element (unmuted for remote voice playback)
      if (audioRef.current) {
        audioRef.current.srcObject = participant.stream;
        audioRef.current.volume = 1.0;
        audioRef.current.play().catch((err: any) => {
          console.warn('[RemoteVideoTile] Audio autoplay blocked:', err?.name);
          if (err?.name === 'NotAllowedError' && onAudioBlocked) {
            onAudioBlocked();
          }
        });
      }
    }
  }, [participant.stream, participant.isVideoOff, participant.isScreenSharing, onAudioBlocked]);

  const hasVideoStream =
    participant.stream &&
    participant.stream.getVideoTracks().length > 0 &&
    participant.stream.getVideoTracks()[0].enabled &&
    (!participant.isVideoOff || participant.isScreenSharing);

  const containerClasses = isCompact
    ? 'w-44 h-28 sm:w-52 sm:h-32 shrink-0 relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-md'
    : `relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg ${tileClass}`;

  return (
    <div className={containerClasses}>
      {/* Remote Video element - muted so browser never blocks rendering */}
      {hasVideoStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400 p-2 text-center">
          <div
            className={`${
              isCompact ? 'h-10 w-10 text-sm' : 'h-16 w-16 sm:h-20 sm:w-20 text-xl sm:text-2xl'
            } rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-xl shadow-indigo-600/30`}
          >
            {participant.displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-[140px]">
            {participant.displayName}
          </span>
          {!isCompact && <span className="text-[11px] text-slate-500">Camera is off</span>}
        </div>
      )}

      {/* Dedicated Remote Audio Element for guaranteed sound playback */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Participant Name & Status Badge */}
      <div className="absolute bottom-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-white flex items-center gap-1.5 border border-slate-800/80 shadow-md">
        {participant.isMuted ? (
          <MicOff className="h-3 w-3 text-red-400" />
        ) : (
          <Mic className="h-3 w-3 text-emerald-400" />
        )}
        <span className="truncate max-w-[110px]">{participant.displayName}</span>
        {participant.isScreenSharing && (
          <span className="bg-indigo-600 text-[9px] px-1.5 py-0.5 rounded text-white font-bold ml-1">
            Screen
          </span>
        )}
      </div>
    </div>
  );
};

// Dedicated Screen Share Presentation Stage Component
const PresenterScreenTile: React.FC<{
  stream: MediaStream | null;
  presenterName: string;
  isLocal: boolean;
  onStopShare?: () => void;
}> = ({ stream, presenterName, isLocal, onStopShare }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('[ScreenShare] Video play caught:', err);
      });
    }
  }, [stream]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const hasVideo = !!stream && stream.getVideoTracks().length > 0;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl group min-h-[300px]"
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          className="w-full h-full object-contain max-h-[calc(100vh-270px)]"
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Monitor className="h-12 w-12 text-indigo-400 animate-pulse" />
          <span className="text-sm font-medium">Connecting to {presenterName}'s screen...</span>
        </div>
      )}

      {/* Top Left Info Badge */}
      <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-white flex items-center gap-2 shadow-lg z-10">
        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
        <Monitor className="h-4 w-4 text-indigo-400" />
        <span>{isLocal ? 'You are sharing your screen' : `${presenterName} is presenting`}</span>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {isLocal && onStopShare && (
          <button
            onClick={onStopShare}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-lg transition-all"
          >
            Stop Sharing
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 p-2 rounded-xl backdrop-blur-md border border-slate-700/80 transition-all"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const LiveMeetingRoomPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const queryName = searchParams.get('displayName');
  const [displayName] = useState<string>(() => {
    // 1. If user is logged in, use their real profile name
    if (user?.name) return user.name;
    // 2. If name was entered in lobby sessionStorage
    const stored = sessionStorage.getItem('intellmeet_displayName');
    if (stored) return stored;
    // 3. If query parameter was passed explicitly
    if (queryName && queryName.trim()) {
      return queryName.trim();
    }
    // 4. Fallback: generate a unique random Guest name (e.g. Guest_482)
    return `Guest_${Math.floor(100 + Math.random() * 900)}`;
  });

  // Automatically remove ?displayName=... from address bar so copying URL never leaks name to others
  useEffect(() => {
    if (searchParams.has('displayName')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const [copiedInvite, setCopiedInvite] = useState(false);
  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/room/${meetingRoomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const [sessionUserId] = useState<string>(
    user?.id || `user_${Math.random().toString(36).substring(2, 9)}`
  );

  const meetingRoomId = code || 'room-default';

  const {
    isAudioMuted,
    isVideoOff,
    isRecording,
    activeTab,
    chatMessages,
    participants,
    toggleAudio,
    toggleVideo,
    toggleRecording,
    setActiveTab,
  } = useMeetingStore();

  const {
    localStream,
    screenStream,
    isSharingScreen,
    toggleScreenShare: handleToggleScreenShare,
    sendChatMessage,
  } = useWebRTC(meetingRoomId, sessionUserId, displayName);

  const [messageInput, setMessageInput] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);

  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Audio Element Registry for global unlock
  const registerAudioElement = useCallback((socketId: string, el: HTMLAudioElement) => {
    audioElementsRef.current.set(socketId, el);
  }, []);

  const unregisterAudioElement = useCallback((socketId: string) => {
    audioElementsRef.current.delete(socketId);
  }, []);

  // Global Audio Unlock handler for browser Autoplay Policy
  const unlockAllAudio = useCallback(() => {
    audioElementsRef.current.forEach((el) => {
      el.play().catch(() => {});
    });
    setIsAudioBlocked(false);
  }, []);

  // Listen for user interaction to unblock audio seamlessly
  useEffect(() => {
    const handleUserInteraction = () => {
      unlockAllAudio();
    };
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [unlockAllAudio]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendChatMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await api.queryAiAssistant(meetingRoomId, aiQuery);
      setAiResponse(res.answer);
    } catch {
      setAiResponse('IntellMeet AI Copilot: Meeting discussion and decisions are synchronized.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLeaveCall = async () => {
    try {
      await api.endMeeting(meetingRoomId);
    } catch {
      // Handled
    }
    navigate(`/report/${meetingRoomId}`);
  };

  const totalParticipantsCount = participants.length + 1; // Remote + Local
  const remotePresenter = participants.find((p) => p.isScreenSharing);
  const isAnyonePresenting = isSharingScreen || !!remotePresenter;

  // Intelligent Responsive Grid Configuration based on participant count
  const getGridConfig = (count: number) => {
    switch (count) {
      case 1:
        // Single user: Large, centered tile
        return {
          gridClass: 'grid grid-cols-1 w-full max-w-4xl mx-auto flex-1 items-center justify-center p-2',
          tileClass: 'w-full h-full max-h-[calc(100vh-210px)] aspect-video mx-auto',
        };
      case 2:
        // Two users: Balanced 50/50 split across screen
        return {
          gridClass: 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto flex-1 items-center justify-center p-2',
          tileClass: 'w-full h-full max-h-[calc(100vh-220px)] aspect-video mx-auto',
        };
      case 3:
      case 4:
        // 3 or 4 users: 2x2 grid
        return {
          gridClass: 'grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-6xl mx-auto flex-1 items-center justify-center p-2',
          tileClass: 'w-full h-full max-h-[calc(50vh-120px)] aspect-video mx-auto',
        };
      case 5:
      case 6:
        // 5 or 6 users: 3x2 grid
        return {
          gridClass: 'grid grid-cols-2 sm:grid-cols-3 gap-3 w-full flex-1 items-center justify-center p-2',
          tileClass: 'w-full h-full max-h-[calc(50vh-120px)] aspect-video mx-auto',
        };
      default:
        // 7+ users: 4 columns
        return {
          gridClass: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full flex-1 items-center justify-center p-2',
          tileClass: 'w-full h-full max-h-[calc(33vh-90px)] aspect-video mx-auto',
        };
    }
  };

  const gridConfig = getGridConfig(totalParticipantsCount);

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/30">
            <VideoIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              IntellMeet Live Session <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">Room Code: {meetingRoomId}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyInviteLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            title="Copy clean invitation link to share"
          >
            {copiedInvite ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-white" />
                <span className="hidden sm:inline">Invite</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>{totalParticipantsCount} Online</span>
          </div>

          {isRecording && (
            <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-500" /> REC Active
            </div>
          )}
        </div>
      </header>

      {/* Autoplay Audio Unblock Notification Banner */}
      {isAudioBlocked && (
        <div
          onClick={unlockAllAudio}
          className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xl transition-all z-50 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <span>Browser paused remote audio. Tap anywhere to enable sound and hear other participants!</span>
          </div>
          <span className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
            Tap to Hear 🔊
          </span>
        </div>
      )}

      {/* Main Area: Video / Presentation Stage & Side Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video / Presentation Viewport */}
        <main className="flex-1 bg-slate-950 p-2 sm:p-4 flex flex-col justify-between overflow-hidden min-h-0">
          {isAnyonePresenting ? (
            <div className="flex-1 flex flex-col gap-3 min-h-0 justify-between">
              {/* Presentation Stage */}
              {isSharingScreen ? (
                <PresenterScreenTile
                  stream={screenStream}
                  presenterName={displayName}
                  isLocal={true}
                  onStopShare={handleToggleScreenShare}
                />
              ) : (
                <PresenterScreenTile
                  stream={remotePresenter?.stream || null}
                  presenterName={remotePresenter?.displayName || 'Participant'}
                  isLocal={false}
                />
              )}

              {/* Compact Filmstrip of Participants at bottom */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 shrink-0 justify-center w-full">
                {/* Local Participant Compact Tile */}
                <LocalVideoTile
                  stream={localStream}
                  isVideoOff={isVideoOff}
                  isAudioMuted={isAudioMuted}
                  displayName={displayName}
                  isCompact={true}
                />

                {/* Remote Participants Compact Tiles */}
                {participants.map((peer) => (
                  <RemoteVideoTile
                    key={peer.socketId}
                    participant={peer}
                    isCompact={true}
                    onAudioBlocked={() => setIsAudioBlocked(true)}
                    registerAudio={(el) => registerAudioElement(peer.socketId, el)}
                    unregisterAudio={() => unregisterAudioElement(peer.socketId)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={gridConfig.gridClass}>
              {/* Local Participant Video Tile */}
              <LocalVideoTile
                stream={localStream}
                isVideoOff={isVideoOff}
                isAudioMuted={isAudioMuted}
                displayName={displayName}
                isCompact={false}
                tileClass={gridConfig.tileClass}
              />

              {/* Remote Participants Video Tiles with Responsive Dimensions */}
              {participants.map((peer) => (
                <RemoteVideoTile
                  key={peer.socketId}
                  participant={peer}
                  tileClass={gridConfig.tileClass}
                  onAudioBlocked={() => setIsAudioBlocked(true)}
                  registerAudio={(el) => registerAudioElement(peer.socketId, el)}
                  unregisterAudio={() => unregisterAudioElement(peer.socketId)}
                />
              ))}
            </div>
          )}

          {/* Bottom Control Bar */}
          <div className="mt-2 sm:mt-4 h-16 bg-slate-900 border border-slate-800 rounded-2xl px-4 sm:px-6 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full shadow-2xl z-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleAudio}
                title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                className={`p-2.5 sm:p-3 rounded-xl transition-all ${
                  isAudioMuted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleVideo}
                title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
                className={`p-2.5 sm:p-3 rounded-xl transition-all ${
                  isVideoOff
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleToggleScreenShare}
                title={isSharingScreen ? 'Stop Sharing Screen' : 'Share Screen'}
                className={`p-2.5 sm:p-3 rounded-xl transition-all ${
                  isSharingScreen
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Monitor className="h-5 w-5" />
              </button>
              <button
                onClick={toggleRecording}
                title="Toggle Recording"
                className={`p-2.5 sm:p-3 rounded-xl transition-all ${
                  isRecording ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-xs font-bold uppercase">Rec</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-2.5 sm:p-3 rounded-xl transition-all relative ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`p-2.5 sm:p-3 rounded-xl transition-all relative ${
                  activeTab === 'participants'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="h-5 w-5" />
                {participants.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {totalParticipantsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`p-2.5 sm:p-3 rounded-xl transition-all ${
                  activeTab === 'ai'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleLeaveCall}
              className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-3 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all"
            >
              <PhoneOff className="h-4 w-4" />
              <span className="hidden sm:inline">End Call</span>
            </button>
          </div>
        </main>

        {/* Side Panel: Participants, Chat, AI */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="uppercase tracking-wider">
              {activeTab === 'participants'
                ? `Participants (${totalParticipantsCount})`
                : activeTab}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div className="space-y-2.5">
                {/* Local user tile in list */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 font-bold flex items-center justify-center text-white text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{displayName} (You)</p>
                      <p className="text-[10px] text-indigo-400 font-medium">
                        {isSharingScreen ? 'Host • Presenting' : 'Host'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSharingScreen && <Monitor className="h-3.5 w-3.5 text-indigo-400" />}
                    {isAudioMuted ? (
                      <MicOff className="h-3.5 w-3.5 text-red-400" />
                    ) : (
                      <Mic className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* All remote participants */}
                {participants.map((p) => (
                  <div
                    key={p.socketId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-purple-600 font-bold flex items-center justify-center text-white text-xs">
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{p.displayName}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.isScreenSharing ? 'Participant • Presenting' : 'Participant'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.isScreenSharing && <Monitor className="h-3.5 w-3.5 text-indigo-400" />}
                      {p.isMuted ? (
                        <MicOff className="h-3.5 w-3.5 text-red-400" />
                      ) : (
                        <Mic className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      {p.isVideoOff && !p.isScreenSharing ? (
                        <VideoOff className="h-3.5 w-3.5 text-slate-500" />
                      ) : (
                        <VideoIcon className="h-3.5 w-3.5 text-indigo-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-3 overflow-y-auto mb-4 pr-1">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 space-y-1">
                      <MessageSquare className="h-8 w-8 mx-auto text-slate-700" />
                      <p>No messages yet.</p>
                      <p className="text-[10px]">Send a message to everyone in the room.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          msg.senderName === displayName
                            ? 'bg-indigo-600/20 border-indigo-500/30 ml-4'
                            : 'bg-slate-950 border-slate-800/80 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-indigo-300 mb-1">
                          <span>{msg.senderName}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            {/* AI Assistant Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="h-4 w-4" /> Real-Time AI Copilot
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ask questions about agenda items, discussion topics, and action tasks.
                  </p>
                </div>

                <form onSubmit={handleAiQuery} className="space-y-2">
                  <input
                    type="text"
                    placeholder="e.g. Summarize what we decided..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isAiLoading ? 'Analyzing...' : 'Ask AI Copilot'}
                  </button>
                </form>

                {aiResponse && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <span className="font-semibold text-indigo-400">AI Response:</span>
                    <p className="text-slate-300 leading-relaxed">{aiResponse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
} from 'lucide-react';

// Dedicated Sub-component for Remote Participant Video & Audio Tile
const RemoteVideoTile: React.FC<{ participant: MeetingParticipantInfo }> = ({ participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (participant.stream) {
      if (videoRef.current) {
        videoRef.current.srcObject = participant.stream;
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.srcObject = participant.stream;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [participant.stream]);

  const hasVideoStream =
    participant.stream &&
    participant.stream.getVideoTracks().length > 0 &&
    participant.stream.getVideoTracks()[0].enabled &&
    !participant.isVideoOff;

  return (
    <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg transition-all">
      {hasVideoStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-xl shadow-indigo-600/30">
            {participant.displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-slate-200">{participant.displayName}</span>
          <span className="text-[11px] text-slate-500">Camera is off</span>
        </div>
      )}

      {/* Hidden Audio Element for playback regardless of video state */}
      <audio ref={audioRef} autoPlay playsInline />

      <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-medium text-white flex items-center gap-2 border border-slate-800/80 shadow-md">
        {participant.isMuted ? (
          <MicOff className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <Mic className="h-3.5 w-3.5 text-emerald-400" />
        )}
        <span>{participant.displayName}</span>
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
  const [displayName] = useState<string>(
    queryName || user?.name || `Guest_${Math.floor(Math.random() * 900 + 100)}`
  );
  const [sessionUserId] = useState<string>(
    user?.id || `user_${Math.random().toString(36).substring(2, 9)}`
  );

  const meetingRoomId = code || 'room-default';

  const {
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isRecording,
    activeTab,
    chatMessages,
    participants,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    setActiveTab,
  } = useMeetingStore();

  const { localStream, startScreenShare, sendChatMessage } = useWebRTC(
    meetingRoomId,
    sessionUserId,
    displayName
  );

  const [messageInput, setMessageInput] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

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

        <div className="flex items-center gap-4">
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

      {/* Main Area: Video Grid & Side Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <main className="flex-1 bg-slate-950 p-4 flex flex-col justify-between overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 items-center justify-center">
            {/* Local Participant Video Tile */}
            <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg group">
              {isVideoOff || !localStream ? (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <div className="h-16 w-16 rounded-full bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-300 text-xl shadow-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-300">{displayName} (You)</span>
                  <span className="text-[11px] text-slate-500">Camera is off</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}

              <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-medium text-white flex items-center gap-2 border border-slate-800/80 shadow-md">
                {isAudioMuted ? (
                  <MicOff className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Mic className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <span>{displayName} (You)</span>
              </div>
            </div>

            {/* Remote Participants Video Tiles */}
            {participants.map((peer) => (
              <RemoteVideoTile key={peer.socketId} participant={peer} />
            ))}
          </div>

          {/* Bottom Control Bar */}
          <div className="mt-4 h-16 bg-slate-900 border border-slate-800 rounded-2xl px-6 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full shadow-2xl">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAudio}
                title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                className={`p-3 rounded-xl transition-all ${
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
                className={`p-3 rounded-xl transition-all ${
                  isVideoOff
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => {
                  toggleScreenShare();
                  startScreenShare();
                }}
                title="Share Screen"
                className={`p-3 rounded-xl transition-all ${
                  isScreenSharing
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Monitor className="h-5 w-5" />
              </button>
              <button
                onClick={toggleRecording}
                title="Toggle Recording"
                className={`p-3 rounded-xl transition-all ${
                  isRecording ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-xs font-bold uppercase">Rec</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-3 rounded-xl transition-all relative ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`p-3 rounded-xl transition-all relative ${
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
                className={`p-3 rounded-xl transition-all ${
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
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all"
            >
              <PhoneOff className="h-4 w-4" /> End Call
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
                      <p className="text-[10px] text-indigo-400 font-medium">Host</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
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
                        <p className="text-[10px] text-slate-400">Participant</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.isMuted ? (
                        <MicOff className="h-3.5 w-3.5 text-red-400" />
                      ) : (
                        <Mic className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      {p.isVideoOff ? (
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

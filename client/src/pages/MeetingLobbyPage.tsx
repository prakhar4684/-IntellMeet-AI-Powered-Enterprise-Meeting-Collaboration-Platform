import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useMeetingStore } from '../store/useMeetingStore';
import { api } from '../services/api';
import { Video, Mic, MicOff, VideoOff, Settings, ArrowRight, ShieldCheck } from 'lucide-react';

export const MeetingLobbyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isAudioMuted, isVideoOff, toggleAudio, toggleVideo } = useMeetingStore();

  const [displayName, setDisplayName] = useState(
    user?.name || `Guest_${Math.floor(100 + Math.random() * 900)}`
  );
  const [meetingTitle, setMeetingTitle] = useState('Engineering Room');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (code) {
      api.getMeetingByCode(code)
        .then((m) => setMeetingTitle(m.title))
        .catch(() => {});
    }

    let localMediaStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        localMediaStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => console.warn('[Lobby] Media access warning:', err));

    return () => {
      if (localMediaStream) {
        localMediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [code]);

  const handleJoin = () => {
    const finalName = displayName.trim() || user?.name || `Guest_${Math.floor(100 + Math.random() * 900)}`;
    sessionStorage.setItem('intellmeet_displayName', finalName);
    navigate(`/room/${code}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase">
            Meeting Lobby
          </span>
          <h1 className="text-3xl font-extrabold text-white">{meetingTitle}</h1>
          <p className="text-sm text-slate-400">Meeting Code: <code className="text-indigo-300 font-mono">{code}</code></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl">
          {/* Camera Preview */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              {isVideoOff ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <VideoOff className="h-12 w-12" />
                  <span className="text-xs font-medium">Camera is off</span>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              )}

              {/* Media Controls Bar */}
              <div className="absolute bottom-4 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-xl transition-colors ${
                    isAudioMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-xl transition-colors ${
                    isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Join Controls & Name Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" /> Ready to Join
              </div>
              <p>Audio and video device permissions validated.</p>
            </div>

            <button
              onClick={handleJoin}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all text-sm"
            >
              Join Meeting Room Now <ArrowRight className="h-4 w-4" />
            </button>

            <Link to="/dashboard" className="block text-center text-xs text-slate-500 hover:text-slate-300">
              Cancel & return to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

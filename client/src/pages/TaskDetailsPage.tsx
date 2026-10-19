import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ArrowLeft, CheckCircle2, Clock, MessageSquare, Tag } from 'lucide-react';

export const TaskDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-4xl">
          <Link to="/tasks" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Kanban Board
          </Link>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400">
                    High Priority
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                    In Progress
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-white">Setup WebRTC Mesh & STUN/TURN Signaling</h1>
                <p className="text-xs text-slate-400 mt-1">Task ID: <code className="text-indigo-300 font-mono">{id || 'task-101'}</code></p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                Configure peer connection offer/answer exchange via Socket.io signaling. Verify audio/video track replacement for screen sharing streams.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" /> Comments & Activity Log
              </h3>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center justify-between text-indigo-400 font-semibold mb-1">
                  <span>Alex Rivera</span>
                  <span className="text-[10px] text-slate-500">2 hours ago</span>
                </div>
                <p>ICE candidate exchange logic verified over WebSocket connections.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

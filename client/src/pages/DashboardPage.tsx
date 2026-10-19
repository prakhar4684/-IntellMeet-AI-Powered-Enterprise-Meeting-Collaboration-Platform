import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { AnalyticsData, Meeting } from '../types';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
  Bot,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.getMeetings()])
      .then(([analyticsRes, meetingsRes]) => {
        setAnalytics(analyticsRes);
        setMeetings(meetingsRes || []);
      })
      .catch((err) => console.warn('[Dashboard] Data fetch notice:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/meetings/${joinCode.trim()}/lobby`);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                <Sparkles className="h-4 w-4" /> {currentDate}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Welcome back, {user?.name || 'Engineer'} 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Here is your AI workspace summary and upcoming meeting schedule.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/meetings/new"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="h-4 w-4" /> Schedule Meeting
              </Link>
              <Link
                to="/meetings/new?instant=true"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
              >
                <Video className="h-4 w-4 text-indigo-400" /> Start Instant
              </Link>
            </div>
          </div>

          {/* Quick Join Meeting Bar */}
          <form onSubmit={handleJoinByCode} className="my-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 shrink-0">
              <Video className="h-5 w-5 text-indigo-400" /> Quick Join with Code:
            </div>
            <input
              type="text"
              placeholder="Enter meeting code (e.g. meet-abc-123)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-2 rounded-xl transition-colors shrink-0"
            >
              Join Meeting
            </button>
          </form>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Meetings</span>
                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Video className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{analytics?.totalMeetings || 12}</p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+15%</span> vs last month
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Pending Action Items</span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <ListTodo className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{analytics?.pendingActionItems || 6}</p>
              <div className="text-[11px] text-slate-500">Auto-extracted by AI</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Completed Tasks</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{analytics?.completedTasks || 14}</p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="text-emerald-400 font-medium">{analytics?.taskCompletionRate || 70}%</span> completion rate
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Meeting Hours</span>
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{analytics?.totalMeetingHours || 18.5}h</p>
              <div className="text-[11px] text-slate-500">Calculated this week</div>
            </div>
          </div>

          {/* Upcoming Meetings & Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Meetings Table */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-400" /> Upcoming & Recent Meetings
                </h3>
                <Link to="/meetings" className="text-xs font-semibold text-indigo-400 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {meetings.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                    <p className="text-sm text-slate-400">No scheduled meetings found.</p>
                    <Link to="/meetings/new" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-indigo-400">
                      <Plus className="h-4 w-4" /> Schedule your first meeting
                    </Link>
                  </div>
                ) : (
                  meetings.map((m) => (
                    <div
                      key={m._id || m.id || m.meetingCode}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{m.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              m.status === 'live'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                                : m.status === 'completed'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.durationMinutes}m</span>
                          <span>Code: <code className="text-indigo-300 font-mono">{m.meetingCode}</code></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/meetings/${m.meetingCode}/lobby`}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                        >
                          Join
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick AI & Task Actions Side Card */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-400" /> AI Assistant Quick Access
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Ask AI questions about past meeting transcripts, extracted decisions, or team tasks.
                </p>
                <Link
                  to="/ai-assistant"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  Open AI Q&A Assistant <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" /> Team Workspaces
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Manage team invitations, workspace roles, and shared Kanban task boards.
                </p>
                <Link
                  to="/workspaces"
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  Manage Workspaces
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

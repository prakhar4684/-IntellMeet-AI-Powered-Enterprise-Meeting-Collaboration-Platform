import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { Meeting } from '../types';
import { Video, Plus, Clock, Search, Calendar, Copy, Check } from 'lucide-react';

export const MeetingsListPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    api.getMeetings().then((res) => setMeetings(res || [])).catch(() => {});
  }, []);

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/meetings/${code}/lobby`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filtered = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.meetingCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Meetings Directory</h1>
              <p className="text-sm text-slate-400 mt-1">
                Schedule, manage, and join real-time WebRTC meetings.
              </p>
            </div>

            <Link
              to="/meetings/new"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto"
            >
              <Plus className="h-4 w-4" /> Schedule New Meeting
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="my-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search meetings by title or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Meetings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full p-12 text-center border border-dashed border-slate-800 rounded-3xl">
                <Video className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-base text-slate-300 font-semibold">No meetings found</p>
                <p className="text-xs text-slate-500 mt-1">Schedule a meeting or start an instant room.</p>
              </div>
            ) : (
              filtered.map((m) => (
                <div
                  key={m._id || m.id || m.meetingCode}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.status === 'live'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                            : m.status === 'completed'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {m.status}
                      </span>
                      <button
                        onClick={() => handleCopyLink(m.meetingCode)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
                      >
                        {copiedCode === m.meetingCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedCode === m.meetingCode ? 'Copied' : 'Invite Link'}
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug">{m.title}</h3>
                    {m.description && <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>}

                    <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-indigo-400" /> {new Date(m.startTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-indigo-400" /> {m.durationMinutes}m</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-indigo-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {m.meetingCode}
                    </span>
                    <div className="flex items-center gap-2">
                      {m.status === 'completed' ? (
                        <Link
                          to={`/report/${m.meetingCode}`}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                        >
                          View Report
                        </Link>
                      ) : (
                        <Link
                          to={`/meetings/${m.meetingCode}/lobby`}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20"
                        >
                          Join Lobby
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

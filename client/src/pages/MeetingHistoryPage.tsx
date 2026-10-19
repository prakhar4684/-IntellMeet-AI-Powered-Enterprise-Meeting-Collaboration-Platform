import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { Meeting } from '../types';
import { History, FileText, Calendar, Clock, ArrowRight } from 'lucide-react';

export const MeetingHistoryPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    api.getMeetings({ status: 'completed' })
      .then((res) => setMeetings(res || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="pb-6 border-b border-slate-800">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <History className="h-7 w-7 text-indigo-400" /> Meeting History & Reports
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Access transcripts, AI executive summaries, and action item logs for completed meetings.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {meetings.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl space-y-3">
                <FileText className="h-12 w-12 text-slate-600 mx-auto" />
                <p className="text-base text-slate-300 font-semibold">No completed meeting history found</p>
                <p className="text-xs text-slate-500">Completed meetings automatically process AI reports here.</p>
              </div>
            ) : (
              meetings.map((m) => (
                <div
                  key={m._id || m.id || m.meetingCode}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{m.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-indigo-400" /> {new Date(m.startTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-indigo-400" /> {m.durationMinutes}m</span>
                      <span>Code: <code className="text-indigo-300 font-mono">{m.meetingCode}</code></span>
                    </div>
                  </div>

                  <Link
                    to={`/report/${m.meetingCode}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    View AI Report <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

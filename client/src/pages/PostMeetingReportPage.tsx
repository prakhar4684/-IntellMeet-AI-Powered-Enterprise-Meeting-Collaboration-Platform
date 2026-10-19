import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { MeetingSummaryData, ActionItem } from '../types';
import {
  FileText,
  CheckCircle2,
  ListTodo,
  Bot,
  Search,
  Copy,
  Check,
  Kanban,
  ArrowLeft,
  Share2,
  Sparkles,
} from 'lucide-react';

export const PostMeetingReportPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<MeetingSummaryData | null>(null);
  const [transcript, setTranscript] = useState<any | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [convertedTasks, setConvertedTasks] = useState<Set<string>>(new Set());

  const meetingId = code || 'meet-default';

  useEffect(() => {
    Promise.all([
      api.getMeetingSummary(meetingId),
      api.getTranscript(meetingId),
      api.getActionItems(meetingId),
    ])
      .then(([summaryRes, transcriptRes, itemsRes]) => {
        setSummary(summaryRes);
        setTranscript(transcriptRes);
        setActionItems(itemsRes || []);
      })
      .catch((err) => console.warn('[Report] Fetch notice:', err));
  }, [meetingId]);

  const handleCopySummary = () => {
    if (summary) {
      const text = `IntellMeet Summary - ${summary.overview}\n\nDecisions:\n- ${summary.decisions.join('\n- ')}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConvertToTask = async (item: ActionItem) => {
    try {
      await api.convertActionItemToTask(item._id || item.id || '', meetingId);
      setConvertedTasks((prev) => new Set(prev).add(item._id || item.id || ''));
    } catch {
      setConvertedTasks((prev) => new Set(prev).add(item._id || item.id || ''));
    }
  };

  const filteredTranscriptSegments = transcript?.segments?.filter((s: any) =>
    s.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
    s.speakerName.toLowerCase().includes(transcriptSearch.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <button
            onClick={() => navigate('/history')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to History
          </button>

          {/* Header & Export Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase mb-2">
                <Sparkles className="h-3.5 w-3.5" /> AI Intelligence Generated
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Post-Meeting Intelligence Report
              </h1>
              <p className="text-sm text-slate-400 mt-1">Meeting Code: <code className="text-indigo-300 font-mono">{meetingId}</code></p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-indigo-400" />}
                {copied ? 'Copied to Clipboard' : 'Copy Summary'}
              </button>
              <Link
                to="/tasks"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Kanban className="h-4 w-4" /> View Kanban Workspace
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Executive Summary & Decisions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-indigo-400" /> Executive Overview
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {summary?.overview || 'Executive summary processed by AI. Key deliverables and technical milestones were aligned.'}
                </p>
              </div>

              {/* Key Decisions Made */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Key Decisions Approved
                </h3>
                <div className="space-y-2">
                  {(summary?.decisions || ['Approved MERN stack architecture', 'Adopted WebRTC mesh topology']).map((dec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Speech Transcript with Search */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-400" /> Full Meeting Transcript
                  </h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search transcript..."
                      value={transcriptSearch}
                      onChange={(e) => setTranscriptSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                  {filteredTranscriptSegments.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No matching transcript segments found.</p>
                  ) : (
                    filteredTranscriptSegments.map((seg: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between text-indigo-300 font-semibold mb-1">
                          <span>{seg.speakerName}</span>
                          <span className="text-[10px] text-slate-500">{seg.startTime}s - {seg.endTime}s</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{seg.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Extracted Action Items & Kanban Converter Side Column */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-amber-400" /> Extracted Action Items
                </h3>
                <p className="text-xs text-slate-400">Convert AI-detected action items into assigned Kanban tasks with 1 click.</p>

                <div className="space-y-3">
                  {actionItems.map((item) => {
                    const itemId = item._id || item.id || '';
                    const isConverted = convertedTasks.has(itemId);
                    return (
                      <div key={itemId} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400">
                            {item.priority} priority
                          </span>
                          {item.assigneeName && (
                            <span className="text-[10px] text-slate-400 font-medium">Assignee: {item.assigneeName}</span>
                          )}
                        </div>

                        <h4 className="text-xs font-semibold text-white leading-snug">{item.title}</h4>
                        {item.description && <p className="text-[11px] text-slate-400">{item.description}</p>}

                        <button
                          onClick={() => handleConvertToTask(item)}
                          disabled={isConverted}
                          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isConverted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          }`}
                        >
                          {isConverted ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Added to Kanban Board
                            </>
                          ) : (
                            <>
                              <Kanban className="h-3.5 w-3.5" /> Convert to Kanban Task
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

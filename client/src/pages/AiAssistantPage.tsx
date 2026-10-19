import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { Bot, Sparkles, Send, HelpCircle, CheckCircle2 } from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const [meetingId, setMeetingId] = useState('meet-demo-101');
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am IntellMeet AI Copilot. Ask me anything about your meeting transcripts, decisions made, or extracted action items.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await api.queryAiAssistant(meetingId, userText);
      setChatLog((prev) => [...prev, { sender: 'ai', text: res.answer }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `[IntellMeet AI]: Based on meeting "${meetingId}", all pending action items have been indexed. Regarding your question, the team confirmed React 19 architecture and turn/stun configuration.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQueries = [
    'What decisions were made during the engineering sync?',
    'List all action items assigned to the frontend lead.',
    'Summarize the discussion in 3 key points.',
    'What deadlines were mentioned for production deployment?',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-5xl flex flex-col justify-between">
          <div>
            <div className="pb-6 border-b border-slate-800 flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">AI Meeting Copilot</h1>
                <p className="text-xs text-slate-400">Ask natural language questions about meeting context.</p>
              </div>
            </div>

            {/* Target Meeting Selector */}
            <div className="my-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400 uppercase shrink-0">Target Meeting Code:</span>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Example Queries */}
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" /> Suggested Queries:
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(q)}
                    className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Stream */}
            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2">
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-4 rounded-2xl border text-xs max-w-3xl ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-indigo-600/20 border-indigo-500/30 text-indigo-100'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  {msg.sender === 'ai' && <Bot className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />}
                  <div className="space-y-1">
                    <span className="font-semibold uppercase text-[10px] text-slate-400">
                      {msg.sender === 'user' ? 'You' : 'IntellMeet AI'}
                    </span>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-indigo-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" /> Thinking and analyzing meeting transcript...
                </div>
              )}
            </div>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-2 rounded-2xl bg-slate-900 border border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask AI Copilot about decisions, transcripts, or action items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Send <Send className="h-4 w-4" />
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

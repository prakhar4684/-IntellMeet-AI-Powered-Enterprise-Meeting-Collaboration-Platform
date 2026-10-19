import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { Video, Calendar, Clock, ArrowLeft, Bot, Shield, Check } from 'lucide-react';

export const CreateMeetingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isInstant = searchParams.get('instant') === 'true';

  const [formData, setFormData] = useState({
    title: isInstant ? 'Instant Meeting Session' : 'Engineering Architecture Sync',
    description: 'Project review, technical roadmap, and real-time AI summary extraction.',
    startTime: new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16),
    durationMinutes: 30,
    isRecordingEnabled: true,
    isAiEnabled: true,
    invitees: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const inviteesList = formData.invitees.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.createMeeting({
        ...formData,
        invitees: inviteesList,
      });

      if (isInstant && res.meetingCode) {
        navigate(`/room/${res.meetingCode}`);
      } else {
        navigate('/meetings');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-4xl">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isInstant ? 'Start Instant Meeting' : 'Schedule New Meeting'}
                </h1>
                <p className="text-xs text-slate-400">Configure WebRTC audio/video settings & AI transcription.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sprint Planning Sync"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Description / Agenda</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will be discussed during this meeting?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Duration (Minutes)</label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={90}>1.5 Hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Invited Email Addresses</label>
                <input
                  type="text"
                  value={formData.invitees}
                  onChange={(e) => setFormData({ ...formData, invitees: e.target.value })}
                  placeholder="sarah@company.com, michael@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Separate emails with commas.</p>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">Enable AI Intelligence & Summarizer</h4>
                      <p className="text-xs text-slate-400">Automatically extract decisions & action items.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isAiEnabled}
                    onChange={(e) => setFormData({ ...formData, isAiEnabled: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">Cloud Recording Capability</h4>
                      <p className="text-xs text-slate-400">Allow host to record video/audio streams.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isRecordingEnabled}
                    onChange={(e) => setFormData({ ...formData, isRecordingEnabled: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : isInstant ? 'Launch Instant Room' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

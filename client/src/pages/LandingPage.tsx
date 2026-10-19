import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import {
  Video,
  Sparkles,
  Bot,
  Kanban,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  MessageSquare,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="h-4 w-4" /> Next-Gen Enterprise AI Collaboration
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight">
            Meet Smarter. Collaborate Better.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Get Things Done.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AI-powered meetings that automatically turn conversations into summaries, decisions, and actionable tasks.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/meetings/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-8 py-4 rounded-2xl transition-all"
            >
              <Video className="h-5 w-5 text-indigo-400" /> Start Instant Meeting
            </Link>
          </div>

          {/* Product Preview Card */}
          <div className="mt-16 relative max-w-5xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-mono text-slate-500">IntellMeet Room • Live Session & AI Pipeline</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              {/* WebRTC Video Participant Grid Mock */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 to-slate-900 flex items-center justify-center">
                    <Video className="h-16 w-16 text-indigo-500/40 animate-pulse" />
                  </div>
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-2 border border-slate-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Alex Rivera (Host)
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-video rounded-xl bg-slate-950 border border-slate-800 p-3 flex items-end">
                    <span className="text-xs text-slate-300 font-medium">Sarah Chen (Frontend)</span>
                  </div>
                  <div className="aspect-video rounded-xl bg-slate-950 border border-slate-800 p-3 flex items-end">
                    <span className="text-xs text-slate-300 font-medium">Michael Scott (Product Manager)</span>
                  </div>
                </div>
              </div>

              {/* Real-time AI Assistant Panel Mock */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-4 border-b border-slate-800 pb-3">
                    <Bot className="h-4 w-4" /> AI Meeting Intelligence
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="font-semibold text-indigo-300 mb-1">Key Decision Identified:</p>
                      <p className="text-slate-300">Approved React 19 + TypeScript stack for IntellMeet monorepo.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="font-semibold text-amber-300 mb-1">Action Item Extracted:</p>
                      <p className="text-slate-300">Sarah: Implement Kanban task status sync endpoint.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Audio Transcription: Live</span>
                  <span className="text-emerald-400 font-semibold">100% Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Everything Remote Teams Need</h2>
            <p className="mt-4 text-slate-400">
              A unified platform replacing fragmented video apps, notes, and task trackers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 mb-6">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">WebRTC Video & Screen Share</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Crystal-clear HD peer-to-peer video conferencing, active speaker tracking, and native screen sharing.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 mb-6">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Meeting Intelligence</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatic speech-to-text transcripts, executive summaries, decision logs, and follow-up recommendations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 mb-6">
                <Kanban className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Kanban Task Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Turn AI-extracted action items into assigned Kanban tasks with 1 click. Track backlog to completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
                <ShieldCheck className="h-4 w-4" /> Enterprise Security First
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
                Built for Security, Compliance, and Data Privacy
              </h2>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>JWT Access Token & Refresh Token Rotation with HttpOnly storage safeguards.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Role-Based Access Control (RBAC) across Workspaces, Meetings, and Transcripts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Rate limiting and Helmet security header protection against NoSQL injection.</span>
                </li>
              </ul>
            </div>
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <Lock className="h-8 w-8 text-indigo-400" />
                <div>
                  <h4 className="font-semibold text-white">Password Protection & Invite Validation</h4>
                  <p className="text-xs text-slate-400">Strict meeting membership validation before media access.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <Zap className="h-8 w-8 text-indigo-400" />
                <div>
                  <h4 className="font-semibold text-white">Rate-Limited Socket.io Signaling</h4>
                  <p className="text-xs text-slate-400">Protected real-time offer/answer ICE signaling exchange.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-500 text-sm border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:justify-between sm:text-left">
          <p>© 2026 IntellMeet Enterprise Platform. All rights reserved.</p>
          <div className="mt-4 sm:mt-0 flex justify-center gap-6">
            <Link to="/signup" className="hover:text-slate-300">Sign Up</Link>
            <Link to="/login" className="hover:text-slate-300">Login</Link>
            <Link to="/meetings" className="hover:text-slate-300">Meetings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

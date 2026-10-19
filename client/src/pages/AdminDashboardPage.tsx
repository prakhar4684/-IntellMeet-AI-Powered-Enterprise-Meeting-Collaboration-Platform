import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ShieldAlert, Server, Users, Activity, CheckCircle2 } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="pb-6 border-b border-slate-800">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <ShieldAlert className="h-7 w-7 text-indigo-400" /> Platform Admin Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              System health status, API rate limiting metrics, and user organization management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">System Status</span>
              <p className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" /> Operational
              </p>
              <p className="text-xs text-slate-500">100% Uptime over last 30 days</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Socket Rooms</span>
              <p className="text-2xl font-bold text-white">4 Live Rooms</p>
              <p className="text-xs text-indigo-400">WebRTC Mesh Signaling Active</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Registered Users</span>
              <p className="text-2xl font-bold text-white">128 Accounts</p>
              <p className="text-xs text-purple-400">JWT Token Rotation Active</p>
            </div>
          </div>

          {/* System Services Grid */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-400" /> Infrastructure Microservices Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Express Backend API Service</h4>
                  <p className="text-[11px] text-slate-500">Port 5000 • Health check passing</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Healthy</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Socket.io Signaling Server</h4>
                  <p className="text-[11px] text-slate-500">WebSocket / WebRTC Handshake</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Healthy</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">AI Intelligence Service</h4>
                  <p className="text-[11px] text-slate-500">OpenAI API + Local Fallback Engine</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Healthy</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">BullMQ & Redis Background Worker</h4>
                  <p className="text-[11px] text-slate-500">Queue processing active</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Healthy</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

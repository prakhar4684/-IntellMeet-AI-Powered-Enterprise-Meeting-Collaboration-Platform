import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Settings, Shield, Bell, Video, Volume2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-4xl">
          <div className="pb-6 border-b border-slate-800">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <Settings className="h-7 w-7 text-indigo-400" /> Platform Preferences
            </h1>
            <p className="text-sm text-slate-400 mt-1">Configure audio/video defaults, theme tokens, and notifications.</p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-indigo-400" /> Meeting Default Controls
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-300">Mute microphone upon entering room</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-300">Turn camera off upon entering room</span>
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-400" /> Notification Preferences
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-300">Receive email alerts for new meeting invitations</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-300">Notify when AI report generation completes</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { Bell, CheckCircle2, Clock, Check } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api.getNotifications()
      .then((res) => setNotifications(res.notifications || []))
      .catch(() => {});
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsAsRead();
    } catch {
      // Ignored
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-5xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                <Bell className="h-7 w-7 text-indigo-400" /> Notifications Feed
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Real-time updates on meeting invitations, tasks assigned, and AI reports.
              </p>
            </div>

            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <Check className="h-4 w-4 text-emerald-400" /> Mark All as Read
            </button>
          </div>

          <div className="mt-8 space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !n.isRead ? 'bg-slate-900 border-indigo-500/40' : 'bg-slate-950 border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${!n.isRead ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{n.title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-500 mt-2 block">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

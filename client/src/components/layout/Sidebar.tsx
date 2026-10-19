import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Kanban,
  Bot,
  BarChart3,
  Users,
  Briefcase,
  History,
  Bell,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/meetings', label: 'Meetings', icon: Video },
    { to: '/history', label: 'Meeting History', icon: History },
    { to: '/tasks', label: 'Kanban Board', icon: Kanban },
    { to: '/ai-assistant', label: 'AI Intelligence', icon: Bot },
    { to: '/workspaces', label: 'Workspaces', icon: Briefcase },
    { to: '/members', label: 'Team Members', icon: Users },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'Admin') {
    links.push({ to: '/admin', label: 'Admin Console', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Platform Navigation</p>
          <nav className="mt-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs mb-1">
          <Bot className="h-4 w-4 text-indigo-400" /> IntellMeet AI Pro
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AI Summaries & Action Items active across all workspace meetings.
        </p>
      </div>
    </aside>
  );
};

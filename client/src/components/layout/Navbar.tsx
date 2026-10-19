import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { Video, Bell, User, LogOut, CheckCircle2, ChevronDown, Shield, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications().then((res) => {
        if (res && res.unreadCount !== undefined) {
          setUnreadCount(res.unreadCount);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="tracking-tight font-extrabold text-2xl">
            Intell<span className="text-indigo-400">Meet</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {!isAuthenticated ? (
            <>
              <Link to="/#features" className="hover:text-indigo-400 transition-colors">Features</Link>
              <Link to="/#ai-intelligence" className="hover:text-indigo-400 transition-colors">AI Intelligence</Link>
              <Link to="/#security" className="hover:text-indigo-400 transition-colors">Security</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/meetings" className="hover:text-indigo-400 transition-colors">Meetings</Link>
              <Link to="/tasks" className="hover:text-indigo-400 transition-colors">Kanban Tasks</Link>
              <Link to="/ai-assistant" className="hover:text-indigo-400 transition-colors">AI Assistant</Link>
              <Link to="/analytics" className="hover:text-indigo-400 transition-colors">Analytics</Link>
            </>
          )}
        </nav>

        {/* Auth / Profile Actions */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Quick Instant Meeting CTA */}
              <Link
                to="/meetings/new"
                className="hidden sm:flex items-center gap-2 text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Video className="h-3.5 w-3.5" /> Instant Meeting
              </Link>

              {/* Notification Bell */}
              <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-900 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <User className="h-4 w-4" /> Profile & Settings
                      </Link>
                      <Link
                        to="/workspaces"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Workspaces
                      </Link>
                      {user?.role === 'Admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Shield className="h-4 w-4" /> Admin Console
                        </Link>
                      )}
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

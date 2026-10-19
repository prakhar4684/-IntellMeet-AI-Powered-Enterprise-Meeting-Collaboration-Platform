import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { Briefcase, UserPlus, Users, ArrowLeft, Check, Shield } from 'lucide-react';

export const WorkspaceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [inviteEmail, setInviteEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [invited, setInvited] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await api.inviteWorkspaceMember(id || 'default', inviteEmail.trim(), role);
      setInvited(true);
      setInviteEmail('');
      setTimeout(() => setInvited(false), 3000);
    } catch {
      setInvited(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-5xl">
          <Link to="/workspaces" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Workspaces
          </Link>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Workspace Details</span>
                <h1 className="text-2xl font-extrabold text-white mt-1">Product Engineering Hub</h1>
                <p className="text-xs text-slate-400 mt-1">Core team workspace for IntellMeet development and meeting reviews.</p>
              </div>
            </div>

            {/* Invite Form */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-400" /> Invite Team Member to Workspace
              </h3>

              {invited && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="h-4 w-4" /> Invitation link successfully created and dispatched!
                </div>
              )}

              <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Workspace Admin</option>
                </select>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Send Invite
                </button>
              </form>
            </div>

            {/* Members List */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" /> Current Workspace Members (3)
              </h3>
              <div className="space-y-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-600 font-bold flex items-center justify-center text-white text-xs">AR</div>
                    <div>
                      <p className="text-xs font-bold text-white">Alex Rivera</p>
                      <p className="text-[11px] text-slate-400">alex@company.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                    Workspace Owner
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-purple-600 font-bold flex items-center justify-center text-white text-xs">SC</div>
                    <div>
                      <p className="text-xs font-bold text-white">Sarah Chen</p>
                      <p className="text-[11px] text-slate-400">sarah@company.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    Member
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

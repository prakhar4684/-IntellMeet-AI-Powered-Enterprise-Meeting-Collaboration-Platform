import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import { User, Check, AlertCircle } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    jobTitle: user?.jobTitle || 'Senior Software Engineer',
    department: user?.department || 'Engineering',
    bio: user?.bio || 'Passionate about WebRTC real-time systems and AI meeting automation.',
    timezone: user?.timezone || 'UTC',
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-4xl">
          <div className="pb-6 border-b border-slate-800">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <User className="h-7 w-7 text-indigo-400" /> User Profile & Account
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage your identity, job title, department, and time zone.</p>
          </div>

          <div className="mt-8 p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            {saved && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="h-4 w-4" /> Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Work Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'alex@company.com'}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Bio / Overview</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/30"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

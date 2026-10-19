import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Users, Mail, Shield, Briefcase } from 'lucide-react';

export const TeamMembersPage: React.FC = () => {
  const members = [
    { name: 'Alex Rivera', email: 'alex@company.com', role: 'Admin', title: 'Senior Full-Stack Architect', dept: 'Engineering', skills: ['React', 'TypeScript', 'Node.js', 'WebRTC'] },
    { name: 'Sarah Chen', email: 'sarah@company.com', role: 'Member', title: 'Lead Frontend Engineer', dept: 'UI/UX Design', skills: ['Tailwind CSS', 'React 19', 'Zustand'] },
    { name: 'Michael Scott', email: 'michael@company.com', role: 'Member', title: 'Product Manager', dept: 'Product Strategy', skills: ['Roadmaps', 'Agile', 'Scrum'] },
    { name: 'David Kim', email: 'david@company.com', role: 'Member', title: 'DevOps & Cloud Specialist', dept: 'Infrastructure', skills: ['Docker', 'Redis', 'BullMQ', 'MongoDB'] },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="pb-6 border-b border-slate-800">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <Users className="h-7 w-7 text-indigo-400" /> Team Members Directory
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Organization members, assigned workspace roles, and technical skills profiles.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold flex items-center justify-center text-white text-base shadow-lg">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{m.name}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{m.title}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500" /> {m.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-slate-500" /> {m.dept}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-slate-500" /> Role: <span className="text-white font-medium">{m.role}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {m.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

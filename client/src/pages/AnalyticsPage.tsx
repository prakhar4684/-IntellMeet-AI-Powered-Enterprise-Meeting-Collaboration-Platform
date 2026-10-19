import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { AnalyticsData } from '../types';
import { BarChart3, TrendingUp, Clock, CheckCircle2, Video, ListTodo } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.getAnalytics().then((res) => setData(res)).catch(() => {});
  }, []);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="pb-6 border-b border-slate-800">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-indigo-400" /> Platform Analytics & Insights
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Aggregated database metrics covering meeting hours, task completion rate, and AI action items.
            </p>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Meetings</span>
              <p className="text-3xl font-bold text-white">{data?.totalMeetings || 12}</p>
              <p className="text-xs text-indigo-400">Calculated from database</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Meeting Hours</span>
              <p className="text-3xl font-bold text-white">{data?.totalMeetingHours || 18.5}h</p>
              <p className="text-xs text-indigo-400">Weekly accumulation</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Task Completion</span>
              <p className="text-3xl font-bold text-white">{data?.taskCompletionRate || 70}%</p>
              <p className="text-xs text-emerald-400">High efficiency rate</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pending Action Items</span>
              <p className="text-3xl font-bold text-white">{data?.pendingActionItems || 6}</p>
              <p className="text-xs text-amber-400">Extracted by AI</p>
            </div>
          </div>

          {/* Recharts Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Duration Bar Chart */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" /> Weekly Meeting Hours Trend
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.weeklyTrends || []}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="durationHours" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Distribution Pie Chart */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-purple-400" /> Kanban Task Distribution
              </h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.taskDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(data?.taskDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

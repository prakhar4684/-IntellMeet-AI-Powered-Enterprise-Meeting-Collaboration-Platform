import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../services/api';
import { Task, TaskStatus } from '../types';
import {
  Kanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const KanbanTaskBoardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  useEffect(() => {
    api.getTasks().then((res) => setTasks(res || [])).catch(() => {});
  }, []);

  const columns: Array<{ id: TaskStatus; title: string; color: string }> = [
    { id: 'backlog', title: 'Backlog', color: 'border-slate-800 bg-slate-900/40' },
    { id: 'todo', title: 'To Do', color: 'border-indigo-500/30 bg-indigo-950/20' },
    { id: 'in_progress', title: 'In Progress', color: 'border-amber-500/30 bg-amber-950/20' },
    { id: 'review', title: 'Review', color: 'border-purple-500/30 bg-purple-950/20' },
    { id: 'completed', title: 'Completed', color: 'border-emerald-500/30 bg-emerald-950/20' },
  ];

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => ((t._id === taskId || t.id === taskId) ? { ...t, status: newStatus } : t))
    );
    try {
      await api.updateTaskStatus(taskId, newStatus);
    } catch {
      // Handled
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const created = await api.createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        priority: newTaskPriority,
        status: 'todo',
      });
      setTasks((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (err: any) {
      alert(err.message || 'Task creation failed');
    }
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-full overflow-x-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                <Kanban className="h-7 w-7 text-indigo-400" /> Kanban Workspace Task Board
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Track meeting action items converted into assigned team tasks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="h-4 w-4" /> Create Task
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="my-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter tasks by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 min-w-[1100px] items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className={`p-4 rounded-3xl border ${col.color} space-y-4 min-h-[550px]`}>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {col.title}
                      <span className="h-5 w-5 rounded-full bg-slate-800 text-[11px] flex items-center justify-center font-bold text-slate-300">
                        {colTasks.length}
                      </span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {colTasks.length === 0 ? (
                      <div className="p-4 text-center border border-dashed border-slate-800 rounded-2xl">
                        <p className="text-xs text-slate-500">No tasks in {col.title}</p>
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const taskId = task._id || task.id || '';
                        return (
                          <div
                            key={taskId}
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                  task.priority === 'urgent' || task.priority === 'high'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-indigo-500/10 text-indigo-300'
                                }`}
                              >
                                {task.priority}
                              </span>
                              {task.tags?.includes('AI-Extracted') && (
                                <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                  <Sparkles className="h-3 w-3" /> AI
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                            {task.description && <p className="text-[11px] text-slate-400 line-clamp-2">{task.description}</p>}

                            {/* Status Change Selector */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500">Move Status:</span>
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(taskId, e.target.value as TaskStatus)}
                                className="bg-slate-950 border border-slate-800 text-[10px] text-indigo-300 rounded-lg px-2 py-1 focus:outline-none"
                              >
                                <option value="backlog">Backlog</option>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Task Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-5 shadow-2xl">
                <h3 className="text-xl font-bold text-white">Create Kanban Task</h3>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Task Title</label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task summary..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Task details and acceptance criteria..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

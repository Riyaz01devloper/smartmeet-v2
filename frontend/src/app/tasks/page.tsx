"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import ProtectedRoute from "@/component/ProtectedRoute";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Filter,
  Check,
  Calendar,
  User,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Edit modal / inline editing state
  const [editingTask, setEditingTask] = useState<any>(null);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = "/tasks?";
      if (statusFilter !== "all") url += `status=${encodeURIComponent(statusFilter)}&`;
      if (priorityFilter !== "all") url += `priority=${encodeURIComponent(priorityFilter)}&`;

      const res = await api.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error("Tasks fetch error:", err);
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task: any) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    try {
      await api.patch(`/tasks/${task.id}`, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
      toast.success(nextStatus === "Completed" ? "Marked as completed" : "Marked as pending");
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this action item?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch (err) {
      console.error("Delete task error:", err);
      toast.error("Failed to delete task.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const res = await api.patch(`/tasks/${editingTask.id}`, {
        title: editingTask.title,
        description: editingTask.description,
        assignee: editingTask.assignee,
        due_date: editingTask.due_date,
        priority: editingTask.priority,
        status: editingTask.status,
      });
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data : t)));
      toast.success("Task updated successfully");
      setEditingTask(null);
    } catch (err) {
      console.error("Save edit error:", err);
      toast.error("Failed to save changes.");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (t.title?.toLowerCase() || "").includes(q) ||
      (t.description?.toLowerCase() || "").includes(q) ||
      (t.assignee?.toLowerCase() || "").includes(q) ||
      (t.meeting_title?.toLowerCase() || "").includes(q)
    );
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-2.5">
                <ListChecks className="text-emerald-400" size={32} />
                Smart Action Items
              </h1>
              <p className="text-slate-400 mt-1.5 text-sm sm:text-base">
                Track, filter, and complete commitments and assignments extracted from your meetings.
              </p>
            </div>
            <Link
              href="/meetings"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-indigo-500/20"
            >
              View Meetings
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          {/* Controls: Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
              <input
                type="text"
                placeholder="Search action items by title, assignee, or meeting..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition"
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-xl font-semibold text-white">No action items found</h3>
              <p className="text-slate-400 text-sm mt-1">
                {search || statusFilter !== "all" || priorityFilter !== "all"
                  ? "No tasks match your current filters. Try resetting your search."
                  : "Upload a meeting to automatically extract action items."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    t.status === "Completed"
                      ? "border-slate-800/60 bg-slate-900/30 opacity-75"
                      : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(t)}
                      className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                        t.status === "Completed"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-600 hover:border-emerald-400"
                      }`}
                      title={t.status === "Completed" ? "Mark pending" : "Mark completed"}
                    >
                      {t.status === "Completed" && <Check size={13} strokeWidth={3} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3
                          className={`font-semibold text-base ${
                            t.status === "Completed" ? "line-through text-slate-400" : "text-white"
                          }`}
                        >
                          {t.title}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                            t.priority === "High"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : t.priority === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            t.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : t.status === "In Progress"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                        {t.meeting_title && (
                          <Link
                            href={`/meetings/${t.meeting_id}`}
                            className="hover:text-indigo-400 transition flex items-center gap-1"
                          >
                            <ExternalLink size={12} />
                            <span>{t.meeting_title}</span>
                          </Link>
                        )}
                        {t.assignee && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <User size={12} />
                            {t.assignee}
                          </span>
                        )}
                        {t.due_date && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar size={12} />
                            Due: {t.due_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setEditingTask({ ...t })}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit task"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-2 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Delete task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Task Modal */}
          {editingTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-[#10151f] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Edit Action Item</h3>
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                      value={editingTask.description || ""}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Assignee</label>
                      <input
                        type="text"
                        value={editingTask.assignee || ""}
                        onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                        placeholder="e.g. Riyaz"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                      <input
                        type="text"
                        value={editingTask.due_date || ""}
                        onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                        placeholder="e.g. 2026-10-30 or Friday"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                      <select
                        value={editingTask.priority || "Medium"}
                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                      <select
                        value={editingTask.status || "Pending"}
                        onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


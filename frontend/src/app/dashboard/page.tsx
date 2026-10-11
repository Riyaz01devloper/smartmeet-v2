"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import ProtectedRoute from "@/component/ProtectedRoute";
import {
  FolderOpen,
  ListChecks,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Upload,
  ArrowRight,
  TrendingUp,
  FileText
} from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/analytics/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Dashboard analytics error:", err);
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      await api.patch(`/tasks/${taskId}`, { status: nextStatus });
      toast.success(nextStatus === "Completed" ? "Task marked completed" : "Task marked pending");
      fetchDashboardStats();
    } catch (err) {
      console.error("Task update error:", err);
      toast.error("Failed to update task.");
    }
  };

  const completionRate = data?.total_tasks > 0
    ? Math.round((data.completed_tasks / data.total_tasks) * 100)
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-2">
                <Sparkles size={13} />
                Executive Overview
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Meeting Intelligence Hub</h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Real-time insights, decision logs, and actionable task progress across your team.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-sm font-medium transition"
              >
                Search Insights
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-indigo-500/20"
              >
                <Upload size={16} />
                Upload Meeting
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
              ))}
            </div>
          ) : (
            <>
              {/* Primary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Meetings */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase tracking-wider font-semibold">Total Meetings</span>
                    <FolderOpen size={18} className="text-indigo-400" />
                  </div>
                  <p className="text-3xl font-bold mt-3 text-white">{data?.total_meetings || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">{data?.total_words?.toLocaleString() || 0} spoken words parsed</p>
                </div>

                {/* Total Action Items */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase tracking-wider font-semibold">Total Tasks</span>
                    <ListChecks size={18} className="text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold mt-3 text-white">{data?.total_tasks || 0}</p>
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">{completionRate}% completion rate</p>
                </div>

                {/* Decisions Recorded */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase tracking-wider font-semibold">Key Decisions</span>
                    <HelpCircle size={18} className="text-amber-400" />
                  </div>
                  <p className="text-3xl font-bold mt-3 text-amber-400">{data?.total_decisions || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Grounded and archived</p>
                </div>

                {/* Overdue / Pending */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase tracking-wider font-semibold">Task Breakdown</span>
                    <Clock size={18} className="text-rose-400" />
                  </div>
                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-3xl font-bold text-rose-400">{data?.pending_tasks || 0}</span>
                    <span className="text-xs text-slate-400">pending</span>
                    <span className="text-xl font-semibold text-emerald-400 ml-auto">{data?.completed_tasks || 0}</span>
                    <span className="text-xs text-slate-400">done</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {data?.overdue_tasks > 0 ? (
                      <span className="text-rose-400 font-medium">{data.overdue_tasks} overdue</span>
                    ) : (
                      "0 overdue deadlines"
                    )}
                  </p>
                </div>
              </div>

              {/* Two-Column Detail Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Recent Meetings */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <FolderOpen size={18} className="text-indigo-400" />
                      Recent Meetings
                    </h2>
                    <Link
                      href="/meetings"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      View all
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {data?.recent_meetings?.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                      <FileText className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                      <p className="text-slate-400 text-sm">No meetings recorded yet.</p>
                      <Link
                        href="/upload"
                        className="mt-3 inline-block text-xs font-semibold text-indigo-400 hover:underline"
                      >
                        Upload a recording
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data?.recent_meetings?.map((m: any) => (
                        <Link
                          key={m.id}
                          href={`/meetings/${m.id}`}
                          className="block p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate max-w-[280px] text-white">
                              🎙️ {m.filename}
                            </h3>
                            <span className="text-[11px] text-slate-500 shrink-0">
                              {m.created_at ? new Date(m.created_at).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {m.summary || "No summary generated."}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Pending Action Items */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <ListChecks size={18} className="text-emerald-400" />
                      Action Items To-Do
                    </h2>
                    <Link
                      href="/tasks"
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      Manage tasks
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {data?.recent_tasks?.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                      <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/50 mb-2" />
                      <p className="text-slate-400 text-sm">All caught up! No pending action items.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data?.recent_tasks?.map((t: any) => (
                        <div
                          key={t.id}
                          className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleTask(t.id, t.status)}
                            className="mt-0.5 h-4 w-4 rounded border border-slate-600 hover:border-emerald-400 flex items-center justify-center shrink-0 transition"
                            title="Mark as completed"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">
                              {t.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="truncate">Meeting: {t.meeting_title}</span>
                              {t.due_date && (
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 shrink-0">
                                  Due: {t.due_date}
                                </span>
                              )}
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                  t.priority === "High"
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import toast from "react-hot-toast";
import ProtectedRoute from "@/component/ProtectedRoute";
import { Plus, Trash2, ExternalLink, Search, FileText, CheckCircle2 } from "lucide-react";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await api.get("/meetings");
      setMeetings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Meetings fetch error:", error);
      toast.error("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (id: number) => {
    try {
      await api.delete(`/meeting/${id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      toast.success("Meeting deleted successfully");
    } catch (error) {
      console.error("Delete meeting error:", error);
      toast.error("Failed to delete meeting.");
    }
  };

  const totalMeeting = meetings.length;
  const totalWords = meetings.reduce((sum, m) => {
    const words = m.transcript ? m.transcript.trim().split(/\s+/).filter(Boolean).length : 0;
    return sum + words;
  }, 0);
  const totalSummaries = meetings.filter((m) => Boolean(m.summary?.trim())).length;

  const filteredMeetings = meetings.filter((m) => {
    const filename = m.filename?.toLowerCase() || "";
    const summary = m.summary?.toLowerCase() || "";
    const q = search.trim().toLowerCase();
    return filename.includes(q) || summary.includes(q);
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                🎙️ Meeting Intelligence
              </h1>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Search, analyze, and manage your meetings with AI insights.
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-indigo-500/20"
            >
              <Plus size={18} />
              Upload Meeting
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-sm font-medium text-slate-400">Total Meetings</h3>
              <p className="text-4xl font-bold mt-2 text-white">{totalMeeting}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-sm font-medium text-slate-400">AI Summaries</h3>
              <p className="text-4xl font-bold mt-2 text-indigo-400">{totalSummaries}</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h3 className="text-sm font-medium text-slate-400">Words Processed</h3>
              <p className="text-4xl font-bold mt-2 text-emerald-400">{totalWords}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search meetings by title or summary content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 text-lg">Loading your meetings...</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white">No meetings recorded yet</h3>
              <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm">
                Get started by uploading an audio recording to extract transcripts, summaries, and action items.
              </p>
              <Link
                href="/upload"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-white transition"
              >
                <Plus size={16} />
                Upload Your First Meeting
              </Link>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
              <p className="text-slate-400">No meetings match your search query &ldquo;{search}&rdquo;.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span>🎙️</span>
                        <span>{meeting.filename}</span>
                      </h2>
                      <p className="text-slate-400 mt-2 text-sm leading-relaxed line-clamp-3">
                        {meeting.summary || "No summary generated."}
                      </p>

                      {meeting.tasks && meeting.tasks.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-400">
                          <CheckCircle2 size={14} />
                          <span>{meeting.tasks.length} action items extracted</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition"
                      >
                        <ExternalLink size={15} />
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this meeting?")) {
                            deleteMeeting(meeting.id);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 text-sm font-medium transition"
                        title="Delete meeting"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
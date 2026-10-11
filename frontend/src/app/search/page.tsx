"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import ProtectedRoute from "@/component/ProtectedRoute";
import { Search, Sparkles, FolderOpen, ArrowRight, Loader2, Quote, ExternalLink, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a search topic or question.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/meetings/search-intelligence?q=${encodeURIComponent(query.trim())}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-3">
              <Sparkles size={13} />
              Cross-Meeting Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Search Across All Meetings</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl">
              Ask questions or search topics across your entire meeting history. Discover decisions, dates, and discussion points with verified citations.
            </p>

            {/* Search Input Box */}
            <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="e.g. 'What was decided about the launch date?' or 'budget discussions'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 px-6 py-3.5 font-semibold text-sm transition"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyzing Meetings...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Search Intelligence
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
          {loading && (
            <div className="text-center py-16">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400 mb-3" />
              <p className="text-slate-400 text-sm">Searching transcripts and synthesizing insights across your meetings...</p>
            </div>
          )}

          {!loading && results && (
            <div className="space-y-8">
              {/* AI Synthesis Card */}
              {results.ai_synthesis && (
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 sm:p-8 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-3">
                    <Sparkles size={18} />
                    <span>AI Cross-Meeting Synthesis</span>
                  </div>
                  <div className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {results.ai_synthesis}
                  </div>
                </div>
              )}

              {/* Matched Meetings Section */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                  <span>Matched Meetings ({results.total_matches})</span>
                  <span className="text-xs font-normal text-slate-500">Query: &ldquo;{results.query}&rdquo;</span>
                </h2>

                {results.meetings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
                    <p className="text-slate-400">No meeting transcripts, decisions, or action items matched your search query.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.meetings.map((m: any) => (
                      <div
                        key={m.meeting_id}
                        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <FolderOpen size={18} className="text-indigo-400 shrink-0" />
                            <span>{m.filename}</span>
                          </h3>
                          <div className="flex items-center gap-3">
                            {m.created_at && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar size={13} />
                                {new Date(m.created_at).toLocaleDateString()}
                              </span>
                            )}
                            <Link
                              href={`/meetings/${m.meeting_id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition"
                            >
                              <ExternalLink size={13} />
                              View Meeting
                            </Link>
                          </div>
                        </div>

                        {/* Matched Excerpts */}
                        <div className="space-y-2 mt-4">
                          {m.matched_excerpts.map((excerpt: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800"
                            >
                              <Quote size={14} className="text-indigo-400 mt-1 shrink-0" />
                              <span className="leading-relaxed">{excerpt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !results && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-lg font-semibold text-white">Enter a search query above</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                Search across all your meetings for questions, key decisions, project mentions, or unresolved tasks.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


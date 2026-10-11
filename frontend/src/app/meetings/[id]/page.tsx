"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { jsPDF } from "jspdf";
import ProtectedRoute from "@/component/ProtectedRoute";
import {
  Download,
  ArrowLeft,
  Trash2,
  ListChecks,
  HelpCircle,
  FileText,
  Calendar,
  MessageSquare,
  Send,
  Loader2,
  Check,
  Plus,
  Quote,
  Sparkles,
  Bot,
  User,
  Copy,
  CheckCheck
} from "lucide-react";
import toast from "react-hot-toast";

interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  cited_excerpts?: string[];
}

export default function MeetingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "tasks" | "chat" | "transcript">("summary");

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatEntry[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // New Action Item state
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [addingTask, setAddingTask] = useState(false);

  // Transcript Copy state
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMeeting();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  const fetchMeeting = async () => {
    try {
      const response = await api.get(`/meeting/${id}`);
      setMeeting(response.data);
    } catch (error) {
      console.error("Meeting details fetch error:", error);
      toast.error("Failed to load meeting details.");
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async () => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) {
      return;
    }
    try {
      await api.delete(`/meeting/${id}`);
      toast.success("Meeting deleted");
      router.push("/meetings");
    } catch (error) {
      console.error("Delete meeting error:", error);
      toast.error("Failed to delete meeting.");
    }
  };

  // Toggle Action Item Status
  const handleToggleTask = async (task: any) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    try {
      if (task.id) {
        await api.patch(`/tasks/${task.id}`, { status: nextStatus });
      }
      setMeeting((prev: any) => ({
        ...prev,
        tasks: prev.tasks.map((t: any) =>
          (t.id ? t.id === task.id : t.title === task.title) ? { ...t, status: nextStatus } : t
        )
      }));
      toast.success(nextStatus === "Completed" ? "Task completed" : "Task pending");
    } catch (err) {
      console.error("Task toggle error:", err);
      toast.error("Failed to update task.");
    }
  };

  // Add Action Item
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setAddingTask(true);
    try {
      const res = await api.post("/tasks", {
        meeting_id: Number(id),
        title: newTaskTitle.trim(),
        assignee: newTaskAssignee.trim() || null,
        due_date: newTaskDue.trim() || null,
        priority: newTaskPriority,
        status: "Pending"
      });

      setMeeting((prev: any) => ({
        ...prev,
        tasks: [...(prev.tasks || []), res.data]
      }));

      setNewTaskTitle("");
      setNewTaskAssignee("");
      setNewTaskDue("");
      setShowAddTask(false);
      toast.success("Action item added!");
    } catch (err) {
      console.error("Create task error:", err);
      toast.error("Failed to create action item.");
    } finally {
      setAddingTask(false);
    }
  };

  // Send Chat Message
  const handleSendChat = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || chatLoading) return;

    const userEntry: ChatEntry = { role: "user", content: textToSend.trim() };
    const updatedHistory = [...chatMessages, userEntry];
    setChatMessages(updatedHistory);
    setInputMessage("");
    setChatLoading(true);

    try {
      const payloadHistory = updatedHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.post(`/meeting/${id}/chat`, {
        message: textToSend.trim(),
        history: payloadHistory
      });

      const assistantEntry: ChatEntry = {
        role: "assistant",
        content: res.data.reply,
        cited_excerpts: res.data.cited_excerpts
      };
      setChatMessages((prev) => [...prev, assistantEntry]);
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Failed to get answer from meeting assistant.");
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an issue analyzing the meeting. Please try again."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Copy transcript
  const handleCopyTranscript = () => {
    if (meeting?.transcript) {
      navigator.clipboard.writeText(meeting.transcript);
      setCopiedTranscript(true);
      toast.success("Transcript copied to clipboard");
      setTimeout(() => setCopiedTranscript(false), 2000);
    }
  };

  // PDF Export with Multi-Page Pagination
  const downloadPDF = () => {
    if (!meeting) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Header
    doc.setFontSize(20);
    doc.text("Meeting Intelligence Report", margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`File: ${meeting.filename || "Untitled"}`, margin, y);
    y += 6;
    if (meeting.created_at) {
      doc.text(`Date: ${new Date(meeting.created_at).toLocaleString()}`, margin, y);
      y += 6;
    }
    y += 6;
    doc.setTextColor(0);

    // Summary
    checkPageBreak(25);
    doc.setFontSize(14);
    doc.text("Executive Summary", margin, y);
    y += 8;

    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(meeting.summary || "No summary recorded.", maxLineWidth);
    summaryLines.forEach((line: string) => {
      checkPageBreak(7);
      doc.text(line, margin, y);
      y += 6;
    });
    y += 8;

    // Action Items
    if (meeting.tasks && meeting.tasks.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.text("Action Items", margin, y);
      y += 8;

      doc.setFontSize(10);
      meeting.tasks.forEach((t: any) => {
        const title = t.title || t;
        const assignee = t.assignee ? ` [Assigned: ${t.assignee}]` : "";
        const due = t.due_date ? ` [Due: ${t.due_date}]` : "";
        const status = t.status === "Completed" ? "[x]" : "[ ]";
        const taskLines = doc.splitTextToSize(`${status} ${title}${assignee}${due}`, maxLineWidth);
        taskLines.forEach((line: string) => {
          checkPageBreak(7);
          doc.text(line, margin, y);
          y += 6;
        });
      });
      y += 8;
    }

    // Key Decisions
    if (meeting.decisions && meeting.decisions.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.text("Key Decisions", margin, y);
      y += 8;

      doc.setFontSize(10);
      meeting.decisions.forEach((decision: string) => {
        const decLines = doc.splitTextToSize(`- ${decision}`, maxLineWidth);
        decLines.forEach((line: string) => {
          checkPageBreak(7);
          doc.text(line, margin, y);
          y += 6;
        });
      });
      y += 8;
    }

    // Transcript
    checkPageBreak(25);
    doc.setFontSize(14);
    doc.text("Full Transcript", margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(70);
    const transcriptLines = doc.splitTextToSize(meeting.transcript || "No transcript available.", maxLineWidth);
    transcriptLines.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 5.5;
    });

    const safeFilename = (meeting.filename || "meeting").replace(/[^a-zA-Z0-9_-]/g, "_");
    doc.save(`${safeFilename}_report.pdf`);
    toast.success("PDF downloaded successfully!");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        <div className="max-w-5xl mx-auto p-4 sm:p-8">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Link
              href="/meetings"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={16} />
              Back to Meetings
            </Link>

            {meeting && (
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={downloadPDF}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold transition"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={deleteMeeting}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20 px-3 py-2 text-sm font-medium transition"
                  title="Delete meeting"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400 mb-3" />
              <p className="text-slate-400 text-sm">Loading meeting intelligence...</p>
            </div>
          ) : !meeting ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <h2 className="text-2xl font-bold">Meeting Not Found</h2>
              <p className="text-slate-400 mt-2">This meeting does not exist or has been deleted.</p>
              <Link
                href="/meetings"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <div>
              {/* Meeting Header */}
              <div className="border-b border-slate-800 pb-5 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <span>🎙️</span>
                  <span>{meeting.filename}</span>
                </h1>
                {meeting.created_at && (
                  <p className="text-slate-500 text-xs sm:text-sm mt-2 flex items-center gap-1.5">
                    <Calendar size={14} />
                    Analyzed on {new Date(meeting.created_at).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 mb-6 gap-2 sm:gap-4 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  className={`pb-3 px-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
                    activeTab === "summary"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText size={16} />
                  Summary &amp; Decisions
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className={`pb-3 px-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
                    activeTab === "tasks"
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <ListChecks size={16} />
                  Action Items ({meeting.tasks?.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`pb-3 px-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
                    activeTab === "chat"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles size={16} />
                  Chat with Meeting
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("transcript")}
                  className={`pb-3 px-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 shrink-0 ${
                    activeTab === "transcript"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <span>📜</span>
                  Transcript
                </button>
              </div>

              {/* Tab 1: Summary & Decisions */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-white">
                      <FileText className="text-indigo-400" size={18} />
                      Executive Summary
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      {meeting.summary || "No summary available."}
                    </p>
                  </div>

                  {/* Decisions */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-white">
                      <HelpCircle className="text-amber-400" size={18} />
                      Key Decisions ({meeting.decisions?.length || 0})
                    </h2>
                    {meeting.decisions && meeting.decisions.length > 0 ? (
                      <ul className="space-y-3">
                        {meeting.decisions.map((dec: string, index: number) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="h-2 w-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                            <span className="leading-relaxed">{dec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No explicit decisions recorded in this meeting.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Action Items */}
              {activeTab === "tasks" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ListChecks className="text-emerald-400" size={18} />
                      Extracted Commitments
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowAddTask(!showAddTask)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
                    >
                      <Plus size={14} />
                      Add Task
                    </button>
                  </div>

                  {/* Add Task Form */}
                  {showAddTask && (
                    <form
                      onSubmit={handleCreateTask}
                      className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-4 sm:p-5 space-y-3"
                    >
                      <input
                        type="text"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Assignee (e.g. John)"
                          value={newTaskAssignee}
                          onChange={(e) => setNewTaskAssignee(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="Due Date (e.g. Friday)"
                          value={newTaskDue}
                          onChange={(e) => setNewTaskDue(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                        />
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="High">High Priority</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddTask(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addingTask || !newTaskTitle.trim()}
                          className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition"
                        >
                          {addingTask ? "Saving..." : "Save Action Item"}
                        </button>
                      </div>
                    </form>
                  )}

                  {meeting.tasks && meeting.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {meeting.tasks.map((task: any, index: number) => {
                        const title = task.title || task;
                        const isDone = task.status === "Completed";
                        return (
                          <div
                            key={task.id || index}
                            className={`rounded-2xl border p-4 transition flex items-start justify-between gap-3 ${
                              isDone
                                ? "border-slate-800/60 bg-slate-900/30 opacity-75"
                                : "border-slate-800 bg-slate-900/70"
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleTask(task)}
                                className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-slate-600 hover:border-emerald-400"
                                }`}
                                title={isDone ? "Mark pending" : "Mark completed"}
                              >
                                {isDone && <Check size={13} strokeWidth={3} />}
                              </button>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`font-medium text-sm sm:text-base ${
                                    isDone ? "line-through text-slate-400" : "text-white"
                                  }`}
                                >
                                  {title}
                                </p>

                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                                  {task.assignee && (
                                    <span className="flex items-center gap-1 text-slate-400">
                                      <User size={12} />
                                      {task.assignee}
                                    </span>
                                  )}
                                  {task.due_date && (
                                    <span className="flex items-center gap-1 text-slate-400">
                                      <Calendar size={12} />
                                      {task.due_date}
                                    </span>
                                  )}
                                  {task.priority && (
                                    <span
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                        task.priority === "High"
                                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                          : "bg-slate-800 text-slate-400"
                                      }`}
                                    >
                                      {task.priority}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
                      <p className="text-slate-400 text-sm">No action items detected in this meeting.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Chat with Meeting */}
              {activeTab === "chat" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 flex flex-col h-[600px]">
                  <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-semibold text-sm">AI Meeting Assistant</span>
                      <span className="text-xs text-slate-500">· Grounded in {meeting.filename}</span>
                    </div>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {chatMessages.length === 0 ? (
                      <div className="py-12 text-center max-w-md mx-auto">
                        <Sparkles className="mx-auto h-8 w-8 text-indigo-400 mb-2" />
                        <h3 className="font-semibold text-white">Ask anything about this meeting</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          The assistant answers strictly based on what was discussed in the transcript and decisions.
                        </p>

                        {/* Quick Prompts */}
                        <div className="mt-4 flex flex-col gap-2 text-left">
                          {[
                            "What were the key decisions made?",
                            "What tasks were assigned and to whom?",
                            "Give me a short summary of this meeting",
                            "What deadlines or dates were mentioned?"
                          ].map((prompt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendChat(prompt)}
                              className="text-xs p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 text-slate-300 transition text-left"
                            >
                              💬 {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.role === "assistant" && (
                            <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                              <Bot size={15} />
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-tr-none"
                                : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{msg.content}</div>

                            {/* Cited Excerpts */}
                            {msg.cited_excerpts && msg.cited_excerpts.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1">
                                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                  Supporting Transcript Evidence:
                                </p>
                                {msg.cited_excerpts.map((excerpt, qIdx) => (
                                  <div
                                    key={qIdx}
                                    className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/60"
                                  >
                                    &ldquo;{excerpt}&rdquo;
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {msg.role === "user" && (
                            <div className="h-7 w-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                              <User size={15} />
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {chatLoading && (
                      <div className="flex gap-3 items-center text-slate-400 text-xs">
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <Bot size={15} />
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-indigo-400" />
                          <span>Searching transcript and formulating verified answer...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="mt-4 pt-3 border-t border-slate-800 flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Ask a question about this meeting..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={chatLoading}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !inputMessage.trim()}
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl transition flex items-center justify-center shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 4: Transcript */}
              {activeTab === "transcript" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Full Verbatim Transcript</h2>
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 transition"
                    >
                      {copiedTranscript ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copiedTranscript ? "Copied" : "Copy Transcript"}
                    </button>
                  </div>
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[35rem] overflow-y-auto font-sans p-4 bg-slate-950/70 rounded-xl border border-slate-800/80">
                    {meeting.transcript || "No transcript available for this meeting."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
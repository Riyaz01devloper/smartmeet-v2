"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");



  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      console.log("Calling /meetings API...");

      const response = await api.get("/meetings");

      console.log("Meetings Response:", response.data);

      setMeetings(response.data);
    } catch (error) {
      console.log("Meetings Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const deleteMeeting = async (id:number) =>{ 
  console.log("Deleting:", id);

  try {
  // const response=  await api.delete (`/meeting/${id}`);
      const response = await api.delete(`/meeting/${id}`);

      console.log(response.data);
    setMeetings (
      meetings.filter((meeting) => meeting.id != id)
    );
    toast.success("Meeting deleted successfully");

  }
  catch (error){
    console.log(error)
    toast.error("failed to delete meeting")
  }

}

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">
          Loading...
        </h1>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">
          No Meetings Found
        </h1>
      </div>
    );
  }
    const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.filename
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      meeting.summary
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalMeeting = meetings.length;
  const totalWords = meetings.reduce(
    (sum,meeting) => sum +(meeting.transcript?.split( " ").length || 0),
    0
  );
  const totalSummaries = meetings.filter (
    (meeting) => meeting.summary).length;

 return (
  <div className="min-h-screen bg-slate-950 text-white">

    {/* Header */}
    <div className="border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <h1 className="text-4xl font-bold">
          🎙️ Meeting Intelligence
        </h1>

        <p className="text-slate-400 mt-2">
          Analyze meetings with AI powered insights
        </p>
      </div>
    </div>

    {/* Dashboard */}
    <div className="max-w-7xl mx-auto px-8 py-8">

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-slate-400">
            Total Meetings
          </h3>

          <p className="text-4xl font-bold mt-2">
            {totalMeeting}
          </p>
        </div>
                     <input
  type="text"
  placeholder="🔍 Search meetings..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-8 text-white outline-none"
/>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-slate-400">
            AI Summaries
          </h3>

          <p className="text-4xl font-bold mt-2">
            {totalSummaries}
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-slate-400">
            Word Processed
          </h3>

          <p className="text-4xl font-bold mt-2">
            {totalWords}
          </p>
        </div>

      </div>

      {/* Meetings */}
      <div className="space-y-5">

        {filteredMeetings.map((meeting) => (

          <div
            key={meeting.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition"
          >

            <div className="flex justify-between items-start">

              <div>
                <h2 className="text-xl font-semibold">
                  🎤 {meeting.filename}
                </h2>

                <p className="text-slate-400 mt-3 line-clamp-3">
                  {meeting.summary}
                </p>
              </div>

              <div className="flex gap-3">

                <Link
                  href={`/meetings/${meeting.id}`}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  View
                </Link>

                <button
onClick={() => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this meeting?"
  );

  if (confirmDelete) {
    deleteMeeting(meeting.id);
  }
}}                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
    </div>
    );
  }
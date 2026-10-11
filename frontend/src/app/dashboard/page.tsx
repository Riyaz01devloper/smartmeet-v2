"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/component/ProtectedRoute";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/meetings");
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Redirecting to meetings...</p>
      </div>
    </ProtectedRoute>
  );
}
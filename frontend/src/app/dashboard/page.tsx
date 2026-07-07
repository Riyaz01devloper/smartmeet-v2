"use client";

import ProtectedRoute from "@/component/ProtectedRoute";
export default function Dashboard() {
  return (
    <ProtectedRoute>
      {/* Tera pura dashboard */}
      <h1>Dashboard</h1>
    </ProtectedRoute>
  );
}
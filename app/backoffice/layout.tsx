"use client";

import Sidebar from "../components/sidebar";
import TopNav from "../components/top-nav";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-200 rounded-tl-3xl shadow-lg">
          {children}
        </main>
      </div>
    </div>
  );
}

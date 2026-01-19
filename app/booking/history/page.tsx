"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";
import Image from "next/image";

interface Booking {
  id: number;
  check_in: string;
  check_out: string;
  nights: number;
  total_price: number;
  status: string;
  room: {
    title: string;
    image: string;
    type: string;
  };
}

const statusStyle = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
};

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("bun_token_key");
        if (!token) throw new Error("unauthorized");

        const res = await axios.get(`${config.apiUrl}/api/booking/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBookings(res.data.bookings || []);
      } catch (error) {
        Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบ", "warning");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <main className="min-h-screen flex flex-col font-sans bg-gray-50">
      {/* Header */}
      <header className="w-full z-50 bg-white/60 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="../"
            className="text-2xl font-bold text-gray-900 tracking-wide h1"
          >
            CELESTIA GRANDE HOTEL
          </a>
          <nav className="flex items-center gap-6 text-gray-700 font-medium">
            <a href="../#rooms" className="hover:text-gray-900 transition">
              กลับหน้าห้องพัก
            </a>
          </nav>
        </div>
      </header>

      <section className="flex-grow pt-28 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">ประวัติการจองของฉัน</h1>

          {bookings.length === 0 ? (
            <div className="text-center text-gray-500 bg-white p-10 rounded-xl shadow">
              ยังไม่มีประวัติการจอง
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl shadow flex flex-col md:flex-row overflow-hidden"
                >
                  <div className="relative w-full md:w-64 h-48">
                    <Image
                      src={b.room.image}
                      alt={b.room.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-bold">{b.room.title}</h2>
                        <p className="text-sm text-gray-500">{b.room.type}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full font-semibold uppercase shadow-sm ${
                          statusStyle[b.status as keyof typeof statusStyle]
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="mt-4 text-sm text-gray-600 space-y-1">
                      <p>
                        📅 {formatDate(b.check_in)} – {formatDate(b.check_out)}
                      </p>
                      <p>🌙 {b.nights} คืน</p>
                      <p className="font-semibold text-indigo-600">
                        💰 {b.total_price.toLocaleString()} บาท
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 border-t">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p>&copy; 2025 CELESTIA GRANDE HOTEL. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a
              href="https://github.com/chalormpol"
              target="_blank"
              className="hover:text-white transition"
            >
              FB
            </a>
            <a
              href="https://github.com/chalormpol"
              target="_blank"
              className="hover:text-white transition"
            >
              IG
            </a>
            <a
              href="https://github.com/chalormpol"
              target="_blank"
              className="hover:text-white transition"
            >
              GH
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";
import Image from "next/image";

interface Booking {
  id: number;
  check_in: string;
  check_out: string;
  nights: number;
  price_per_night: number;
  total_price: number;
  status: string;
  user: {
    fname: string;
    lname: string;
    email: string;
  };
  room: {
    title: string;
    type: string;
    image: string;
  };
}

const statusStyle = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
};

export default function Page() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/booking/list`);
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const payload = {
        status,
      };

      await axios.put(
        `${config.apiUrl}/api/booking/update-status/${id}`,
        payload
      );

      Swal.fire("สำเร็จ", "อัปเดตสถานะแล้ว", "success");
      fetchData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        const status = error.response?.status;

        Swal.fire({
          icon: "error",
          title: "มีข้อผิดพลาด",
          text: `${msg} (Status: ${status})`,
        });
      } else {
        const msg = error instanceof Error ? error.message : String(error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Not an axios error: " + msg,
        });
      }
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-8xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">จัดการรายการจอง</h1>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm divide-y divide-gray-200 hover:bg-gray-100 transition-colors">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                รูป
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                ห้อง
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                ผู้จอง
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                วันที่เข้าพัก
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                วันที่ออกพัก
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                คืน
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                ราคาต่อคืน
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                ราคารวม
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                สถานะ
              </th>
              <th className="px-6 py-4 text-center font-semibold text-gray-700 uppercase tracking-wide">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Image
                    src={booking.room.image}
                    alt={booking.room.title}
                    width={100}
                    height={100}
                  />
                </td>
                <td className="px-6 py-4 capitalize">{booking.room.title}</td>
                <td className="px-6 py-4">
                  {booking.user.fname} {booking.user.lname}
                </td>
                <td className="px-6 py-4 capitalize">
                  {formatDate(booking.check_in)}
                </td>
                <td className="px-6 py-4 capitalize">
                  {formatDate(booking.check_out)}
                </td>
                <td className="px-6 py-4 capitalize">{booking.nights}</td>
                <td className="px-6 py-4 capitalize">
                  {booking.price_per_night}
                </td>
                <td className="px-6 py-4 capitalize">{booking.total_price}</td>
                <td className="px-6 py-4 capitalize">
                  <span
                    className={`px-3 py-1 rounded-full font-semibold uppercase shadow-sm ${
                      statusStyle[booking.status as keyof typeof statusStyle]
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <select
                    value={booking.status}
                    onChange={(e) => updateStatus(booking.id, e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">รอดำเนินการ</option>
                    <option value="confirmed">ยืนยันแล้ว</option>
                    <option value="cancelled">ยกเลิก</option>
                    <option value="completed">เสร็จสิ้น</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Room = {
  id: number;
  title: string;
  type: string;
  price: string;
  image: string;
  description?: string;
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [disabledRanges, setDisabledRanges] = useState<
    { check_in: string; check_out: string }[]
  >([]);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const bookedSet = useMemo(() => {
    const set = new Set<string>();

    disabledRanges.forEach((r) => {
      const d = new Date(r.check_in);
      const end = new Date(r.check_out);

      while (d <= end) {
        set.add(d.toDateString());
        d.setDate(d.getDate() + 1);
      }
    });

    return set;
  }, [disabledRanges]);

  const bookingRef = useRef(false);

  const handleBooking = useCallback(async () => {
    if (!checkIn || !checkOut) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกวันเข้าพักและวันออก", "warning");
      return;
    }

    if (bookingRef.current) return;
    bookingRef.current = true;

    try {
      const token = localStorage.getItem("bun_token_key");

      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "กรุณาเข้าสู่ระบบ",
          text: "ต้องเข้าสู่ระบบก่อนจองห้อง",
          confirmButtonText: "ไปหน้าล็อกอิน",
          timer: 1000,
          timerProgressBar: true,
          showCancelButton: true,
          cancelButtonText: "ยกเลิก",
        }).finally(() => {
          router.push("/");
        });
        return;
      }

      if (checkOut <= checkIn) {
        Swal.fire("แจ้งเตือน", "กรุณาเลือกวันออกพักหลังวันเข้าพัก", "warning");
        return;
      }

      const payload = {
        room_id: room!.id,
        check_in: checkIn?.toISOString().slice(0, 10),
        check_out: checkOut?.toISOString().slice(0, 10),
      };

      const res = await axios.post(
        `${config.apiUrl}/api/booking/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.error === "Room is already booked for selected dates") {
        const conflicts = res.data.conflicts || [];

        const conflictText = conflicts
          .map(
            (c: { check_in: string; check_out: string }) =>
              `• ${formatDate(c.check_in)} ถึง ${formatDate(c.check_out)}`
          )
          .join("<br/>");

        Swal.fire({
          icon: "warning",
          title: "ห้องไม่ว่างในช่วงวันที่เลือก",
          html: `
      <p>ห้องนี้ถูกจองแล้วในช่วง:</p>
      <div style="text-align:left; margin-top:8px;">
        ${conflictText}
      </div>
      <p style="margin-top:10px;">กรุณาเลือกวันใหม่</p>
    `,
          confirmButtonText: "ตกลง",
        });

        return;
      }

      if (res.data.booking) {
        Swal.fire({
          icon: "success",
          title: "จองสำเร็จ 🎉",
          html: `
    <p>สามารถตรวจสอบการจองได้ในเมนู "ประวัติการจอง"</p>
  `,
          confirmButtonText: "ไปหน้าการจองของฉัน",
        }).then(() => {
          router.push("/booking/history");
        });
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : String(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดไม่สามารถจองได้",
        text: msg,
        confirmButtonText: "ตกลง",
        timer: 1000,
        timerProgressBar: true,
        showCancelButton: true,
      });
    } finally {
      bookingRef.current = false;
    }
  }, [checkIn, checkOut, room, router]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/rooms/${id}`);

        setRoom(res.data.room);
        setDisabledRanges(res.data.room.bookings ?? []);
      } catch (error: unknown) {
        console.error(error);
        Swal.fire("Error", "โหลดข้อมูลไม่สำเร็จ", "error");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  useEffect(() => {
    if (!checkIn || !checkOut) return;

    const isConflict = (start: Date, end: Date) =>
      disabledRanges.some((r) => {
        const rs = new Date(r.check_in);
        const re = new Date(r.check_out);
        return !(end <= rs || start >= re);
      });

    if (isConflict(checkIn, checkOut)) {
      Swal.fire({
        icon: "warning",
        title: "วันที่ไม่ว่าง",
        text: "มีผู้จองห้องนี้แล้วในช่วงวันที่คุณเลือก",
      });

      setCheckOut(null);
    }
  }, [checkIn, checkOut, disabledRanges]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const diff = checkOut.getTime() - checkIn.getTime();
    return diff > 0 ? Math.ceil(diff / 86400000) : 0;
  }, [checkIn, checkOut]);

  const pricePerNight = room ? Number(room.price) : 0;

  const totalPrice = useMemo(() => {
    return nights * pricePerNight;
  }, [nights, pricePerNight]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!room) return null;

  return (
    <main className="min-h-screen flex flex-col font-sans bg-gray-50">
      {/* Header */}
      <header className="w-full z-50 bg-white/60 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="../"
            className="text-2xl font-bold text-gray-900 tracking-wide h1"
          >
            LuxuryStay
          </a>
          <nav className="flex items-center gap-6 text-gray-700 font-medium">
            <a href="../#rooms" className="hover:text-gray-900 transition">
              กลับหน้าห้องพัก
            </a>
          </nav>
        </div>
      </header>

      <section className="flex-grow pt-28 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT : IMAGE */}
            <div className="lg:col-span-2">
              <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={room.image}
                  alt={room.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow">
                  <p className="text-sm text-gray-500">ราคา / คืน</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {Number(room.price).toLocaleString()} บาท
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h1 className="text-4xl font-bold mb-2">{room.title}</h1>
                <p className="text-gray-500 mb-4">ประเภทห้อง: {room.type}</p>
                <p className="text-gray-700 leading-relaxed">
                  {room.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                </p>
              </div>
            </div>

            {/* RIGHT : BOOKING CARD */}
            <div className="bg-white rounded-3xl shadow-xl p-6 h-fit sticky top-32">
              <h2 className="text-2xl font-bold mb-4">จองห้องพัก</h2>

              {/* DATE PICKER */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Check-in
                  </label>
                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    placeholderText="เลือกวันที่"
                    shouldCloseOnSelect
                    selected={checkIn}
                    onChange={(date: Date | null) => setCheckIn(date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={new Date()}
                    excludeDateIntervals={(disabledRanges ?? []).map((r) => {
                      const start = new Date(r.check_in);
                      const end = new Date(r.check_out);
                      return { start, end };
                    })}
                    className="w-full border rounded-xl px-4 py-3"
                    dayClassName={(date) =>
                      bookedSet.has(date.toDateString()) ? "booked-day" : ""
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Check-out
                  </label>
                  <DatePicker
                    dateFormat="dd/MM/yyyy"
                    placeholderText="เลือกวันที่"
                    shouldCloseOnSelect
                    selected={checkOut}
                    onChange={(date: Date | null) => setCheckOut(date)}
                    selectsEnd
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={
                      checkIn
                        ? new Date(checkIn.getTime() + 86400000)
                        : new Date()
                    }
                    excludeDateIntervals={(disabledRanges ?? []).map((r) => {
                      const start = new Date(r.check_in);
                      const end = new Date(r.check_out);
                      return { start, end };
                    })}
                    className="w-full border rounded-xl px-4 py-3"
                    dayClassName={(date) =>
                      bookedSet.has(date.toDateString()) ? "booked-day" : ""
                    }
                  />
                </div>
              </div>

              {/* PRICE SUMMARY */}
              {nights > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>จำนวนคืน</span>
                    <span className="font-medium">{nights} คืน</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ราคา / คืน</span>
                    <span className="font-medium">
                      {pricePerNight.toLocaleString()} บาท
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold text-indigo-600">
                    <span>ราคารวม</span>
                    <span>{totalPrice.toLocaleString()} บาท</span>
                  </div>
                </div>
              )}

              {/* ACTION */}
              <button
                disabled={nights === 0}
                onClick={handleBooking}
                className={`w-full py-4 rounded-xl text-white font-semibold transition
            ${
              nights === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-600"
            }
          `}
              >
                ยืนยันการจอง
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                * กรุณาเลือกวันเข้าพักและวันออก
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 border-t">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p>&copy; 2025 LuxuryStay. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-white transition">
              FB
            </a>
            <a href="#" className="hover:text-white transition">
              IG
            </a>
            <a href="#" className="hover:text-white transition">
              TW
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

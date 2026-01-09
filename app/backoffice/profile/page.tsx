"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import config from "@/app/config";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem(config.tokenKey!);
        if (!token) return;

        const levelRes = await axios.get(`${config.apiUrl}/api/users/level`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserId(levelRes.data.id);

        const res = await axios.get(
          `${config.apiUrl}/api/users/info/${levelRes.data.id}`,
          { headers: { Authorization: `Bearer ${token}` } } // แนะนำเพิ่ม headers ด้วย
        );

        setEmail(res.data.user.email ?? "");
        setFname(res.data.user.fname ?? "");
        setLname(res.data.user.lname ?? "");
        setPhone(res.data.user.phone ?? "");
      } catch (error: unknown) {
        const msg = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error
          ? error.message
          : String(error);
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: msg });
      }
    };
    fetchData();
  }, []);

  const saveProfile = async () => {
    try {
      const payload = {
        email: email,
        password: password,
        fname: fname,
        lname: lname,
        phone: phone,
      };

      if (!userId) return;

      await axios.put(
        `${config.apiUrl}/api/users/updateUser/${userId}`,
        payload
      );

      Swal.fire({
        icon: "success",
        title: "บันทึกข้อมูล",
        text: "ข้อมูลร้านถูกบันทึกสำเร็จ",
        timer: 1500,
      });
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
          text: `Status: ${status} - ${msg}`,
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

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 sm:p-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        เเก้ไขข้อมูลผู้ใช้
      </h1>

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            อีเมล
          </label>
          <input
            type="text"
            value={email}
            disabled={true}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            รหัสผ่าน
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน"
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ชื่อ
          </label>
          <input
            type="text"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            นามสกุล
          </label>
          <input
            type="text"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เบอร์โทรศัพท์
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        {/* Save Button */}
        <div>
          <button
            onClick={saveProfile}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-md hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-check"></i>
            <span>บันทึก</span>
          </button>
        </div>
      </div>
    </div>
  );
}

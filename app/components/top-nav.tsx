"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import config from "../config";

export default function TopNav() {
  const router = useRouter();

  const [userLevel, setUserLevel] = useState("");
  const [user, setUser] = useState({
    id: "",
    fname: "",
    lname: "",
    email: "",
  });

  const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      if (status === 401) {
        if (msg === "Unauthorized") {
          Swal.fire({
            icon: "warning",
            title: "ยังไม่ได้เข้าสู่ระบบ",
            text: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
          });
        } else if (msg === "Invalid token") {
          Swal.fire({
            icon: "error",
            title: "Token ไม่ถูกต้องหรือหมดอายุ",
            text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "ไม่ได้รับอนุญาต",
            text: `Status: ${status} - ${msg}`,
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "มีข้อผิดพลาด",
          text: `Status: ${status} - ${msg}`,
        });
      }
    } else {
      const msg = error instanceof Error ? error.message : String(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "ไม่ใช่ axios error: " + msg,
      });
    }
  };

  useEffect(() => {
    const fetchUserLevel = async () => {
      try {
        const token = localStorage.getItem(config.tokenKey!);

        if (!token) {
          setUserLevel("");
          return;
        }
        const response = await axios.get(`${config.apiUrl}/api/users/level`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserLevel(response.data.role);
        setUser({
          id: response.data.id,
          fname: response.data.fname,
          lname: response.data.lname,
          email: response.data.email,
        });
      } catch (error) {
        handleAxiosError(error);
      }
    };
    fetchUserLevel();
  }, []);

  const handleLogout = async () => {
    const button = await Swal.fire({
      title: "ออกจากระบบ",
      text: "คุณต้องการที่จะออกจากระบบหรือไม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563EB", // สีน้ำเงิน
      cancelButtonColor: "#DC2626", // สีแดง
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (button.isConfirmed) {
      localStorage.removeItem(config.tokenKey!);
      localStorage.removeItem("bun_service_id");
      // localStorage.removeItem("bun_service_email");
      // localStorage.removeItem("bun_service_fname");
      // localStorage.removeItem("bun_service_lname");
      // localStorage.removeItem("bun_service_role");
      router.push("/auth/signin");
    }
  };

  const handleProfile = () => {
    router.push("/backoffice/profile");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="mx-auto px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-wrench text-white text-xl"></i>
            <h1 className="text-lg font-semibold text-white tracking-wide">
              Bun Service
            </h1>
            <span className="text-xs text-slate-400">Backoffice 2025</span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-sm text-white font-medium">
                {user.email || "-"}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {userLevel || "-"}
              </p>
            </div>

            <button
              onClick={handleProfile}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition text-sm"
            >
              <i className="fa-solid fa-user"></i> โปรไฟล์
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
            >
              <i className="fa-solid fa-right-from-bracket"></i> ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

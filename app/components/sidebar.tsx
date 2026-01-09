"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "../config";
import Swal from "sweetalert2";

export default function Sidebar() {
  const [userLevel, setUserLevel] = useState("");
  const [user, setUser] = useState({
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

      // เช็คสถานะ 401 แบบละเอียด
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
        // กรณี error อื่น ๆ
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
        const token = localStorage.getItem(config.tokenKey);

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

  let menuItems: { title: string; href: string; icon: string }[] = [];

  if (userLevel === "admin") {
    menuItems = [
      {
        title: "จัดการผู้ใช้",
        href: "/backoffice/users",
        icon: "fa-solid fa-user",
      },
      {
        title: "จัดการพนักงาน",
        href: "/backoffice/employee",
        icon: "fa-solid fa-users",
      },
      {
        title: "จัดการเเอดมิน",
        href: "/backoffice/admin",
        icon: "fa-solid fa-user-shield",
      },
      {
        title: "เพิ่มตำเเหน่ง",
        href: "/backoffice/position",
        icon: "fa-solid fa-user-plus",
      },
      {
        title: "เพิ่มห้องพัก",
        href: "/backoffice/rooms",
        icon: "fa-solid fa-bed",
      },
      {
        title: "คำขอผู้ใช้",
        href: "/backoffice/contact",
        icon: "fa-solid fa-envelope",
      },
    ];
  } else if (userLevel === "employee") {
    menuItems = [
      {
        title: "จัดการจองห้องพัก",
        href: "/backoffice/booking",
        icon: "fa-solid fa-bed",
      },
    ];
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-100 flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <i className="fa-solid fa-user text-3xl text-white"></i>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Bun Service</h1>
          <p className="text-xs text-slate-400">Backoffice 2025</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="
            flex items-center gap-3
            px-4 py-2.5
            rounded-xl
            text-slate-300
            hover:bg-slate-800 hover:text-white
            transition
          "
          >
            <i className={`${item.icon} text-sm`}></i>
            <span className="text-sm font-medium">{item.title}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
        Logged in as: <span className="text-white capitalize">{userLevel}</span>
      </div>
    </aside>
  );
}

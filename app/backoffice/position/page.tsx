"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "@/app/config";
import Modal from "@/app/components/modal";
import Swal from "sweetalert2";

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  interface Position {
    id: string;
    name: string;
    status: string;
  }

  const fetchData = useCallback(async () => {
    try {
      const posRes = await axios.get(`${config.apiUrl}/api/positions/list`);

      setPositions(posRes.data.positions);
    } catch (error) {
      console.error("Fetch data error:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleShowModal = () => {
    setId("");
    setName("");
    setStatus("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async () => {
    try {
      if (name == "") {
        Swal.fire({
          title: "กรุณาระบุชื่อตำแหน่ง",
          icon: "error",
        });
        return;
      }

      const payload = {
        name,
      };

      if (id == "") {
        await axios.post(`${config.apiUrl}/api/positions/create`, payload);
        Swal.fire({
          title: "เพิ่มข้อมูลสำเร็จ",
          icon: "success",
        });
      } else {
        const res = await axios.put(
          `${config.apiUrl}/api/positions/update/${id}`,
          payload
        );

        if (res.data.error === "ไม่พบตำแหน่ง") {
          Swal.fire({
            title: "ไม่พบตำแหน่ง",
            icon: "error",
          });
          return;
        } else {
          Swal.fire({
            title: "แก้ไขข้อมูลสำเร็จ",
            icon: "success",
          });
        }
        setId("");
      }

      fetchData();
      handleCloseModal();

      setName("");
      setStatus("");
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

  const handleEdit = async (position: Position) => {
    setId(position.id);
    setName(position.name);
    setStatus(position.status);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const button = await config.confirmRemoveDialog();

      if (button.isConfirmed) {
        await axios.put(`${config.apiUrl}/api/positions/remove/${id}`);
        Swal.fire({
          title: "ลบข้อมูลสำเร็จ",
          icon: "success",
        });
        fetchData();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;

        Swal.fire({
          icon: "error",
          title: "มีข้อผิดพลาด",
          text: msg,
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
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-10 lg:p-12">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ตำแหน่งงาน</h1>
        <button
          onClick={handleShowModal}
          className="px-5 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600  text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
        >
          <i className="fa-solid fa-plus mr-2"></i> เพิ่มข้อมูล
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm divide-y divide-gray-200 hover:bg-gray-100 transition-colors">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                ตำแหน่ง
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
            {positions.map((position) => (
              <tr key={position.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 capitalize">{position.name}</td>
                <td className="px-6 py-4 capitalize">
                  <span
                    className={`px-3 py-1 rounded-full font-semibold uppercase shadow-sm ${
                      position.status === "active"
                        ? "bg-green-100 text-green-700"
                        : position.status === "inactive"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {position.status === "active"
                      ? "เปิดใช้งาน"
                      : position.status === "inactive"
                      ? "ปิดใช้งาน"
                      : "ถูกระงับ"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-4">
                  <button
                    onClick={() => handleEdit(position)}
                    className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(position.id)}
                    className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal
        title="ข้อมูลพนักงานร้าน"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              ตำแหน่งงาน
            </label>
            <input
              type="text"
              placeholder="กรอกตำแหน่งงาน"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors`}
            />
          </div>

          {/* ปุ่มบันทึก */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white shadow-md hover:from-gray-700 hover:via-gray-600 hover:to-gray-500 transition-all"
          >
            บันทึก
          </button>
        </div>
      </Modal>
    </div>
  );
}

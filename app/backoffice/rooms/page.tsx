"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "@/app/config";
import Modal from "@/app/components/modal";
import Swal from "sweetalert2";
import Image from "next/image";

interface Room {
  id: string;
  title: string;
  type: string;
  price: string;
  label: string;
  description: string | null;
  image: string;
  status: string;
}

export default function Page() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const typesroom = [
    { label: "Deluxe", value: "deluxe" },
    { label: "Suite", value: "suite" },
    { label: "Presidential", value: "presidential" },
    { label: "Standard", value: "standard" },
  ];
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const fetchData = useCallback(async () => {
    try {
      const [empRes] = await Promise.all([
        axios.get(`${config.apiUrl}/api/rooms/list`),
      ]);

      setRooms(empRes.data.rooms);
    } catch (error) {
      console.error("Fetch data error:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imgPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imgPreview);
      }
    };
  }, [imgPreview]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleShowModal = () => {
    setId("");
    setTitle("");
    setType("");
    setPrice("");
    setLabel("");
    setDescription("");
    setImg(null);
    setImgPreview(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const base64Image = img
        ? await fileToBase64(img)
        : (imgPreview ?? undefined);

      const payload = {
        title,
        type,
        price,
        label,
        description,
        image: base64Image,
      };

      if (id == "") {
        await axios.post(`${config.apiUrl}/api/rooms/create`, payload);
        Swal.fire({
          title: "เพิ่มข้อมูลสำเร็จ",
          icon: "success",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        const res = await axios.put(
          `${config.apiUrl}/api/rooms/update/${id}`,
          payload,
        );

        if (res.data) {
          Swal.fire({
            title: "แก้ไขข้อมูลสำเร็จ",
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
        setId("");
      }

      fetchData();
      handleCloseModal();

      setTitle("");
      setType("");
      setPrice("");
      setLabel("");
      setDescription("");
      setImg(null);
      setImgPreview(null);
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

  const handleEdit = async (room: Room) => {
    setId(room.id);
    setTitle(room.title);
    setType(room.type);
    setPrice(room.price);
    setLabel(room.label);
    setDescription(room.description ?? "");
    setImgPreview(room.image);
    setImg(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const button = await config.confirmRemoveDialog();

      if (button.isConfirmed) {
        await axios.put(`${config.apiUrl}/api/rooms/remove/${id}`);
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

  const handleAllow = async (id: string) => {
    try {
      const button = await config.confirmAllowDialog();

      if (button.isConfirmed) {
        await axios.put(`${config.apiUrl}/api/rooms/allow/${id}`);
        Swal.fire({
          title: "อนุญาตใช้งานสำเร็จ",
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

  const handleBan = async (id: string) => {
    try {
      const button = await config.confirmBanDialog();

      if (button.isConfirmed) {
        await axios.put(`${config.apiUrl}/api/rooms/banned/${id}`);
        Swal.fire({
          title: "บังคับการใช้งานสำเร็จ",
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

  const handleClean = async (id: string) => {
    try {
      const button = await config.confirmBanDialog();

      if (button.isConfirmed) {
        await axios.put(`${config.apiUrl}/api/rooms/cleaned/${id}`);
        Swal.fire({
          title: "ทำความสะอาดสำเร็จ",
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
        <h1 className="text-2xl font-bold text-gray-800">จัดการห้องพัก</h1>
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
                รูปภาพ
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                ประเภทห้อง
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                ชื่อห้องพัก
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                ราคา
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
            {rooms.map((room) => (
              <tr key={room.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Image
                    src={room.image}
                    alt="room"
                    width={100}
                    height={100}
                    className="object-cover"
                  />
                </td>
                <td className="px-6 py-4 capitalize">{room.type}</td>
                <td className="px-6 py-4">{room.title}</td>
                <td className="px-6 py-4 capitalize">{room.price}</td>
                <td className="px-6 py-4 capitalize">
                  <span
                    className={`px-3 py-1 rounded-full font-semibold uppercase shadow-sm ${
                      room.status === "active"
                        ? "bg-green-100 text-green-700"
                        : room.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : room.status === "cleaned"
                            ? "bg-yellow-100 text-yellow-700"
                            : room.status === "banned"
                              ? "bg-red-100 text-red-700"
                              : "bg-red-100 text-red-700"
                    }`}
                  >
                    {room.status === "active"
                      ? "เปิดใช้งาน"
                      : room.status === "inactive"
                        ? "ปิดใช้งาน"
                        : room.status === "cleaned"
                          ? "ทำความสะอาด"
                          : room.status === "banned"
                            ? "ถูกระงับ"
                            : "ถูกระงับ"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-4">
                  <button
                    onClick={() => handleEdit(room)}
                    className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    onClick={() => handleClean(room.id)}
                    className="text-yellow-600 hover:text-yellow-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-broom"></i>
                  </button>
                  <button
                    onClick={() => handleAllow(room.id)}
                    className="text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button
                    onClick={() => handleBan(room.id)}
                    className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-ban"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
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
        title="ข้อมูลห้องพัก"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSave}>
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                ประเภทห้อง
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option value="">เลือกประเภทห้อง</option>
                {typesroom.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                ชื่อห้องพัก
              </label>
              <input
                type="text"
                placeholder="ชื่อห้องพัก"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors`}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                ราคา
              </label>
              <input
                type="number"
                placeholder="กรอกราคา"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors`}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                หัวข้อซ้ายบนรูป
              </label>
              <input
                type="text"
                placeholder="Popular / New / Best Seller"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors`}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                รายละเอียดห้องพัก
              </label>
              <textarea
                placeholder="รายละเอียดห้องพัก"
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors`}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                รูปภาพ
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImg(file);
                    setImgPreview(URL.createObjectURL(file));
                  }
                }}
                className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors`}
              />
              {imgPreview && (
                <div className="relative w-full h-80 rounded-xl overflow-hidden border mt-2">
                  <Image
                    src={imgPreview}
                    alt="preview"
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                </div>
              )}
            </div>

            {/* ปุ่มบันทึก */}
            <button className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white shadow-md hover:from-gray-700 hover:via-gray-600 hover:to-gray-500 transition-all">
              บันทึก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

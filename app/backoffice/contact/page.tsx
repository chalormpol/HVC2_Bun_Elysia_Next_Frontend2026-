"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import config from "@/app/config";
import { motion } from "framer-motion";

type Contact = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/contacts/list`);
      setContacts(res.data.contacts);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "ไม่สามารถโหลดข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบข้อความนี้หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${config.apiUrl}/api/contacts/remove/${id}`);
      Swal.fire("Deleted!", "ลบข้อความเรียบร้อย", "success");
      fetchContacts();
    } catch {
      Swal.fire("Error", "ไม่สามารถลบข้อมูลได้", "error");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">📩 Contact Messages</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500">ไม่มีข้อความติดต่อ</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6 border"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">
                    ชื่อ: {contact.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    อีเมล: {contact.email}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(contact.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  ลบ
                </button>
              </div>

              <p className="text-gray-700 whitespace-pre-line mb-3">
                ข้อความ: {contact.message}
              </p>

              <p className="text-xs text-gray-400">
                {new Date(contact.created_at).toLocaleString("th-TH")}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "@/app/config";
import Modal from "@/app/components/modal";
import Swal from "sweetalert2";

export default function Page() {
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordOld, setPasswordOld] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const roles = ["user", "admin", "employee"];
  const [role, setRole] = useState("user");

  type Field = [string, string, React.Dispatch<React.SetStateAction<string>>];

  interface Employee {
    id: string;
    email: string;
    password: string;
    fname: string;
    lname: string;
    phone: string;
    role: string;
    status: string;
  }

  const fetchData = useCallback(async () => {
    try {
      const [empRes] = await Promise.all([
        axios.get(`${config.apiUrl}/api/users/list`),
      ]);

      setEmployees(empRes.data.users);
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
    setEmail("");
    setPassword("");
    setFname("");
    setLname("");
    setPhone("");
    setRole("user");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setPasswordOld("");
    setConfirmPassword("");
    setShowModal(false);
  };

  const handleSave = async () => {
    try {
      if (email == "") {
        Swal.fire({
          title: "กรุณาระบุอีเมล",
          icon: "error",
        });
        return;
      }

      // ✅ กรณีเพิ่ม
      if (id === "") {
        if (password === "") {
          Swal.fire({ title: "กรุณาระบุรหัสผ่าน", icon: "error" });
          return;
        }

        if (confirmPassword === "") {
          Swal.fire({ title: "กรุณายืนยันรหัสผ่าน", icon: "error" });
          return;
        }

        if (password !== confirmPassword) {
          Swal.fire({ title: "รหัสผ่านไม่ตรงกัน", icon: "error" });
          return;
        }
      }

      // ✅ กรณีแก้ไข
      if (id !== "") {
        if (passwordOld === "") {
          Swal.fire({ title: "กรุณากรอกรหัสผ่านเดิม", icon: "error" });
          return;
        }

        if (password === "") {
          Swal.fire({ title: "กรุณากรอกรหัสผ่านใหม่", icon: "error" });
          return;
        }
      }

      if (fname == "") {
        Swal.fire({
          title: "กรุณาระบุชื่อ",
          icon: "error",
        });
        return;
      }

      if (lname == "") {
        Swal.fire({
          title: "กรุณาระบุนามสกุล",
          icon: "error",
        });
        return;
      }

      if (phone == "") {
        Swal.fire({
          title: "กรุณาระบุเบอร์โทรศัพท์",
          icon: "error",
        });
        return;
      }

      if (role == "") {
        Swal.fire({
          title: "กรุณาระบุบทบาท",
          icon: "error",
        });
        return;
      }

      const payload = {
        email,
        password,
        passwordOld: id !== "" ? passwordOld : undefined,
        fname,
        lname,
        phone,
        role,
      };

      if (id == "") {
        await axios.post(`${config.apiUrl}/api/users/create`, payload);
        Swal.fire({
          title: "เพิ่มข้อมูลสำเร็จ",
          icon: "success",
        });
      } else {
        const res = await axios.put(
          `${config.apiUrl}/api/users/updateUser/${id}`,
          payload
        );

        if (res.data.error === "ไม่พบผู้ใช้งาน") {
          Swal.fire({
            title: "ไม่พบผู้ใช้งาน",
            icon: "error",
          });
          return;
        } else if (res.data.error === "บัญชีนี้ยังไม่มีรหัสผ่านในระบบ") {
          Swal.fire({
            title: "บัญชีนี้ยังไม่มีรหัสผ่านในระบบ",
            icon: "error",
          });
          return;
        } else if (res.data.error === "กรุณากรอกรหัสผ่านเดิม") {
          Swal.fire({
            title: "กรุณากรอกรหัสผ่านเดิม",
            icon: "error",
          });
          return;
        } else if (res.data.error === "รหัสผ่านเดิมไม่ถูกต้อง") {
          Swal.fire({
            title: "รหัสผ่านเดิมไม่ถูกต้อง",
            icon: "error",
          });
          return;
        } else if (res.data.error === "กรุณากรอกรหัสผ่านใหม่") {
          Swal.fire({
            title: "กรุณากรอกรหัสผ่านใหม่",
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

      setEmail("");
      setPassword("");
      setFname("");
      setLname("");
      setPhone("");
      setRole("user");
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

  const handleEdit = async (user: Employee) => {
    setId(user.id);
    setEmail(user.email);
    setPassword("");
    setFname(user.fname);
    setLname(user.lname);
    setPhone(user.phone);
    setRole(user.role);
    setShowModal(true);
  };

  const handleAllow = async (id: string) => {
    try {
      const button = await config.confirmAllowDialog();

      if (button.isConfirmed) {
        await axios.put(`${config.apiUrl}/api/users/allow/${id}`);
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

  const handleDelete = async (id: string) => {
    try {
      const button = await config.confirmRemoveDialog();

      if (button.isConfirmed) {
        await axios.put(`${config.apiUrl}/api/users/remove/${id}`);
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

  const handleBan = async (id: string) => {
    try {
      const button = await config.confirmBanDialog();

      if (button.isConfirmed) {
        await axios.put(`${config.apiUrl}/api/users/banned/${id}`);
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

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-10 lg:p-12">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้</h1>
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
                ชื่อ-นามสกุล
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                อีเมล
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wide">
                เบอร์โทร
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
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  {employee.fname} {employee.lname}
                </td>
                <td className="px-6 py-4 capitalize">{employee.email}</td>
                <td className="px-6 py-4 capitalize">{employee.phone}</td>
                <td className="px-6 py-4 capitalize">
                  <span
                    className={`px-3 py-1 rounded-full font-semibold uppercase shadow-sm ${
                      employee.status === "active"
                        ? "bg-green-100 text-green-700"
                        : employee.status === "inactive"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {employee.status === "active"
                      ? "เปิดใช้งาน"
                      : employee.status === "inactive"
                      ? "ปิดใช้งาน"
                      : "ถูกระงับ"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-4">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    onClick={() => handleAllow(employee.id)}
                    className="text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button
                    onClick={() => handleBan(employee.id)}
                    className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-ban"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
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
        title="ข้อมูลผู้ใช้งาน"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="text"
              placeholder="กรอกอีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={id !== ""}
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors ${
                id !== "" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* 🔐 PASSWORD SECTION */}
          {id === "" ? (
            <>
              {/* ✅ เพิ่มพนักงาน */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type="password"
                  placeholder="ยืนยันรหัสผ่าน"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                />
              </div>
            </>
          ) : (
            <>
              {/* ✅ แก้ไขพนักงาน */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  รหัสผ่านเดิม
                </label>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านเดิม"
                  value={passwordOld}
                  onChange={(e) => setPasswordOld(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านใหม่"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                />
              </div>
            </>
          )}

          {(
            [
              ["ชื่อจริง", fname, setFname],
              ["นามสกุล", lname, setLname],
              ["เบอร์โทร", phone, setPhone],
            ] as Field[]
          ).map(([label, value, setter], i) => (
            <div key={i}>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="text"
                placeholder={`กรอก${label}`}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
              />
            </div>
          ))}

          {/* Role */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              บทบาทผู้ใช้งาน
            </label>
            <select
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
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

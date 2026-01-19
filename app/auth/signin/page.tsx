"use client";

import Link from "next/link";
import Swal from "sweetalert2";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import config from "../../config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire("Oops...", "Email and Password are required", "error");
      return;
    }

    try {
      const response = await axios.post(`${config.apiUrl}/auth/signin`, {
        email,
        password,
      });

      if (response.data.User.error === "User not found") {
        Swal.fire("Oops...", "User not found", "error");
        return;
      } else if (response.data.User.error === "Incorrect password") {
        Swal.fire("Oops...", "Incorrect password", "error");
        return;
      }

      if (response.data.User.token && response.data.User.user.role) {
        localStorage.setItem(config.tokenKey!, response.data.User.token);
        localStorage.setItem(
          "bun_service_id",
          response.data.User.user.id.toString(),
        );

        const role = response.data.User.user.role;
        if (role === "admin") router.push("/backoffice/employee");
        else if (role === "user") router.push("/#");
        else if (role === "employee") router.push("/backoffice/booking");
        else router.push("/");
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : String(error);

      Swal.fire("Oops...", msg, "error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-800 to-gray-950">
      <div className="text-gray-400 text-4xl font-bold mb-10">
        <i className="fa-solid fa-right-to-bracket"></i>
        <span className="ml-2">Login</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Login admin
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 mt-4 w-full"
        >
          <div>Email</div>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />

          <div className="mt-4">Password</div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />

          <button
            type="submit"
            className="btn bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors mt-5"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          ไม่มีบัญชี?{" "}
          <Link href="/auth/signup" className="text-indigo-500">
            สมัครสมาชิก
          </Link>
        </p>
        <p className="mt-4 text-center text-gray-400">
          <Link href="/" className="text-white">
            กลับหน้าแรก
          </Link>
        </p>
      </div>
    </div>
  );
}

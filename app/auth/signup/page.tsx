"use client";

import Link from "next/link";
import Swal from "sweetalert2";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import config from "../../config";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [img, setImg] = useState<File | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire("Oops...", "Email and Password are required", "error");
      return;
    }

    if (!email.includes("@")) {
      Swal.fire("Oops...", "Email is invalid", "error");
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire("Oops...", "Passwords do not match", "error");
      return;
    }

    try {
      let base64Image: string | undefined;
      if (img) {
        base64Image = await fileToBase64(img);
      }

      const payload = {
        email,
        password,
        fname,
        lname,
        phone,
        image: base64Image, // ส่งเป็น string
      };

      const response = await axios.post(
        `${config.apiUrl}/auth/signup`,
        payload
      );

      if (response.data.User.user) {
        Swal.fire(
          "Success!",
          "Sign up successful. Please login to continue.",
          "success"
        );
        router.push("/auth/signin");
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
        <i className="fa-solid fa-user-plus"></i>
        <span className="ml-2">Sign Up</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Create Account
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

          <div className="mt-4">Confirm Password</div>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control"
          />

          <div className="mt-4">First Name</div>
          <input
            type="text"
            placeholder="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            className="form-control"
          />

          <div className="mt-4">Last Name</div>
          <input
            type="text"
            placeholder="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            className="form-control"
          />

          <div className="mt-4">Phone</div>
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-control"
          />

          <div className="mt-4">Image</div>
          <input
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files) {
                setImg(e.target.files[0]);
              }
            }}
            className="form-control"
          />

          <button
            type="submit"
            className="btn bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors mt-5"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          มีบัญชีแล้ว?{" "}
          <Link href="/auth/signin" className="text-indigo-500">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}

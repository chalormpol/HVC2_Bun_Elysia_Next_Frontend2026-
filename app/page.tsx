"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useEffect, useState, useCallback } from "react";
import Modal from "./components/modal";
import Swal from "sweetalert2";
import axios from "axios";
import config from "./config";
import { useRouter } from "next/navigation";

// ------------------ Room Data ------------------
type Room = {
  id: number;
  title: string;
  type: string;
  price: string;
  image: string;
  label?: string;
};

const roomTypes = [
  { label: "All", value: "all" },
  { label: "Deluxe", value: "deluxe" },
  { label: "Suite", value: "suite" },
  { label: "Presidential", value: "presidential" },
  { label: "Standard", value: "standard" },
];

// ------------------ HomePage ------------------
export default function HomePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const fetchRooms = useCallback(async () => {
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
    const timer = setTimeout(() => {
      fetchRooms();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchRooms]);

  useEffect(() => {
    const loadToken = () => {
      const t = localStorage.getItem(config.tokenKey!);
      setToken(t);
      setIsTokenLoaded(true);
    };
    setTimeout(loadToken, 0);
  }, []);

  const handleLogout = async () => {
    const button = await Swal.fire({
      title: "ออกจากระบบ",
      text: "คุณต้องการที่จะออกจากระบบหรือไม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563EB",
      cancelButtonColor: "#DC2626",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (button.isConfirmed) {
      localStorage.removeItem(config.tokenKey!);
      Swal.fire({
        title: "ออกจากระบบ",
        text: "คุณได้ออกจากระบบแล้ว",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      setToken(null);
      setIsTokenLoaded(false);
      router.push("#");
    }
  };

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
        setToken(response.data.User.token);

        handleCloseModal();
        Swal.fire({
          title: "Success",
          text: "Login successfully",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        });

        // Redirect ตาม role
        const role = response.data.User.user.role;
        if (role === "admin") router.push("/backoffice/employee");
        else if (role === "user") router.push("/#rooms");
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

  const handleSubmitRegister = async (e: React.FormEvent<HTMLFormElement>) => {
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
        Swal.fire({
          title: "Success!",
          text: "Sign up successful. Please login to continue.",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        handleCloseRegisterModal();
        handleOpenModal();
      }
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : String(error);

      Swal.fire("Oops...มี Email นี้อยู่แล้ว", msg, "error");
    }
  };

  const handleCloseModal = () => {
    setEmail("");
    setPassword("");
    setShowModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleOpenRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFname("");
    setLname("");
    setPhone("");
    setImg(null);
  };

  const handleBook = (room: Room) => {
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาล็อกอิน",
        text: "กรุณาล็อกอินก่อนทำการจองห้องพัก",
        confirmButtonText: "ไปหน้าล็อกอิน",
        showCancelButton: true,
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          setShowModal(true);
        }
      });
      return;
    }

    // ✅ มี token → ถามยืนยันก่อนจอง
    Swal.fire({
      icon: "question",
      title: "ยืนยันการเลือกห้องพัก",
      text: `คุณต้องการเลือกห้องนี้ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "เลือกห้องพักสำเร็จ",
          text: "กรุณาตรวจสอบรายละเอียดการจอง",
          confirmButtonText: "ไปหน้าตรวจสอบ",
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).finally(() => {
          router.push(`/room/${room.id}`);
        });
      }
    });
  };

  const handleSubmitContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!contactName || !contactEmail || !contactMessage) {
      Swal.fire("Oops...", "กรุณากรอกข้อมูลให้ครบ", "warning");
      return;
    }

    if (!contactEmail.includes("@")) {
      Swal.fire("Oops...", "Email ไม่ถูกต้อง", "error");
      return;
    }

    try {
      setContactLoading(true);

      await axios.post(`${config.apiUrl}/api/contacts/create`, {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
      });

      Swal.fire({
        icon: "success",
        title: "ส่งข้อความสำเร็จ",
        text: "เราจะติดต่อกลับโดยเร็วที่สุด",
        timer: 1500,
        showConfirmButton: false,
      });

      // reset form
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : String(error);

      Swal.fire("Oops...", msg, "error");
    } finally {
      setContactLoading(false);
    }
  };

  const filteredRooms =
    selectedType === "all"
      ? rooms
      : rooms.filter((room) => room.type === selectedType);

  return (
    <main className="min-h-screen font-sans bg-gray-50 relative">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/60 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a
            href="#"
            className="text-2xl font-bold text-gray-900 tracking-wide h1"
          >
            LuxuryStay
          </a>
          <nav className="flex items-center gap-6 text-gray-700 font-medium">
            <a href="#rooms" className="hover:text-gray-900 transition">
              Rooms
            </a>
            <a href="#services" className="hover:text-gray-900 transition">
              Services
            </a>
            <a href="#contact" className="hover:text-gray-900 transition">
              Contact
            </a>

            {/* ปุ่ม Login / Logout */}
            {token ? (
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowModal(true);
                }}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000 }}
          loop
          className="h-full"
        >
          {["/images/room1.jpg", "/images/room2.jpg", "/images/room3.jpg"].map(
            (img, idx) => (
              <SwiperSlide key={idx}>
                <div className="relative h-screen w-full">
                  <Image
                    src={img}
                    alt={`Hero ${idx}`}
                    fill
                    priority
                    loading="eager"
                    className="object-cover object-center scale-110 animate-zoomSlow"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>

        <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg tracking-tight"
          >
            Experience Luxury & Comfort
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-white/90 text-lg md:text-xl max-w-xl mx-auto mb-6 drop-shadow-md"
          >
            Relax in our elegant rooms, enjoy premium services, and make
            unforgettable memories.
          </motion.p>
          <motion.a
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            href="#rooms"
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-indigo-600 hover:to-blue-500 transition-all"
          >
            Book Now
          </motion.a>
        </div>
      </section>
      <Modal
        title="Login"
        size="md"
        isOpen={showModal}
        onClose={handleCloseModal}
      >
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
            className="form-control-white"
          />

          <div className="mt-4">Password</div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control-white"
          />

          <button
            type="submit"
            className="btn bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors mt-5"
          >
            ล็อกอิน
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setShowModal(false);
            setShowRegisterModal(true);
          }}
          className="btn-blue bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mt-5 w-full"
        >
          ไปหน้าสมัครสมาชิก
        </button>
      </Modal>

      <Modal
        title="Register"
        size="md"
        isOpen={showRegisterModal}
        onClose={handleCloseRegisterModal}
      >
        <form
          onSubmit={handleSubmitRegister}
          className="flex flex-col gap-2 mt-4 w-full"
        >
          <div>Email</div>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control-white"
          />

          <div className="mt-4">Password</div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control-white"
          />

          <div className="mt-4">Confirm Password</div>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control-white"
          />

          <div className="mt-4">First Name</div>
          <input
            type="text"
            placeholder="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            className="form-control-white"
          />

          <div className="mt-4">Last Name</div>
          <input
            type="text"
            placeholder="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            className="form-control-white"
          />

          <div className="mt-4">Phone</div>
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-control-white"
          />

          <div className="mt-4">Image</div>
          <input
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files) {
                setImg(e.target.files[0]);
              }
            }}
            className="form-control-white"
          />

          <button
            type="submit"
            className="btn bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors mt-5"
          >
            สมัครสมาชิก
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setShowRegisterModal(false);
            setShowModal(true);
          }}
          className="btn-blue bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mt-5 w-full"
        >
          ไปหน้าล็อกอิน
        </button>
      </Modal>
      {/* Rooms Section */}
      <section id="rooms" className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-8 text-center tracking-wide">
          Our Rooms
        </h3>

        {/* Filter Buttons with animated underline */}
        <div className="flex justify-center gap-6 mb-12 flex-wrap relative">
          {roomTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className="relative px-4 py-2 font-medium text-gray-700 hover:text-gray-900 transition"
            >
              {type.label}
              {selectedType === type.value && (
                <motion.span
                  layoutId="underline"
                  className="absolute left-0 bottom-0 w-full h-1 bg-blue-600 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Animated Rooms Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredRooms.map((room) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <RoomCard room={room} onBook={handleBook} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-12 tracking-wide">
            Our Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ServiceCard
              title="Spa & Wellness"
              description="Relax and rejuvenate in our spa facilities."
            />
            <ServiceCard
              title="Fine Dining"
              description="Enjoy exquisite meals prepared by top chefs."
            />
            <ServiceCard
              title="Swimming Pool"
              description="Take a dip in our outdoor infinity pool."
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-8 text-center tracking-wide">
          Contact Us
        </h3>

        <form
          onSubmit={handleSubmitContact}
          className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="กรุณากรอกชื่อ"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <input
            type="email"
            placeholder="กรุณากรอกอีเมล"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <textarea
            placeholder="กรุณากรอกข้อความ"
            rows={5}
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            className="p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
          />

          <button
            type="submit"
            disabled={contactLoading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:from-indigo-600 hover:to-blue-500 transition disabled:opacity-60"
          >
            {contactLoading ? "กำลังส่งข้อความ..." : "ส่งข้อความ"}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300 border-t mt-20">
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

      {/* Zoom Animation */}
      <style jsx>{`
        @keyframes zoomSlow {
          0% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1.1);
          }
        }
        .animate-zoomSlow {
          animation: zoomSlow 25s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

type RoomCardProps = {
  room: Room;
  onBook: (room: Room) => void;
};

// ------------------ Room Card ------------------
function RoomCard({ room, onBook }: RoomCardProps) {
  const { title, price, image, label } = room;
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -5,
        boxShadow: "0px 15px 40px rgba(0,0,0,0.2)",
      }}
      className="bg-white rounded-2xl overflow-hidden relative cursor-pointer transition-transform"
    >
      {label && (
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
          {label}
        </div>
      )}
      <div className="relative w-full h-64">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <div className="p-6">
        <h4 className="text-xl font-semibold text-gray-800">{title}</h4>
        <p className="text-gray-600 mt-2">${price} / night</p>
        <button
          onClick={() => onBook(room)}
          className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg hover:from-indigo-600 hover:to-blue-500 transition"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}

// ------------------ Service Card ------------------
function ServiceCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0px 15px 35px rgba(0,0,0,0.15)" }}
      className="bg-white p-8 rounded-2xl shadow-lg transition cursor-pointer"
    >
      <h4 className="text-xl font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

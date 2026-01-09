import Swal from "sweetalert2";

const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  tokenKey: process.env.NEXT_PUBLIC_TOKEN_KEY,
  confirmAllowDialog: () => {
    return Swal.fire({
      icon: "question",
      iconColor: "#9ca3af",
      title: "ยืนยันการอนุญาต",
      text: "คุณต้องการอนุญาตใช้งานรายการนี้หรือไม่",
      showCancelButton: true,
      background: "#1f2937",
      color: "#9ca3af",
      customClass: {
        title: "custom-title-class",
        htmlContainer: "custom-text-class",
      },
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
  },
  confirmRemoveDialog: () => {
    return Swal.fire({
      icon: "question",
      iconColor: "#9ca3af",
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบรายการนี้หรือไม่",
      showCancelButton: true,
      background: "#1f2937",
      color: "#9ca3af",
      customClass: {
        title: "custom-title-class",
        htmlContainer: "custom-text-class",
      },
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
  },
  confirmBanDialog: () => {
    return Swal.fire({
      icon: "question",
      iconColor: "#9ca3af",
      title: "ยืนยันการบังคับการใช้งาน",
      text: "คุณต้องการบังคับการใช้งานรายการนี้หรือไม่",
      showCancelButton: true,
      background: "#1f2937",
      color: "#9ca3af",
      customClass: {
        title: "custom-title-class",
        htmlContainer: "custom-text-class",
      },
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
  },
};

export default config;

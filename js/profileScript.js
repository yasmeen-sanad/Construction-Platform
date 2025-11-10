import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const nameField = document.getElementById("user-name");
  const emailField = document.getElementById("user-email");
  const phoneField = document.getElementById("user-phone");
  const addressField = document.getElementById("user-address");
  const deleteBtn = document.getElementById("deleteAccountBtn");

  // Fetch user info
  try {
    const res = await api.getUser();
    if (!res.success || !res.user) {
      nameField.textContent = "غير مسجل الدخول";
      return;
    }

    const user = res.user;
    nameField.textContent = user.name || "غير محدد";
    emailField.textContent = user.email || "غير محدد";
    phoneField.textContent = user.phone || "غير محدد";
    addressField.textContent = user.address || "غير محدد";
  } catch (error) {
    console.error("خطأ في جلب بيانات المستخدم:", error);
    nameField.textContent = "حدث خطأ أثناء التحميل";
  }

  // Delete account
  deleteBtn.addEventListener("click", async () => {
    const confirmDelete = confirm("هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذه العملية.");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً");
      return;
    }

    try {
const response = await fetch(`${BASE_URL}/api/auth/delete`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        alert("تم حذف الحساب بنجاح 😢");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
      } else {
        alert("حدث خطأ أثناء حذف الحساب ❌");
      }
    } catch (error) {
      console.error("❌ خطأ في حذف الحساب:", error);
      alert("حدث خطأ في الاتصال بالخادم ❌");
    }
  });
});

// --------------------- Product Page Script ---------------------
import { BASE_URL } from './config.js'; // 👈 استيراد BASE_URL

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    console.error("❌ معرف المنتج غير متوفر في الرابط");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/products/${productId}`); // 👈 استخدام BASE_URL
    const data = await res.json();

    if (!data.success || !data.product) {
      console.error("❌ المنتج غير موجود:", data.message);
      return;
    }

    const product = data.product;

    // تحديث البيانات
    document.querySelector(".product-detail h1").textContent = product.name;
    document.querySelector(".product-info .brand").textContent = product.supplier || "غير محدد";
    document.querySelector(".product-info .price").textContent = `${product.price} ريال`;
    document.querySelector(".small-description").textContent = product.description || "لا يوجد وصف متاح.";

    // تحديث الصورة ← هنا التغيير المهم!
    const mainImage = document.getElementById("mainImage");
    if (mainImage) {
      // 👇 لا تستخدم BASE_URL مع الصورة، لأنها مسار محلي للـ Backend
      mainImage.src = product.image.startsWith("http")
        ? product.image
        : `https://construction-platform-backend.onrender.com${product.image}`;
      mainImage.alt = product.name;
    }

  } catch (error) {
    console.error("❌ خطأ أثناء جلب المنتج:", error);
  }
});
window.addEventListener("load", () => {
  const mainImage = document.getElementById("mainImage");
  const firstThumb = document.querySelector(".thumbnail-images img");
  if (mainImage && firstThumb) {
    mainImage.src = firstThumb.src;
    mainImage.alt = firstThumb.alt || "Main Image";
  }
});
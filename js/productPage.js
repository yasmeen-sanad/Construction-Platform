// --------------------- Product Page Script ---------------------
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id"); // 👈 استخدم ID

  if (!productId) {
    console.error("❌ معرف المنتج غير متوفر في الرابط");
    return;
  }

  try {
    // 👇 جلب المنتج باستخدام ID
    const res = await fetch(`${BASE_URL}/api/products/${productId}`);
    const data = await res.json();

    if (!data.success || !data.product) {
      console.error("❌ المنتج غير موجود:", data.message);
      return;
    }

    const product = data.product;

    // تحديث البيانات من قاعدة البيانات
    const title = document.querySelector(".product-detail h1");
    if (title) title.textContent = product.name;

    const brandEl = document.querySelector(".product-info .brand");
    if (brandEl) brandEl.textContent = product.supplier || "غير محدد";

    const priceEl = document.querySelector(".product-info .price");
    if (priceEl) priceEl.textContent = `${product.price} ريال`;

    const descEl = document.querySelector(".small-description");
    if (descEl) descEl.textContent = product.description || "لا يوجد وصف متاح.";

    // تحديث الصورة من قاعدة البيانات
    const mainImage = document.getElementById("mainImage");
    if (mainImage) {
      mainImage.src = product.image.startsWith("http")
        ? product.image
        : `${BASE_URL}${product.image}`;
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
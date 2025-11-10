// --------------------- Product Page Script ---------------------
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const brand = params.get("brand");
  const price = params.get("price");
  const img = decodeURIComponent(params.get("img") || "");

  if (!name) {
    console.error("❌ اسم المنتج غير متوفر في الرابط");
    return;
  }

  // Update main info from URL
  const title = document.querySelector(".product-detail h1");
  if (title) title.textContent = name;

  const mainImage = document.getElementById("mainImage");
  if (mainImage && img) {
mainImage.src = img.startsWith("http") ? img : `${BASE_URL}${img}`;
    mainImage.alt = name;
  }

  const brandEl = document.querySelector(".product-info .brand");
  if (brandEl) brandEl.textContent = brand || "غير محدد";

  const priceEl = document.querySelector(".product-info .price");
  if (priceEl && price) priceEl.textContent = `${price} ريال`;

  // Fetch description from backend
  try {
const res = await fetch(`${BASE_URL}/api/products/${encodeURIComponent(name)}`);
    const data = await res.json();

    if (data.success && data.product) {
      const descEl = document.querySelector(".small-description");
      if (descEl) descEl.textContent = data.product.description || "لا يوجد وصف متاح.";
    } else {
      console.warn("⚠️ لم يتم العثور على المنتج في قاعدة البيانات:", data.message);
    }
  } catch (error) {
    console.error("⚠️ خطأ أثناء جلب وصف المنتج:", error);
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
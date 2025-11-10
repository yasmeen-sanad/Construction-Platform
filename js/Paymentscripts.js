// --------------------- Payment Scripts ---------------------
import { api } from "./api.js"; 
import { BASE_URL } from "./config.js";


document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.querySelector(".cart-item");
  const summarySection = document.getElementById("summary-section");
  const paymentSection = document.getElementById("payment-section");
  const checkoutBtn = document.getElementById("checkout-btn");
  const finalPayBtn = document.getElementById("final-pay-btn");
  const paymentCard = document.querySelector(".card.paymentcard");
  const orderDetails = document.getElementById("order-details");

  // Load cart from localStorage
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  function renderCart() {
    const cartTitle = document.querySelector(".cart-title");

if (!cart || cart.length === 0) {
  // Empty cart message
  const emptyDiv = document.createElement("div");
  emptyDiv.className = "empty-cart";
  emptyDiv.innerHTML = `
    <p>سلتك فارغة 😢</p>
    <button class="back-to-shop" onclick="window.location.href='index.html'">
      تسوق الآن
    </button>
  `;

  cartTitle.style.display = "none";
  cartContainer.style.display = "none";
  summarySection.style.display = "none";

  paymentCard.insertBefore(emptyDiv, summarySection);

  return;
}


    cartTitle.textContent = `سلتك (${cart.length} منتجات)`;
    cartContainer.innerHTML = "";

    // Create product items
cart.forEach((item) => {
  const el = document.createElement("div");
  el.className = "cart-item";

  // Product image
  const imgElem = document.createElement("img");
  imgElem.src = item.img;
  imgElem.alt = item.name;
  imgElem.className = "payment-product-image";
  el.appendChild(imgElem);

  // Info section
  const infoDiv = document.createElement("div");
  infoDiv.className = "payment-product-info";

  const nameH4 = document.createElement("h4");
  nameH4.textContent = item.name; 
  infoDiv.appendChild(nameH4);

  const qtyP = document.createElement("p");
  qtyP.textContent = `الكمية: ${item.quantity}`;
  infoDiv.appendChild(qtyP);

  el.appendChild(infoDiv);

  // Price section
  const priceDiv = document.createElement("div");
  priceDiv.className = "payment-product-price";
  priceDiv.textContent = `${item.price * item.quantity} ريال`;
  el.appendChild(priceDiv);

  // Add to DOM
  cartContainer.parentNode.insertBefore(el, summarySection);
});


    updateSummary();
  }

  // Update total
  function updateSummary() {
    const subtotal = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
    document.querySelector("#summary-section .summary-row span:last-child").textContent = `${subtotal} ريال`;
    document.querySelector("#summary-section .total span:last-child").textContent = `${subtotal} ريال`;
  }

  // Proceed to payment options
  if (checkoutBtn && summarySection && paymentSection) {
    checkoutBtn.addEventListener("click", () => {
      summarySection.style.display = "none";
      paymentSection.style.display = "flex";
    });
  }

  // Confirm payment 
  if (finalPayBtn && paymentCard && orderDetails) {
    finalPayBtn.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("يرجى تسجيل الدخول أولاً قبل إتمام الدفع");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

      // Prepare order data
      const order = {
        products: cart.map((p) => ({
          name: p.name,
          price: p.price,
          quantity: p.quantity,
        })),
        totalAmount: total,
        shippingAddress: user?.address || "غير محدد",
        phone: user?.phone || "غير محدد",
        paymentMethod: "cash",
      };

      try {
const response = await fetch(`${BASE_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(order),
        });

        const data = await response.json();

if (data.success) {
  console.log("✅ Order saved:", data);
  alert("تم إنشاء الطلب بنجاح ✅");

  // Save order and user info
  const order = data.order;
  const user = order.user || JSON.parse(localStorage.getItem("user"));

  const orderIdElem = orderDetails.querySelector(".details-summary-row:nth-of-type(1) span:last-child");
  const nameElem = orderDetails.querySelector(".details-summary-row:nth-of-type(2) span:last-child");
  const addressElem = orderDetails.querySelector(".details-summary-row:nth-of-type(3) span:last-child");
  const phoneElem = orderDetails.querySelector(".details-summary-row:nth-of-type(5) span:last-child");

  if (orderIdElem) orderIdElem.textContent = "#" + (order._id || Math.floor(Math.random() * 1000000));
  if (nameElem) nameElem.textContent = user?.name || "غير محدد";
  if (addressElem) addressElem.textContent = user?.address || order.shippingAddress || "غير محدد";
  if (phoneElem) phoneElem.textContent = user?.phone || order.phone || "غير محدد";

  paymentCard.replaceWith(orderDetails);
  orderDetails.style.display = "flex";

  // Clear the cart
  localStorage.removeItem("cart");
} else {
  console.error("❌ Order creation failed:", data.message);
  alert("حدث خطأ أثناء إنشاء الطلب ❌");
}

      } catch (error) {
        console.error("⚠️ Server error:", error);
        alert("حدث خطأ في الاتصال بالخادم ❌");
      }
    });
  }
  renderCart();
});

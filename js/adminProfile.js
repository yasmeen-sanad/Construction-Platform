import { api } from "./api.js";
import { BASE_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  // --------------------- Profile Info ---------------------
  const nameField = document.getElementById("admin-name");
  const emailField = document.getElementById("admin-email");
  const phoneField = document.getElementById("admin-phone");
  const addressField = document.getElementById("admin-address");
  const companyField = document.getElementById("admin-company");
  const commercialField = document.getElementById("admin-commercial");
  const deleteBtn = document.getElementById("deleteAccountBtn");

  // --------------------- Dashboard KPI Elements ---------------------
  const userCountEl = document.querySelector(".kpi-card:nth-child(1) .kpi-number");
  const revenueEl = document.querySelector(".kpi-card:nth-child(2) .kpi-number");
  const ordersEl = document.querySelector(".kpi-card:nth-child(3) .kpi-number");
  const stockEl = document.querySelector(".kpi-card:nth-child(4) .kpi-number");
  const ordersTableBody = document.querySelector(".orders-table tbody");

  // --------------------- Orders Section ---------------------
  const ordersContainer = document.querySelector("#orders-section .dynamic-row");

  // ======================= Fetch Admin Info =======================
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
    companyField.textContent = user.companyName || "غير محدد";
    commercialField.textContent = user.commercialFile || "غير محدد";
  } catch (error) {
    console.error("⚠️ خطأ في جلب بيانات المستخدم:", error);
    nameField.textContent = "حدث خطأ أثناء التحميل";
  }

  // ======================= Fetch Admin Statistics =======================
  try {
    const res = await api.getAdminStats();
    if (!res.success) {
      console.error("❌ فشل في جلب الإحصائيات:", res.message);
      return;
    }

    const stats = res.stats;

    // Update KPI Cards
    userCountEl.textContent = stats.totalUsers;
    ordersEl.textContent = stats.totalOrders;
    stockEl.textContent = stats.totalProducts;
    revenueEl.textContent = `${stats.totalRevenue.toLocaleString()} ريال`;

    // Update Recent Orders Table
    ordersTableBody.innerHTML = "";
    stats.recentOrders.forEach((order) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>#${order._id.slice(-5)}</td>
        <td>${order.user?.name || "غير معروف"}</td>
        <td><span class="status ${order.status || "processing"}">${translateStatus(order.status)}</span></td>
        <td><button class="details-btn">عرض</button></td>
      `;
      ordersTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("⚠️ خطأ أثناء تحميل الإحصائيات:", error);
  }
// =======================  Load Top 5 Best-Selling Products =======================
const topProductsTable = document.querySelector(".sales-table tbody");

if (topProductsTable) {
  try {
    const res = await api.getTopProducts();
    if (!res.success || !res.products.length) {
      topProductsTable.innerHTML = `
        <tr><td colspan="3" style="text-align:center;">لا توجد بيانات مبيعات حالياً.</td></tr>
      `;
    } else {
      topProductsTable.innerHTML = "";
      res.products.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.sold || 0} عملية بيع</td>
          <td><span class="status ${product.stock > 0 ? 'available' : 'out-of-stock'}">
            ${product.stock > 0 ? 'متاح' : 'غير متوفر'}
          </span></td>
        `;
        topProductsTable.appendChild(row);
      });
    }
  } catch (error) {
    console.error("⚠️ خطأ أثناء تحميل أفضل المنتجات:", error);
    topProductsTable.innerHTML = `
      <tr><td colspan="3" style="color:red;text-align:center;">تعذر تحميل أفضل المنتجات</td></tr>
    `;
  }
}

  // ======================= Fetch and Display User Orders =======================
  if (ordersContainer) {
    try {
      const res = await api.getAllOrders();
      if (!res.success || !res.orders.length) {
        ordersContainer.innerHTML = "<p style='text-align:center'>لا توجد طلبات حالياً.</p>";
      } else {
        ordersContainer.innerHTML = ""; 

        res.orders.forEach((order) => {
          const box = document.createElement("div");
          box.className = "order-box";
          box.innerHTML = `
            <p>رقم الطلب: #${order._id.slice(-5)}</p>
            <p>الإجمالي: ${order.totalAmount} ريال</p>
            <p>الحالة: <span class="status ${order.status}">${translateStatus(order.status)}</span></p>
            <div class="order-buttons">
              <button class="details-btn">عرض</button>
            </div>
          `;
          ordersContainer.appendChild(box);
        });
      }
    } catch (error) {
      console.error("❌ خطأ أثناء تحميل الطلبات:", error);
      ordersContainer.innerHTML = "<p style='text-align:center;color:red'>تعذر تحميل الطلبات</p>";
    }
  }

  // translate status to Arabic
  function translateStatus(status) {
    const map = {
      pending: "قيد الانتظار",
      confirmed: "تم التأكيد",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };
    return map[status] || "غير محدد";
  }

  // ======================= Delete Account =======================
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
        headers: { Authorization: `Bearer ${token}` },
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

// ======================= Fetch and Display All Products =======================
const productsTableBody = document.querySelector(".products-table tbody");

if (productsTableBody) {
  try {
    const res = await api.getProducts();

    if (!res.success || !res.products.length) {
      productsTableBody.innerHTML = `
        <tr><td colspan="5" style="text-align:center;">لا توجد منتجات حالياً.</td></tr>
      `;
    } else {
      productsTableBody.innerHTML = "";

      res.products.forEach((product) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.price} ريال</td>
          <td>${product.stock}</td>
          <td>
            <button class="status-btn ${product.stock > 0 ? 'available' : 'out-of-stock'}">
              ${product.stock > 0 ? 'متاح' : 'غير متوفر'}
            </button>
          </td>
          <td>
            <button class="edit-btn-table">Edit</button>
            <button class="delete-btn-table" data-id="${product._id}">Delete</button>
          </td>
        `;
        productsTableBody.appendChild(row);
      });

      document.querySelectorAll(".delete-btn-table").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.closest("button").dataset.id;
          const confirmDelete = confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟");
          if (!confirmDelete) return;

          try {
            const result = await api.deleteProduct(id);
            if (result.success) {
              alert("✅ تم حذف المنتج بنجاح!");
              e.target.closest("tr").remove();
            } else {
              alert("❌ فشل في حذف المنتج: " + (result.message || "حدث خطأ"));
            }
          } catch (error) {
            console.error("❌ خطأ أثناء حذف المنتج:", error);
            alert("حدث خطأ في الاتصال بالخادم ❌");
          }
        });
      });

      const addRow = document.createElement("tr");
      addRow.className = "add-new-row";
      addRow.innerHTML = `
        <td colspan="5">
          <button class="add-new-btn">إضافة منتج جديد</button>
        </td>
      `;
      productsTableBody.appendChild(addRow);
    }
  } catch (error) {
    console.error("⚠️ خطأ في تحميل المنتجات:", error);
    productsTableBody.innerHTML = `
      <tr><td colspan="5" style="color:red;text-align:center;">تعذر تحميل المنتجات</td></tr>
    `;
  }
}


// ======================= Load Factories =======================
const factoriesContainer = document.querySelector("#factories-section .dynamic-row");

if (factoriesContainer) {
  try {
    const res = await api.getFactories();
    if (!res.success || !res.factories.length) {
      factoriesContainer.innerHTML = "<p style='text-align:center;'>لا توجد مصانع حالياً.</p>";
    } else {
      factoriesContainer.innerHTML = "";
      res.factories.forEach(factory => {
        const div = document.createElement("div");
        div.className = "factory-box-dynamic";
        div.innerHTML = `
          <img src="${factory.image}" alt="${factory.name}" class="factory-image">
          <p class="factory-title-dynamic">${factory.name}</p>
          <p class="factory-location-dynamic">${factory.location}</p>
          <p class="factory-products-dynamic">عدد المنتجات: ${factory.productsCount}</p>
          <div class="factory-buttons">
            <button class="details-btn">Details</button>
            <button class="edit-btn">Edit</button>
          </div>
        `;
        factoriesContainer.appendChild(div);
      });
    }
  } catch (error) {
    console.error("⚠️ خطأ في تحميل المصانع:", error);
    factoriesContainer.innerHTML = "<p style='text-align:center;color:red;'>تعذر تحميل المصانع</p>";
  }
}

// =======================  Add Product Modal =======================
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-new-btn")) {
    const modal = document.getElementById("addProductModal");
    modal.style.display = "flex";
    document.body.classList.add("modal-open"); 
  }
});

document.getElementById("cancelAddProduct").addEventListener("click", () => {
  const modal = document.getElementById("addProductModal");
  modal.style.display = "none";
  document.body.classList.remove("modal-open");
});

document.getElementById("addProductModal").addEventListener("click", (e) => {
  if (e.target.id === "addProductModal") {
    e.currentTarget.style.display = "none";
    document.body.classList.remove("modal-open");
  }
});

//  Product Form Submission
document.getElementById("addProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("productName").value);
  formData.append("description", document.getElementById("productDescription").value);
  formData.append("price", Number(document.getElementById("productPrice").value));
  formData.append("stock", Number(document.getElementById("productStock").value));
  formData.append("unit", document.getElementById("productUnit").value);
  formData.append("category", document.getElementById("productCategory").value);
  formData.append("supplier", document.getElementById("productSupplier").value);

  const imageFile = document.getElementById("productImage").files[0];
  if (imageFile) formData.append("image", imageFile);

  const token = localStorage.getItem("token");

  try {
const response = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ تم إضافة المنتج بنجاح!");
      document.getElementById("addProductModal").style.display = "none";
      document.body.classList.remove("modal-open");
      window.location.reload();
    } else {
      alert("❌ فشل في إضافة المنتج: " + (data.message || "حدث خطأ غير متوقع"));
    }
  } catch (err) {
    console.error("خطأ أثناء إضافة المنتج:", err);
    alert("❌ حدث خطأ في الاتصال بالخادم");
  }
});

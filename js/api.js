
import { BASE_URL } from "./config.js";

export const api = {
  // ---------------- Register ----------------
  async register(userData) {
    // Use FormData to handle both text fields and files
    const formData = new FormData();
    for (const key in userData) {
      if (userData[key] !== undefined) {
        if (userData[key] instanceof File) {
          formData.append(key, userData[key]);
        } else {
          formData.append(key, userData[key]);
        }
      }
    }

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: formData, 
    });

    const data = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  // ---------------- Login ----------------
  async login(credentials) {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  // ---------------- Products ----------------
  async getProducts() {
    const response = await fetch(`${BASE_URL}/api/products`);
    return await response.json();
  },

  // ---------------- Create Order ----------------
  async createOrder(orderData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return await response.json();
  },
  // ---------------- Get User Info ----------------
  async getUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return await response.json();
  },
    // ---------------- Admin Statistics ----------------
  async getAdminStats() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return await response.json();
  },
    // ---------------- Get My Orders ----------------
  async getMyOrders() {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, orders: [] };

    const response = await fetch(`${BASE_URL}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return await response.json();
  },
    // ---------------- Get All Orders (Admin Only) ----------------
  async getAllOrders() {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, orders: [] };

    const response = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return await response.json();
  },
      // ---------------- Get All factories (Admin Only) ----------------

async getFactories() {
  const response = await fetch(`${BASE_URL}/api/factories`);
  return await response.json();
},

  // ---------------- Add New Product (Admin Only) ----------------
async addProduct(productData) {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  for (const key in productData) {
    if (productData[key] !== undefined && productData[key] !== null) {
      // Convert price and stock to numbers
      if (key === "price" || key === "stock") {
        formData.append(key, Number(productData[key]));
      } else {
        formData.append(key, productData[key]);
      }
    }
  }

  const response = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // multer handles it on backend
  });

  return await response.json();
},

// ---------------- Delete Product (Admin Only) ----------------
async deleteProduct(productId) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
},

// ---------------- Get Top 5 Best-Selling Products ----------------
async getTopProducts() {
  const response = await fetch(`${BASE_URL}/api/products/top`);
  return await response.json();
}

};

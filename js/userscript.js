import { api } from './api.js';
import { BASE_URL } from "./config.js";

function getImagePath(imagePath) {
  if (!imagePath) return "images/placeholder.png"; 
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/uploads/") || imagePath.startsWith("uploads/")) {
    return `${BASE_URL}${imagePath.replace(/^\/?/, "/")}`;
  }
  if (imagePath.startsWith("/images/") || imagePath.startsWith("images/")) {
    return imagePath.replace(/^\//, ""); 
  }
  return `images/${imagePath}`;
}

// --------------------- showLogoutOverlay Scripts ---------------------

function showLogoutOverlay() {
  let overlay = document.getElementById('logoutOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'logoutOverlay';
    overlay.innerHTML = `
      <div class="logoutBox">
        <p>هل أنت متأكد أنك تريد تسجيل الخروج؟</p>
        <div class="logoutButtons">
          <button id="confirmLogout">تسجيل الخروج</button>
          <button id="cancelLogout">إلغاء</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirmLogout').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem("user");
      localStorage.removeItem('cart');
      window.location.href = 'index.html';
    });
    document.getElementById('cancelLogout').addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }
  overlay.style.display = 'flex';
}

// --------------------- showLoginOverlay Scripts ---------------------

export function showLoginOverlay() {
  const overlay = document.getElementById("loginOverlay");
  if (!overlay) return; 
  overlay.style.display = "flex"; 
  const loginBtn = document.getElementById("loginOverlayBtn"); 
  const cancelBtn = document.getElementById("cancelLogin"); 
  if (loginBtn) { 
    loginBtn.onclick = () => { 
      overlay.style.display = "none"; 
      window.location.href = "login.html"; 
    }; 
  }
  if (cancelBtn) { 
    cancelBtn.onclick = () => { overlay.style.display = "none"; }; 
  } 
}

// --------------------- Homepage Scripts ---------------------

document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('.dropdown');
  const sortOptions = document.querySelectorAll('.sort-option');
  dropdowns.forEach(drop => {
    const btn = drop.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      drop.classList.toggle('active');
      dropdowns.forEach(other => {
        if (other !== drop) other.classList.remove('active');
      });
    });
  });
  document.addEventListener('click', () => {
    dropdowns.forEach(d => d.classList.remove('active'));
  });
  sortOptions.forEach(option => {
    option.addEventListener('click', () => {
      const grid = document.querySelector('.products-grid');
      if (!grid) return;
      const cards = Array.from(grid.children);
      const sortType = option.dataset.sort;
      cards.sort((a, b) => {
        const priceA = parseInt(a.querySelector('p:last-of-type').textContent.replace(/\D/g, ''));
        const priceB = parseInt(b.querySelector('p:last-of-type').textContent.replace(/\D/g, ''));
        return sortType === 'asc' ? priceA - priceB : priceB - priceA;
      });
      grid.innerHTML = '';
      cards.forEach(card => grid.appendChild(card));
    });
  });
});

// --------------------- Filtering + Searching ---------------------

function filterProducts() {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  const cards = Array.from(grid.children);
  const selectedBrands = Array.from(document.querySelectorAll('.brand-filter')).filter(f => f.checked).map(f => f.value);
  const selectedCategories = Array.from(document.querySelectorAll('.category-filter')).filter(f => f.checked).map(f => f.value);
  const searchInput = document.querySelector('.search-box input');
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let visibleCount = 0;
  cards.forEach(card => {
    const brand = card.querySelector('.homebrand')?.textContent.trim() || '';
    const name = card.querySelector('h3')?.textContent.trim() || '';
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(cat => name.includes(cat));
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(brand);
    const searchMatch = searchTerm === '' || name.toLowerCase().includes(searchTerm) || brand.toLowerCase().includes(searchTerm);
    const isVisible = brandMatch && categoryMatch && searchMatch;
    card.style.display = isVisible ? '' : 'none';
    if (isVisible) visibleCount++;
  });
  const gridParent = document.querySelector('.section-products');
  if (gridParent) {
    let msg = gridParent.querySelector('.no-results-msg');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'no-results-msg';
      msg.style.textAlign = 'center';
      msg.style.color = '#888';
      msg.style.marginTop = '10px';
      gridParent.appendChild(msg);
    }
    msg.textContent = visibleCount === 0 ? 'لا توجد منتجات مطابقة لبحثك.' : '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const brandFilters = document.querySelectorAll('.brand-filter');
  const categoryFilters = document.querySelectorAll('.category-filter');
  const searchInput = document.querySelector('.search-box input');
  brandFilters.forEach(f => f.addEventListener('change', filterProducts));
  categoryFilters.forEach(f => f.addEventListener('change', filterProducts));
  if (searchInput) searchInput.addEventListener('input', filterProducts);
  const grid = document.querySelector('.products-grid');
  if (grid) {
    const observer = new MutationObserver(filterProducts);
    observer.observe(grid, { childList: true });
  }
});

// --------------------- sidebar Scripts ---------------------

const toggleBtn = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('expanded');
});

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  const brand = params.get('brand');
  const price = params.get('price');
  const img = params.get('img');
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail-images img');
  const dots = document.querySelectorAll('.dot');
  if (mainImage && img) {
    mainImage.src = img;
    if (thumbnails[0]) thumbnails[0].src = img;
  }
  if (name) {
    const title = document.querySelector('.product-title');
    if (title) title.textContent = name;
  }
  if (brand) {
    const brandElem = document.querySelector('.product-info .brand');
    if (brandElem) brandElem.textContent = brand;
  }
  if (price) {
    const priceElem = document.querySelector('.product-info .price');
    if (priceElem) priceElem.textContent = price + ' ريال';
  }
  window.changeImage = function(index) {
    if (!mainImage || !thumbnails[index]) return;
    mainImage.src = thumbnails[index].src;
    thumbnails.forEach(t => t.classList.remove('active'));
    thumbnails[index].classList.add('active');
    dots.forEach(d => d.classList.remove('active'));
    dots[index].classList.add('active');
  };
  if (thumbnails[0]) thumbnails[0].classList.add('active');
  if (dots[0]) dots[0].classList.add('active');
  const addToCartBtn = document.querySelector('.product-actions button');
  const successOverlay = document.getElementById('successOverlay');
  if (addToCartBtn && successOverlay) {
    addToCartBtn.addEventListener('click', () => {
      successOverlay.style.display = 'flex';
      setTimeout(() => { successOverlay.style.display = 'none'; }, 2000);
    });
  }
});

// --------------------- factories Scripts ---------------------
if (document.body.classList.contains("factories-bg")) {
  const urlParams = new URLSearchParams(window.location.search);
  const factoryName = urlParams.get('name');
  const factoryImg = urlParams.get('img');
  if(factoryName) document.getElementById('factory-name').textContent = factoryName;
  if(factoryImg) document.getElementById('factory-img').src = factoryImg;
  const factoryTabs = document.querySelectorAll('.factory-tab');
  const factoryContents = {
    info: document.getElementById('info-content'),
    brands: document.getElementById('brands-content'),
    products: document.getElementById('products-content')
  };
  factoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      factoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      Object.values(factoryContents).forEach(c => c.style.display = 'none');
      const tabName = tab.getAttribute('data-tab');
      factoryContents[tabName].style.display = 'block';
    });
  });
}

// --------------------- Offers slider Scripts --------------------- 
if (document.body.classList.contains("buyer-bg")) {
  const slides = document.querySelectorAll('.slide');
  const dots = Array.from(document.querySelectorAll('.slider-dot')).reverse();
  let index = 0, slideInterval;
  function showSlide(i) {
    slides.forEach((s,n)=>s.classList.toggle('active',n===i));
    dots.forEach((d,n)=>d.classList.toggle('active',n===i));
  }
  function nextSlide() { index = (index+1)%slides.length; showSlide(index); }
  function prevSlide() { index = (index-1+slides.length)%slides.length; showSlide(index); }
  function startAutoSlide() { slideInterval = setInterval(nextSlide,3000); }
  function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }
  document.querySelector('.slider-next').onclick = ()=>{nextSlide(); resetAutoSlide();};
  document.querySelector('.slider-prev').onclick = ()=>{prevSlide(); resetAutoSlide();};
  dots.forEach((dot,i)=>{dot.onclick = ()=>{index=i; showSlide(index); resetAutoSlide();};});
  showSlide(index);
  startAutoSlide();
}

// --------------------- footer Scripts ---------------------
document.querySelectorAll('.footer-column:not(.newsletter-column) h4').forEach(header => {
  header.addEventListener('click', () => {
    const parent = header.parentElement;
    parent.classList.toggle('active');
  });
});

// --------------------- media screen filter Scripts ---------------------
function toggleFilter() {
  const filterPanel = document.querySelector('.products-filter-panel');
  const toggleBtn = document.querySelector('.filter-toggle-btn');
  if (filterPanel.style.display === 'block') {
    filterPanel.style.display = 'none';
    toggleBtn.textContent = 'فلتر المنتجات';
  } else {
    filterPanel.style.display = 'block';
    toggleBtn.textContent = 'إغلاق الفلتر';
  }
}

// --------------------- Global Login State ---------------------
function initLoginState() {
  const loginBtn = document.getElementById("loginBtn");
  const userIcon = document.getElementById("userIcon");
  const profileSidebar = document.getElementById("profileSidebar");
  if (!loginBtn || !userIcon) { setTimeout(initLoginState, 200); return; }
  const span = loginBtn.querySelector("span");
  if (!span) { setTimeout(initLoginState, 200); return; }
  const token = localStorage.getItem("token");
  function resetUI() {
    loginBtn.href = "login.html";
    span.textContent = "تسجيل الدخول";
    userIcon.classList.remove("fa-right-from-bracket");
    userIcon.classList.add("fa-user");
    if (profileSidebar) profileSidebar.style.display = "none";
  }
  if (!token) { resetUI(); return; }
  api.getUser().then((res) => {
    if (res && res.success && res.user) {
      localStorage.setItem("user", JSON.stringify(res.user));
      loginBtn.href = "#";
      span.textContent = "تسجيل الخروج";
      userIcon.classList.remove("fa-user");
      userIcon.classList.add("fa-right-from-bracket");
      if (profileSidebar) profileSidebar.style.display = "flex";
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        showLogoutOverlay();
      });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      resetUI();
    }
  }).catch(() => { resetUI(); });
}
window.addEventListener("load", () => { setTimeout(initLoginState, 300); });

// --------------------- Load products from API ---------------------
document.addEventListener("DOMContentLoaded", async () => {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;
  try {
    const res = await api.getProducts();
    if (!res.success || !res.products) {
      productsGrid.innerHTML = "<p>لا توجد منتجات متاحة حاليا.</p>";
      return;
    }
    productsGrid.innerHTML = "";
    res.products.forEach(product => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <div class="product-image-wrapper">
          <a href="product.html?id=${product._id}&name=${encodeURIComponent(product.name)}&brand=${encodeURIComponent(product.supplier)}&price=${product.price}&img=${encodeURIComponent(product.image)}">
          <img src="${getImagePath(product.image)}" alt="${product.name}">
          </a>
          <button class="card-wishlist-btn"><i class="fa-regular fa-heart"></i></button>
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="homebrand">${product.supplier || "غير محدد"}</p>
          <p class="homeprice">${product.price} ريال</p>
          <button class="card-add-cart-btn">أضف إلى السلة</button>
        </div>`;
      productsGrid.appendChild(card);
    });
  } catch {
    productsGrid.innerHTML = "<p>حدث خطأ أثناء تحميل المنتجات.</p>";
  }
});

// --------------------- Homepage Add-to-Cart ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;
  productsGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("card-add-cart-btn")) {
      const card = e.target.closest(".product-card");
      if (!ensureLoggedIn()) return;
      const product = {
        name: card.querySelector("h3").textContent.trim(),
        brand: card.querySelector(".homebrand").textContent.trim(),
        price: parseFloat(card.querySelector(".homeprice").textContent.replace(/\D/g, "")),
        img: card.querySelector("img").src,
        quantity: 1,
      };
      addToCart(product);
      const successOverlay = document.getElementById("successOverlay");
      if (successOverlay) {
        successOverlay.style.display = "flex";
        setTimeout(() => (successOverlay.style.display = "none"), 2000);
      }
    }
  });
});

// --------------------- Cart Management ---------------------
function updateCartCount() {
  const cartCountElem = document.getElementById("cartCount");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (cartCountElem) {
    const total = cart.reduce((sum, p) => sum + (p.quantity || 1), 0);
    cartCountElem.textContent = total;
  }
}
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find(p => p.name === product.name);
  if (existing) existing.quantity += product.quantity;
  else cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}
function ensureLoggedIn() {
  const token = localStorage.getItem("token");
  if (!token) {
    const overlay = document.getElementById("loginOverlay");
    if (overlay) overlay.style.display = "flex";
    return false;
  }
  return true;
}
window.addEventListener("load", updateCartCount);

// --------------------- Product Page Add-to-Cart ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const addToCartBtn = document.querySelector(".product-actions button");
  const successOverlay = document.getElementById("successOverlay");
  if (!addToCartBtn) return;
  addToCartBtn.addEventListener("click", () => {
    if (!ensureLoggedIn()) return;
    const name = document.querySelector(".product-detail h1")?.textContent.trim() || "منتج";
    const brand = document.querySelector(".product-info .brand")?.textContent.trim() || "غير محدد";
    const price = parseFloat(document.querySelector(".price")?.textContent.replace(/\D/g, "") || 0);
    const img = document.getElementById("mainImage")?.src || "";
    const quantity = parseInt(document.querySelector(".product-actions input")?.value || 1);
    const product = { name, brand, price, img, quantity };
    addToCart(product);
    if (successOverlay) {
      successOverlay.style.display = "flex";
      setTimeout(() => (successOverlay.style.display = "none"), 2000);
    }
  });
});

// --------------------- Factory Details - Load Products by Brand ---------------------
document.addEventListener("DOMContentLoaded", async () => {
  if (!document.querySelector(".factory-products-grid")) return;
  const urlParams = new URLSearchParams(window.location.search);
  const factoryName = urlParams.get("name");
  const productsGrid = document.querySelector(".factory-products-grid");
  if (!factoryName || !productsGrid) return;
  try {
    const res = await api.getProducts();
    if (!res.success || !res.products) {
      productsGrid.innerHTML = "<p>⚠️ لا توجد منتجات متاحة حاليًا.</p>";
      return;
    }
    const factoryProducts = res.products.filter(
      p => p.supplier && p.supplier.trim() === decodeURIComponent(factoryName).trim()
    );
    if (factoryProducts.length === 0) {
      productsGrid.innerHTML = `<p>لا توجد منتجات حالياً من المصنع <strong>${decodeURIComponent(factoryName)}</strong>.</p>`;
      return;
    }
    productsGrid.innerHTML = "";
    factoryProducts.forEach(product => {
      const card = document.createElement("div");
      card.classList.add("factory-product-box");
      card.innerHTML = `
        <img src="${getImagePath(product.image)}" alt="${product.name}">
        <div class="factory-product-info">
          <p class="factory-product-title">${product.name}</p>
          <p class="factory-product-price">${product.price} ريال</p>
        </div>`;
      productsGrid.appendChild(card);
    });
  } catch {
    productsGrid.innerHTML = "<p>حدث خطأ أثناء تحميل المنتجات.</p>";
  }
});

// ======================= Load Factories from Backend =======================
document.addEventListener("DOMContentLoaded", async () => {
  if (!document.body.classList.contains("factories-bg")) return;
  const container = document.querySelector(".factories-container");
  if (!container) return;
  try {
    const res = await api.getFactories();
    if (!res.success || !res.factories.length) {
      container.innerHTML = "<p style='text-align:center;'>لا توجد مصانع حالياً.</p>";
      return;
    }
    container.innerHTML = "";
res.factories.forEach(factory => {
  const box = document.createElement("div");
  box.className = "factory-box";

  const img = document.createElement("img");
  img.src = getImagePath(factory.image);
  img.alt = factory.name;
  box.appendChild(img);

  const loc = document.createElement("p");
  loc.className = "location";
  const icon = document.createElement("i");
  icon.className = "fa fa-location-dot";
  loc.appendChild(icon);
  const locationText = document.createTextNode(` ${factory.location || "غير محدد"}`);
  loc.appendChild(locationText);
  box.appendChild(loc);

  const btn = document.createElement("button");
  btn.className = "details-btn";
  btn.textContent = "المزيد من التفاصيل";
  btn.addEventListener("click", () => {
    window.location.href = `factory-details.html?name=${encodeURIComponent(factory.name)}&img=${encodeURIComponent(factory.image)}`;
  });
  box.appendChild(btn);

  container.appendChild(box);
});

  } catch {
    container.innerHTML = "<p style='text-align:center;color:red;'>تعذر تحميل المصانع</p>";
  }
});

// ======================= Shipping Page – Search & Filter =======================
document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("shipping-bg")) return;

  const cardSearchInput = document.querySelector(".shipping-search input");
  const locationSearchInput = document.querySelector(".filter-search input");
  const filterCheckboxes = document.querySelectorAll(".filter-list input[type='checkbox']");
  const cards = document.querySelectorAll(".shipping-card");
  const cardsContainer = document.querySelector(".shipping-cards");

  function filterCards() {
    const searchText = cardSearchInput.value.trim().toLowerCase();
    const selectedLocations = Array.from(filterCheckboxes)
      .filter(ch => ch.checked)
      .map(ch => ch.parentElement.textContent.trim().toLowerCase());

    let visibleCount = 0;

    cards.forEach(card => {
      const name = card.querySelector("h4").textContent.toLowerCase();
      const city = card.querySelector("p").textContent.toLowerCase();
      const matchesSearch = name.includes(searchText) || city.includes(searchText);
      const matchesLocation =
        selectedLocations.length === 0 ||
        selectedLocations.some(loc => city.includes(loc));

      const isVisible = matchesSearch && matchesLocation;
      card.style.display = isVisible ? "block" : "none";
      if (isVisible) visibleCount++;
    });

    let msg = document.querySelector(".no-results");
    if (!msg) {
      msg = document.createElement("p");
      msg.className = "no-results";
      msg.textContent = "لا توجد نتائج مطابقة.";
      msg.style.textAlign = "center";
      msg.style.color = "#888";
      msg.style.fontSize = "16px";
      msg.style.marginTop = "40px";
      cardsContainer.appendChild(msg);
    }
    msg.style.display = visibleCount === 0 ? "block" : "none";
  }

  if (cardSearchInput) {
    cardSearchInput.addEventListener("input", filterCards);
  }

  filterCheckboxes.forEach(ch => ch.addEventListener("change", filterCards));

  if (locationSearchInput) {
    locationSearchInput.addEventListener("input", () => {
      const text = locationSearchInput.value.trim().toLowerCase();
      document.querySelectorAll(".filter-list li").forEach(li => {
        const label = li.textContent.toLowerCase();
        li.style.display = label.includes(text) ? "block" : "none";
      });
    });
  }
});
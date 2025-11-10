document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleSidebar');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
  });

  const sidebarIcons = document.querySelectorAll('.sidebar-icon');
  const sections = {
    'الرئيسية': document.getElementById('home-section'),
    'المنتجات': document.getElementById('products-section'),
    'الطلبات': document.getElementById('orders-section'),
    'المصانع': document.getElementById('factories-section'),
    'الإعدادات': document.getElementById('settings-section')
  };

  sidebarIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      const text = icon.querySelector('.sidebar-text').textContent.trim();

      Object.values(sections).forEach(s => s.style.display = 'none');
      if (sections[text]) sections[text].style.display = 'block';
    });
  });
});

// --------------------- extract to excel Scripts ---------------------
document.querySelector('.export-btn').addEventListener('click', function(e) {
  e.stopPropagation(); 
  document.querySelector('.export-options').classList.toggle('show');
});

window.addEventListener('click', function(e) {
  if (!e.target.closest('.export-dropdown')) {
    document.querySelector('.export-options').classList.remove('show');
  }
});

function exportFile(type) {
  alert('تصدير ' + type); 
  document.querySelector('.export-options').classList.remove('show');
}

// --------------------- footer Scripts ---------------------

document.querySelectorAll('.footer-column:not(.newsletter-column) h4').forEach(header => {
  header.addEventListener('click', () => {
    const parent = header.parentElement;
    parent.classList.toggle('active');
  });
});

// --------------------- logoutOverlay Scripts ---------------------

function showLogoutOverlay() {
  document.getElementById('logoutOverlay').style.display = 'flex';
}

document.getElementById('confirmLogout').addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.getElementById('cancelLogout').addEventListener('click', () => {
  document.getElementById('logoutOverlay').style.display = 'none';
});

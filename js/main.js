/* === HH3DTQ - Main JavaScript === */

document.addEventListener('DOMContentLoaded', function() {
  // Login modal
  initLoginModal();
  // User dropdown
  initUserDropdown();
  // Schedule tabs
  initScheduleTabs();
  // Mobile menu toggle
  initMobileMenu();
  // Genre dropdown hover
  initGenreDropdown();
});

/* === Login Modal === */
function initLoginModal() {
  var overlay = document.getElementById('loginModal');
  var btnLogin = document.getElementById('btnLogin');
  var btnClose = document.getElementById('modalClose');
  var btnRegister = document.getElementById('btnRegister');

  if (btnLogin && overlay) {
    btnLogin.addEventListener('click', function(e) {
      e.preventDefault();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (btnClose && overlay) {
    btnClose.addEventListener('click', function() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* === User Dropdown === */
function initUserDropdown() {
  var dropdown = document.querySelector('.user-dropdown');
  var toggle = document.querySelector('.user-dropdown-toggle');

  if (toggle && dropdown) {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', function() {
      dropdown.classList.remove('active');
    });
  }
}

/* === Schedule Tabs === */
function initScheduleTabs() {
  var tabs = document.querySelectorAll('.schedule-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      // In a real app, this would filter content by day
      var day = this.getAttribute('data-day');
      filterByDay(day);
    });
  });
}

function filterByDay(day) {
  var cards = document.querySelectorAll('.episode-card');
  if (!day) {
    cards.forEach(function(c) { c.style.display = ''; });
    return;
  }
  // Simulated filter - in production, this would match against data attributes
  cards.forEach(function(c, i) {
    c.style.display = (i % 7 === parseInt(day)) ? '' : 'none';
  });
}

/* === Mobile Menu === */
function initMobileMenu() {
  // Simple mobile detection - adjust nav for small screens
  var nav = document.querySelector('.nav-list');
  if (!nav) return;

  // On mobile, make genre dropdown click-based instead of hover
  var genreLi = document.querySelector('.nav-list li.has-dropdown');
  if (genreLi) {
    var genreLink = genreLi.querySelector('a');
    var dropdown = genreLi.querySelector('.genre-dropdown');
    if (genreLink && dropdown) {
      genreLink.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
      });
    }
  }
}

/* === Genre Dropdown === */
function initGenreDropdown() {
  // Handled by CSS hover on desktop, JS click on mobile
  // initMobileMenu handles the mobile click case
}

/* === Bookmark toggle === */
function toggleBookmark(el) {
  if (el.classList.contains('bookmarked')) {
    el.classList.remove('bookmarked');
    el.innerHTML = '☆';
    el.title = 'Thêm vào bookmark';
  } else {
    el.classList.add('bookmarked');
    el.innerHTML = '★';
    el.title = 'Đã bookmark';
  }
}

/* === Simulated login (demo only) === */
function handleLogin(event) {
  event.preventDefault();
  var username = document.getElementById('loginUsername');
  var password = document.getElementById('loginPassword');

  if (username && password && username.value && password.value) {
    // Simulated login success
    var overlay = document.getElementById('loginModal');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    showLoggedInState();
  }
  return false;
}

function showLoggedInState() {
  var actions = document.querySelector('.header-actions');
  if (!actions) return;
  actions.innerHTML = `
    <a href="javascript:void(0)">Lịch sử</a>
    <a href="javascript:void(0)">Bookmark</a>
    <div class="user-dropdown">
      <span class="user-dropdown-toggle">👤 Tài khoản ▾</span>
      <div class="user-dropdown-menu">
        <a href="javascript:void(0)">Thông tin cá nhân</a>
        <a href="javascript:void(0)">Vòng quay may mắn</a>
        <a href="javascript:void(0)">Điểm danh hàng ngày</a>
        <a href="javascript:void(0)">Đổi hệ thống tu luyện</a>
        <a href="javascript:void(0)">Cài đặt pháp bảo</a>
        <a href="javascript:void(0)">Bí cảnh</a>
        <a href="javascript:void(0)">Khung avatar</a>
        <a href="javascript:void(0)">Bách bảo các</a>
        <a href="javascript:void(0)">Pháp tướng</a>
        <a href="javascript:void(0)" class="logout" onclick="showLoggedOutState()">Đăng Xuất</a>
      </div>
    </div>
  `;
  initUserDropdown();
}

function showLoggedOutState() {
  var actions = document.querySelector('.header-actions');
  if (!actions) return;
  actions.innerHTML = `
    <a href="javascript:void(0)">Lịch sử</a>
    <a href="javascript:void(0)">Bookmark</a>
    <a href="javascript:void(0)" id="btnLogin" class="btn-login">Đăng nhập</a>
  `;
  initLoginModal();
}
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

/* === Real login/register === */
function handleLogin(event) {
  event.preventDefault();
  var emailEl = document.getElementById('loginEmail');
  var phoneEl = document.getElementById('loginPhone');
  var passwordEl = document.getElementById('loginPassword');

  var email = emailEl && emailEl.style.display !== 'none' ? emailEl.value.trim() : '';
  var phone = phoneEl && phoneEl.style.display !== 'none' ? phoneEl.value.trim() : '';
  var password = passwordEl ? passwordEl.value : '';

  if (!password) { showToast('❌ Vui lòng nhập mật khẩu'); return false; }
  if (phone) {
    if (typeof loginWithPhone === 'function') loginWithPhone(phone, password);
  } else if (email) {
    if (!email.includes('@')) { showToast('❌ Email không hợp lệ'); return false; }
    if (typeof loginUser === 'function') loginUser(email, password);
  } else {
    showToast('❌ Vui lòng nhập email hoặc số điện thoại');
  }
  return false;
}

function handleRegister(event) {
  event.preventDefault();
  var nameEl = document.getElementById('regName');
  var emailEl = document.getElementById('regEmail');
  var phoneEl = document.getElementById('regPhone');
  var passwordEl = document.getElementById('regPassword');

  var name = nameEl ? nameEl.value.trim() : '';
  var email = emailEl ? emailEl.value.trim() : '';
  var phone = phoneEl ? phoneEl.value.trim() : '';
  var password = passwordEl ? passwordEl.value : '';

  if (!name) { showToast('❌ Vui lòng nhập tên hiển thị'); return false; }
  if (!email || !email.includes('@')) { showToast('❌ Email không hợp lệ'); return false; }
  if (!password || password.length < 6) { showToast('❌ Mật khẩu tối thiểu 6 ký tự'); return false; }
  if (typeof registerUser === 'function') registerUser(email, password, name);
  return false;
}

function switchAuthTab(tab, btn) {
  document.querySelectorAll('#loginModal .tab-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('loginTab').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerTab').style.display = tab === 'register' ? 'block' : 'none';
}

function switchLoginMethod(method, btn) {
  var row = btn.parentElement;
  row.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('loginEmailGroup').style.display = method === 'email' ? 'block' : 'none';
  document.getElementById('loginPhoneGroup').style.display = method === 'phone' ? 'block' : 'none';
}
/* === hh3dtq - Firebase Configuration === */
// 1. Tạo project tại https://console.firebase.google.com
// 2. Enable Authentication (Email/Password) + Firestore Database + Storage
// 3. Copy config từ Project Settings > General > Your apps > Web app

const firebaseConfig = {
  apiKey: "AIzaSyD-PLACEHOLDER-KEY",
  authDomain: "hh3dtq.firebaseapp.com",
  projectId: "hh3dtq",
  storageBucket: "hh3dtq.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abc123def456"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

const ADMIN_EMAILS = ['admin@hh3dtq.com'];
let currentUser = null;
let isAdmin = false;

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      isAdmin = userDoc.exists && userDoc.data().role === 'admin';
    } catch(e) { isAdmin = false; }
    updateUIForAuth();
  } else {
    isAdmin = false;
    updateUIForAuth();
  }
});

function updateUIForAuth() {
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;
  if (currentUser) {
    const displayName = currentUser.displayName || currentUser.email || 'User';
    headerActions.innerHTML = `
      <a href="javascript:void(0)">Lịch sử</a>
      <a href="javascript:void(0)">Bookmark</a>
      <div class="user-dropdown">
        <span class="user-dropdown-toggle">👤 ${escapeHtml(displayName)} ▾</span>
        <div class="user-dropdown-menu">
          <a href="javascript:void(0)">Thông tin cá nhân</a>
          <a href="javascript:void(0)">Vòng quay may mắn</a>
          <a href="javascript:void(0)">Điểm danh hàng ngày</a>
          ${isAdmin ? '<a href="admin.html" style="color:#f5a623;">⚙ Admin Panel</a>' : ''}
          <a href="javascript:void(0)" class="logout" onclick="logout()">Đăng Xuất</a>
        </div>
      </div>`;
    initUserDropdown();
  } else {
    headerActions.innerHTML = `
      <a href="javascript:void(0)">Lịch sử</a>
      <a href="javascript:void(0)">Bookmark</a>
      <a href="javascript:void(0)" id="btnLogin" class="btn-login">Đăng nhập</a>`;
    initLoginModal();
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========== AUTH FUNCTIONS ==========

async function registerUser(email, password, displayName) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName });
    await db.collection('users').doc(cred.user.uid).set({
      email, displayName, role: 'user',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      phone: '', bookmarks: [], history: []
    });
    closeModal('loginModal');
    showToast('✅ Đăng ký thành công!');
    return true;
  } catch(e) {
    showToast('❌ Lỗi: ' + translateError(e.code));
    return false;
  }
}

async function loginUser(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    closeModal('loginModal');
    showToast('✅ Đăng nhập thành công!');
    return true;
  } catch(e) {
    showToast('❌ Lỗi: ' + translateError(e.code));
    return false;
  }
}

async function loginWithPhone(phone, password) {
  try {
    const snapshot = await db.collection('users').where('phone', '==', phone).limit(1).get();
    if (snapshot.empty) { showToast('❌ SĐT không tồn tại'); return false; }
    const email = snapshot.docs[0].data().email;
    return await loginUser(email, password);
  } catch(e) {
    showToast('❌ Lỗi đăng nhập');
    return false;
  }
}

async function logout() {
  await auth.signOut();
  showToast('👋 Đã đăng xuất');
}

async function loginAdmin(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      await auth.signOut();
      showToast('❌ Không phải admin!');
      return false;
    }
    closeModal('adminLoginModal');
    showToast('✅ Admin đăng nhập thành công!');
    loadAdminPanel();
    return true;
  } catch(e) {
    showToast('❌ Lỗi: ' + translateError(e.code));
    return false;
  }
}

function translateError(code) {
  const map = {
    'auth/email-already-in-use': 'Email đã được sử dụng',
    'auth/invalid-email': 'Email không hợp lệ',
    'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
    'auth/user-not-found': 'Tài khoản không tồn tại',
    'auth/wrong-password': 'Sai mật khẩu',
    'auth/invalid-credential': 'Sai email hoặc mật khẩu',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng đợi.',
    'auth/network-request-failed': 'Lỗi mạng. Kiểm tra kết nối.'
  };
  return map[code] || code;
}

// ========== COMMENT SYSTEM ==========

async function loadComments(animeId) {
  const container = document.getElementById('commentsContainer');
  if (!container) return;
  container.innerHTML = '<div class="loading">Đang tải bình luận...</div>';

  try {
    const snapshot = await db.collection('comments')
      .where('animeId', '==', animeId)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
      return;
    }

    let html = '';
    snapshot.forEach(doc => {
      const c = doc.data();
      html += `
        <div class="comment-item" id="comment-${doc.id}">
          <div class="comment-avatar">👤</div>
          <div class="comment-body">
            <div class="comment-header">
              <strong>${escapeHtml(c.userName || 'Ẩn danh')}</strong>
              <span class="comment-time">${formatTime(c.createdAt)}</span>
            </div>
            <div class="comment-text">${escapeHtml(c.text)}</div>
            ${isAdmin ? `<button class="btn-delete-comment" onclick="deleteComment('${doc.id}')">🗑 Xóa</button>` : ''}
          </div>
        </div>`;
    });
    container.innerHTML = html;
  } catch(e) {
    container.innerHTML = '<p class="error">Lỗi tải bình luận</p>';
    console.error(e);
  }
}

async function submitComment(animeId) {
  if (!currentUser) { showToast('❌ Vui lòng đăng nhập để bình luận'); return; }
  const input = document.getElementById('commentInput');
  const text = input?.value?.trim();
  if (!text) { showToast('❌ Vui lòng nhập nội dung'); return; }

  try {
    await db.collection('comments').add({
      animeId, text,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = '';
    showToast('✅ Đã đăng bình luận');
    loadComments(animeId);
  } catch(e) {
    showToast('❌ Lỗi đăng bình luận');
  }
}

async function deleteComment(commentId) {
  if (!isAdmin) { showToast('❌ Chỉ admin mới xóa được bình luận'); return; }
  if (!confirm('Xóa bình luận này?')) return;
  try {
    await db.collection('comments').doc(commentId).delete();
    showToast('✅ Đã xóa bình luận');
    const animeId = new URLSearchParams(location.search).get('id');
    if (animeId) loadComments(animeId);
  } catch(e) {
    showToast('❌ Lỗi xóa bình luận');
  }
}

// ========== VOTE SYSTEM ==========

async function loadVotes(animeId) {
  try {
    const snapshot = await db.collection('votes').where('animeId', '==', animeId).get();
    let totalStars = 0, count = 0;
    snapshot.forEach(doc => { totalStars += doc.data().stars; count++; });
    const avg = count > 0 ? (totalStars / count).toFixed(1) : '0.0';
    const display = document.getElementById('voteDisplay');
    if (display) display.innerHTML = `⭐ ${avg} (${count} lượt)`;
    return { avg, count, totalStars };
  } catch(e) { console.error(e); }
}

async function submitVote(animeId, stars) {
  if (!currentUser) { showToast('❌ Vui lòng đăng nhập để vote'); return; }
  try {
    const existing = await db.collection('votes')
      .where('animeId', '==', animeId)
      .where('userId', '==', currentUser.uid)
      .limit(1).get();

    if (!existing.empty) {
      await db.collection('votes').doc(existing.docs[0].id).update({ stars });
    } else {
      await db.collection('votes').add({
        animeId, userId: currentUser.uid, stars,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    showToast(`✅ Đã vote ${stars} sao`);
    loadVotes(animeId);
  } catch(e) {
    showToast('❌ Lỗi vote');
  }
}

// Admin: sửa số lượng vote (sao giữ nguyên)
async function adminUpdateVoteCount(animeId, newCount) {
  if (!isAdmin) { showToast('❌ Chỉ admin mới sửa được'); return; }
  try {
    await db.collection('anime').doc(animeId).update({
      voteCountOverride: parseInt(newCount)
    });
    showToast('✅ Đã cập nhật số vote');
    loadVotes(animeId);
  } catch(e) {
    showToast('❌ Lỗi cập nhật');
  }
}

// ========== EPISODE SYSTEM ==========

async function loadEpisodes(animeId, type = 'all') {
  const container = document.getElementById('episodesContainer');
  if (!container) return;

  try {
    let query = db.collection('episodes').where('animeId', '==', animeId);
    if (type === 'vietsub') query = query.where('type', '==', 'vietsub');
    else if (type === 'thuyetminh') query = query.where('type', '==', 'thuyetminh');

    const snapshot = await query.orderBy('episodeNumber', 'asc').get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">Chưa có tập nào</p>';
      return;
    }

    let html = '<div class="episode-list">';
    snapshot.forEach(doc => {
      const ep = doc.data();
      html += `
        <div class="episode-item">
          <span class="ep-number">Tập ${ep.episodeNumber}</span>
          <span class="ep-type-badge ${ep.type}">${ep.type === 'vietsub' ? 'VietSub' : 'Thuyết Minh'}</span>
          <a href="${ep.url || 'javascript:void(0)'}" target="_blank" class="ep-link">▶ Xem</a>
          ${isAdmin ? `<button class="btn-delete" onclick="deleteEpisode('${doc.id}')">🗑</button>` : ''}
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch(e) {
    container.innerHTML = '<p class="error">Lỗi tải tập phim</p>';
    console.error(e);
  }
}

async function addEpisode(animeId, episodeNumber, type, url) {
  if (!isAdmin) return;
  try {
    await db.collection('episodes').add({
      animeId, episodeNumber: parseInt(episodeNumber),
      type, url,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('✅ Đã thêm tập');
    loadEpisodes(animeId);
  } catch(e) {
    showToast('❌ Lỗi thêm tập');
  }
}

async function deleteEpisode(epId) {
  if (!isAdmin) return;
  if (!confirm('Xóa tập này?')) return;
  try {
    await db.collection('episodes').doc(epId).delete();
    showToast('✅ Đã xóa tập');
    const animeId = new URLSearchParams(location.search).get('id');
    if (animeId) loadEpisodes(animeId);
  } catch(e) { showToast('❌ Lỗi xóa'); }
}

// ========== HELPER FUNCTIONS ==========

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);border:1px solid #333;max-width:350px;transition:opacity 0.3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return Math.floor(diff/60000) + ' phút trước';
  if (diff < 86400000) return Math.floor(diff/3600000) + ' giờ trước';
  return d.toLocaleDateString('vi-VN');
}

function initUserDropdown() {
  const dropdown = document.querySelector('.user-dropdown');
  const toggle = document.querySelector('.user-dropdown-toggle');
  if (toggle && dropdown) {
    toggle.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); dropdown.classList.toggle('active'); });
    document.addEventListener('click', () => { dropdown.classList.remove('active'); });
  }
}

function initLoginModal() {
  const btnLogin = document.getElementById('btnLogin');
  if (btnLogin) {
    btnLogin.addEventListener('click', (e) => { e.preventDefault(); openModal('loginModal'); });
  }
  // Close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => { closeModal(btn.closest('.modal-overlay').id); });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
  });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  initLoginModal();
  initScheduleTabs();
  initGenreDropdown();
});

function initScheduleTabs() {
  document.querySelectorAll('.schedule-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.schedule-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function initGenreDropdown() {
  // CSS hover handles desktop, JS click handles mobile
  document.querySelectorAll('.has-dropdown > a').forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dd = this.nextElementSibling;
        if (dd) dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
      }
    });
  });
}
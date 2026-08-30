/* === HH3DTQ - Firebase Configuration === */
// Firebase auto-detection: if config is placeholder, site runs in demo mode
// To enable: create project at https://console.firebase.google.com and paste config below

const firebaseConfig = {
  apiKey: "AIzaSyD-PLACEHOLDER-KEY",
  authDomain: "hh3dtq.firebaseapp.com",
  projectId: "hh3dtq",
  storageBucket: "hh3dtq.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abc123def456"
};

// Auto-detect Firebase availability
var FIREBASE_READY = false;
var db = null;
var auth = null;
var storage = null;

try {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyD-PLACEHOLDER-KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    FIREBASE_READY = true;
    console.log("[HH3DTQ] Firebase initialized successfully");
  } else {
    console.warn("[HH3DTQ] Firebase not configured - running in DEMO MODE");
    console.warn("[HH3DTQ] To enable: create Firebase project at console.firebase.google.com");
    console.warn("[HH3DTQ] Then paste your config into js/app.js (replace PLACEHOLDER-KEY)");
    FIREBASE_READY = false;
  }
} catch(e) {
  console.error("[HH3DTQ] Firebase init error:", e.message);
  FIREBASE_READY = false;
}

const ADMIN_EMAILS = ["admin@hh3dtq.com"];
let currentUser = null;
let isAdmin = false;

// ========== HARDCODED ANIME DATA (demo mode fallback) ==========
var HARDCODED_ANIME = {
  "tien-nghich": { name: "Tiên Nghịch", nameEn: "Xian Ni", genre: "Tu Tiên", description: "Hành trình tu tiên đầy gian nan và thử thách của Vương Lâm - một thiếu niên bình thường nhưng mang trong mình nghịch lực phi thường, dám nghịch thiên cải mệnh.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/tien-nghich-300x450.webp", duration: 25, totalEp: 180, status: "ongoing", currentEp: 155, rating: 4.5, voteCount: 2847 },
  "muc-than-ky": { name: "Mục Thần Ký", nameEn: "Mu Shen Ji", genre: "Huyền Huyễn", description: "Tần Mục - một thiếu niên được lão Mục Thần thu nhận, bắt đầu hành trình tu luyện đầy kỳ diệu.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/muc-than-ky-2-300x450.webp", duration: 20, totalEp: 52, status: "ongoing", currentEp: 42, rating: 4.5, voteCount: 1923 },
  "dau-pha-thuong-khung": { name: "Đấu Phá Thương Khung", nameEn: "Fights Break Sphere", genre: "Huyền Huyễn", description: "Tiêu Viêm - thiên tài tu luyện một thời bỗng chốc mất hết thực lực. Nhưng định mệnh đã sắp đặt để chàng trai trẻ gặp được Dược Lão...", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/dau-pha-thuong-khung-phan-5-gia-nam-hoc-vien-1-1-300x450.webp", duration: 22, totalEp: 156, status: "ongoing", currentEp: 125, rating: 4.1, voteCount: 3156 },
  "phan-nhan-tu-tien": { name: "Phàm Nhân Tu Tiên", nameEn: "Fan Ren Xiu Xian Zhuan", genre: "Tu Tiên", description: "Hàn Lập - một phàm nhân bình thường, nhờ cơ duyên bước vào con đường tu tiên đầy nguy hiểm.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/pham-nhan-tu-tien-phan-4-300x450.webp", duration: 20, totalEp: 140, status: "ongoing", currentEp: 128, rating: 4.4, voteCount: 2645 },
  "the-gioi-hoan-my": { name: "Thế Giới Hoàn Mỹ", nameEn: "Perfect World", genre: "Tiên Hiệp", description: "Thạch Hạo - thiếu niên được sinh ra trong một thế giới hoàn mỹ, bắt đầu hành trình tu luyện từ những điều nhỏ nhất.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/The-Gioi-Hoan-My-poster-4-300x450.webp", duration: 22, totalEp: 210, status: "ongoing", currentEp: 189, rating: 4.5, voteCount: 2310 },
  "gia-thien": { name: "Già Thiên", nameEn: "Zhe Tian", genre: "Tu Tiên", description: "Một thế giới nơi tu sĩ che cả bầu trời - Diệp Phàm bắt đầu hành trình từ một người phàm.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Gia-Thien-300x450.webp", duration: 20, totalEp: 120, status: "ongoing", currentEp: 98, rating: 4.6, voteCount: 1890 },
  "dau-la-dai-luc-2": { name: "Đấu La Đại Lục 2", nameEn: "Douluo Dalu 2", genre: "Huyền Huyễn", description: "Tiếp nối câu chuyện Đấu La Đại Lục, với nhân vật chính mới và những cuộc phiêu lưu mới.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Dau-La-Dai-Luc-2-Tuyet-The-Duong-Mon-1-300x450.webp", duration: 20, totalEp: 104, status: "ongoing", currentEp: 88, rating: 4.3, voteCount: 2789 },
  "thon-phe-tinh-khong": { name: "Thôn Phệ Tinh Không", nameEn: "Swallowed Star", genre: "Khoa Huyễn", description: "La Phong - một thiếu niên bình thường sống trong thời đại khoa học kỹ thuật và võ học cùng tồn tại.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Thon-Phe-Tinh-Khong-300x450.webp", duration: 22, totalEp: 180, status: "ongoing", currentEp: 156, rating: 4.5, voteCount: 2045 },
  "thuong-nguyen-do": { name: "Thương Nguyên Đồ", nameEn: "Cang Yuan Tu", genre: "Tu Tiên", description: "Mạnh Xuyên - một thiếu niên mang trong mình giấc mơ trở thành cường giả mạnh nhất.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/photo_2026-03-13_09-30-47-300x450.webp", duration: 20, totalEp: 78, status: "ongoing", currentEp: 65, rating: 4.4, voteCount: 1567 },
  "van-tham-bat-tri-mong": { name: "Vân Thâm Bất Tri Mộng", nameEn: "Veiled Dreams", genre: "Cổ Trang", description: "Một câu chuyện huyền bí về những giấc mơ và hiện thực đan xen.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2025/07/Van-Tham-Bat-Tri-Mong-1-300x450.webp", duration: 18, totalEp: 16, status: "ongoing", currentEp: 5, rating: 4.5, voteCount: 678 },
  "tru-tien": { name: "Tru Tiên", nameEn: "Zhu Xian", genre: "Tiên Hiệp", description: "Trương Tiểu Phàm - một thiếu niên bình thường vô tình bước vào thế giới tu chân đầy biến động.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Tru-Tien-Phan-3-300x450.jpg", duration: 22, totalEp: 104, status: "ongoing", currentEp: 78, rating: 4.3, voteCount: 2145 },
  "kiem-lai": { name: "Kiếm Lai", nameEn: "Sword of Coming", genre: "Kiếm Hiệp", description: "Trần Bình An - một thiếu niên bình thường ở trấn nhỏ, bắt đầu con đường kiếm đạo đầy chông gai.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Gia-Thien-300x450.webp", duration: 20, totalEp: 52, status: "ongoing", currentEp: 45, rating: 4.4, voteCount: 1234 },
  "than-mu": { name: "Thần Mộ", nameEn: "Shen Mu", genre: "Huyền Huyễn", description: "Thần Mộ - nơi an nghỉ của chư thần, một thiếu niên tỉnh dậy từ nấm mồ thần...", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Thai-Co-Than-Ton-300x450.png", duration: 22, totalEp: 52, status: "ongoing", currentEp: 34, rating: 4.2, voteCount: 987 },
  "vo-luyen-dinh-phong": { name: "Võ Luyện Đỉnh Phong", nameEn: "Martial Peak", genre: "Huyền Huyễn", description: "Dương Khai - một thiếu niên với võ đạo chi tâm kiên định, từng bước leo lên đỉnh cao.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Vo-Than-Chua-Te-300x450.webp", duration: 18, totalEp: 156, status: "ongoing", currentEp: 112, rating: 4.1, voteCount: 2345 },
  "nguyen-ton": { name: "Nguyên Tôn", nameEn: "Yuan Zun", genre: "Huyền Huyễn", description: "Chu Nguyên - thiếu niên mang trong mình oán long chi khí, bắt đầu hành trình trở thành Nguyên Tôn.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Than-Y-Co-Dai-O-Do-Thi-300x450.webp", duration: 20, totalEp: 78, status: "ongoing", currentEp: 56, rating: 4.3, voteCount: 1678 },
  "vo-dong-can-khon": { name: "Võ Động Càn Khôn", nameEn: "Wu Dong Qian Kun", genre: "Huyền Huyễn", description: "Lâm Động - từ một thiếu niên yếu đuối trở thành cường giả chấn động càn khôn.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Tuyet-The-Chien-Hon-3D-300x450.webp", duration: 20, totalEp: 104, status: "ongoing", currentEp: 89, rating: 4.2, voteCount: 1890 },
  "dai-chua-te": { name: "Đại Chúa Tể", nameEn: "The Great Ruler", genre: "Huyền Huyễn", description: "Mục Trần - thiếu niên với linh mạch bị phong ấn, bắt đầu con đường trở thành Đại Chúa Tể.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Dai-Chua-Te-2-300x450.webp", duration: 22, totalEp: 78, status: "ongoing", currentEp: 67, rating: 4.1, voteCount: 1456 },
  "nhat-the-doc-ton": { name: "Nhất Thế Độc Tôn", nameEn: "Peerless Battle Spirit", genre: "Huyền Huyễn", description: "Thiếu niên với chiến hồn vô song, bước lên đỉnh cao võ đạo.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Nghich-Thien-Chi-Ton-300x450.webp", duration: 18, totalEp: 52, status: "ongoing", currentEp: 45, rating: 4.0, voteCount: 1234 },
  "linh-kiem-ton": { name: "Linh Kiếm Tôn", nameEn: "Spirit Sword Sovereign", genre: "Kiếm Hiệp", description: "Kiếm đạo đỉnh phong - hành trình của một linh kiếm tôn giả.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Vo-Thuong-Than-De-300x450.webp", duration: 15, totalEp: 300, status: "ongoing", currentEp: 234, rating: 3.9, voteCount: 3456 },
  "van-co-than-de": { name: "Vạn Cổ Thần Đế", nameEn: "Wan Gu Shen Di", genre: "Huyền Huyễn", description: "Một vị thần đế vạn cổ tái sinh, bắt đầu lại từ con số không.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Vo-Thuong-Than-De-300x450.webp", duration: 18, totalEp: 120, status: "ongoing", currentEp: 89, rating: 4.0, voteCount: 2100 },
  "nghich-thien-ta-than": { name: "Nghịch Thiên Tà Thần", nameEn: "Against the Gods", genre: "Huyền Huyễn", description: "Nghịch thiên giả - kẻ dám chống lại cả thiên đạo.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Nghich-Thien-Ta-Than-3D-300x450.webp", duration: 15, totalEp: 200, status: "ongoing", currentEp: 156, rating: 4.2, voteCount: 2890 },
  "van-gioi-doc-ton": { name: "Vạn Giới Độc Tôn", nameEn: "Myriad Realms Supreme", genre: "Huyền Huyễn", description: "Độc tôn vạn giới - kẻ mạnh nhất trong muôn vàn thế giới.", thumbnail: "https://hoathinh3d.ee/wp-content/uploads/2024/11/Van-Gioi-Doc-Ton-300x450.webp", duration: 18, totalEp: 104, status: "ongoing", currentEp: 67, rating: 4.0, voteCount: 1567 }
};

// Helper: get anime data (Firebase first, then hardcoded fallback)
async function getAnimeData(slug) {
  if (FIREBASE_READY && db) {
    try {
      const doc = await db.collection("anime").doc(slug).get();
      if (doc.exists) return doc.data();
    } catch(e) { console.warn("[HH3DTQ] Firebase getAnime error:", e.message); }
  }
  return HARDCODED_ANIME[slug] || null;
}


// ========== AUTH (only with Firebase) ==========
if (FIREBASE_READY && auth) {
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
      try {
        const userDoc = await db.collection("users").doc(user.uid).get();
        isAdmin = userDoc.exists && userDoc.data().role === "admin";
      } catch(e) { isAdmin = false; }
    } else {
      isAdmin = false;
    }
    updateUIForAuth();
  });
}

function updateUIForAuth() {
  const headerActions = document.querySelector(".header-actions");
  if (!headerActions) return;
  if (currentUser) {
    const displayName = currentUser.displayName || currentUser.email || "User";
    headerActions.innerHTML = '<a href="javascript:void(0)" onclick="showToast(\'📜 Lịch sử xem phim\')">Lịch sử</a>' +
      '<a href="javascript:void(0)" onclick="showToast(\'🔖 Bookmark của bạn\')">Bookmark</a>' +
      '<div class="user-dropdown">' +
      '<span class="user-dropdown-toggle">👤 ' + escapeHtml(displayName) + ' ▾</span>' +
      '<div class="user-dropdown-menu">' +
      '<a href="javascript:void(0)" onclick="showToast(\'👤 Thông tin cá nhân\')">Thông tin cá nhân</a>' +
      (isAdmin ? '<a href="admin.html" style="color:#f5a623;">⚙ Admin Panel</a>' : "") +
      '<a href="javascript:void(0)" class="logout" onclick="logout()">Đăng Xuất</a>' +
      '</div></div>';
    initUserDropdown();
  } else {
    headerActions.innerHTML = '<a href="javascript:void(0)" onclick="showToast(\'📜 Lịch sử xem phim\')">Lịch sử</a>' +
      '<a href="javascript:void(0)" onclick="showToast(\'🔖 Bookmark của bạn\')">Bookmark</a>' +
      '<a href="javascript:void(0)" id="btnLogin" class="btn-login">Đăng nhập</a>';
    initLoginModal();
  }
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ========== AUTH FUNCTIONS ==========

async function registerUser(email, password, displayName) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình. Vui lòng liên hệ admin qua Telegram: @scanhihi"); return false; }
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName });
    await db.collection("users").doc(cred.user.uid).set({
      email, displayName, role: "user",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      phone: "", bookmarks: [], history: []
    });
    closeModal("loginModal");
    showToast("✅ Đăng ký thành công!");
    return true;
  } catch(e) {
    showToast("❌ " + translateError(e.code));
    return false;
  }
}

async function loginUser(email, password) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình. Vui lòng liên hệ admin qua Telegram: @scanhihi"); return false; }
  try {
    await auth.signInWithEmailAndPassword(email, password);
    closeModal("loginModal");
    showToast("✅ Đăng nhập thành công!");
    return true;
  } catch(e) {
    showToast("❌ " + translateError(e.code));
    return false;
  }
}

async function loginWithPhone(phone, password) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình"); return false; }
  try {
    const snapshot = await db.collection("users").where("phone", "==", phone).limit(1).get();
    if (snapshot.empty) { showToast("❌ SĐT không tồn tại"); return false; }
    const email = snapshot.docs[0].data().email;
    return await loginUser(email, password);
  } catch(e) {
    showToast("❌ Lỗi đăng nhập");
    return false;
  }
}

async function logout() {
  if (FIREBASE_READY && auth) await auth.signOut();
  showToast("👋 Đã đăng xuất");
}

async function loginAdmin(email, password) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình"); return false; }
  try {
    await auth.signInWithEmailAndPassword(email, password);
    const userDoc = await db.collection("users").doc(auth.currentUser.uid).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      await auth.signOut();
      showToast("❌ Không phải admin!");
      return false;
    }
    closeModal("adminLoginModal");
    showToast("✅ Admin đăng nhập thành công!");
    if (typeof loadAdminPanel === "function") loadAdminPanel();
    return true;
  } catch(e) {
    showToast("❌ " + translateError(e.code));
    return false;
  }
}

function translateError(code) {
  const map = {
    "auth/email-already-in-use": "Email đã được sử dụng",
    "auth/invalid-email": "Email không hợp lệ",
    "auth/weak-password": "Mật khẩu quá yếu (tối thiểu 6 ký tự)",
    "auth/user-not-found": "Tài khoản không tồn tại",
    "auth/wrong-password": "Sai mật khẩu",
    "auth/invalid-credential": "Sai email hoặc mật khẩu",
    "auth/too-many-requests": "Quá nhiều lần thử. Vui lòng đợi.",
    "auth/network-request-failed": "Lỗi mạng. Kiểm tra kết nối."
  };
  return map[code] || code;
}

// ========== COMMENT SYSTEM ==========

async function loadComments(animeId) {
  const container = document.getElementById("commentsContainer");
  if (!container) return;
  container.innerHTML = '<div class="loading">⏳ Đang tải bình luận...</div>';

  if (!FIREBASE_READY) {
    container.innerHTML = '<p class="no-data">💬 Chưa có bình luận nào. Hãy là người đầu tiên!</p>' +
      '<p style="text-align:center;font-size:12px;color:#666;margin-top:8px;">' +
      '<button onclick="showToast(\'⚠ Firebase chưa được cấu hình. Vui lòng liên hệ admin qua Telegram: @scanhihi\')" style="background:#1a1a1a;color:#f5a623;border:1px solid #333;padding:5px 12px;border-radius:5px;cursor:pointer;font-family:inherit;">ℹ️ Tại sao không bình luận được?</button></p>';
    return;
  }

  try {
    const snapshot = await db.collection("comments")
      .where("animeId", "==", animeId)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">💬 Chưa có bình luận nào. Hãy là người đầu tiên!</p>';
      return;
    }

    let html = "";
    snapshot.forEach(doc => {
      const c = doc.data();
      html += '<div class="comment-item" id="comment-' + doc.id + '">' +
        '<div class="comment-avatar">👤</div>' +
        '<div class="comment-body">' +
        '<div class="comment-header"><strong>' + escapeHtml(c.userName || "Ẩn danh") + '</strong><span class="comment-time">' + formatTime(c.createdAt) + '</span></div>' +
        '<div class="comment-text">' + escapeHtml(c.text) + '</div>' +
        (isAdmin ? '<button class="btn-delete-comment" onclick="deleteComment(\'' + doc.id + '\')">🗑 Xóa</button>' : "") +
        '</div></div>';
    });
    container.innerHTML = html;
  } catch(e) {
    container.innerHTML = '<div class="error">⚠ Không thể tải bình luận<div style="font-size:12px;color:#888;margin-top:5px;">' + escapeHtml(e.message) + '</div>' +
      '<button onclick="loadComments(\'' + animeId + '\')" style="margin-top:10px;background:#f5a623;color:#000;border:none;padding:8px 16px;border-radius:5px;cursor:pointer;font-weight:600;font-family:inherit;">🔄 Thử lại</button></div>';
    console.error("[HH3DTQ] loadComments error:", e);
  }
}

async function submitComment(animeId) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình"); return; }
  if (!currentUser) { showToast("❌ Vui lòng đăng nhập để bình luận"); return; }
  const input = document.getElementById("commentInput");
  const text = input ? input.value.trim() : "";
  if (!text) { showToast("❌ Vui lòng nhập nội dung"); return; }

  const btn = document.querySelector(".comment-form button");
  if (!btn) return;
  const origText = btn.textContent;
  btn.textContent = "⏳ Đang gửi...";
  btn.disabled = true;

  try {
    await db.collection("comments").add({
      animeId, text,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = "";
    showToast("✅ Đã đăng bình luận");
    loadComments(animeId);
  } catch(e) {
    showToast("❌ Lỗi đăng bình luận: " + e.message);
  } finally {
    btn.textContent = origText;
    btn.disabled = false;
  }
}

async function deleteComment(commentId) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình"); return; }
  if (!isAdmin) { showToast("❌ Chỉ admin mới xóa được bình luận"); return; }
  if (!confirm("Xóa bình luận này?")) return;
  try {
    await db.collection("comments").doc(commentId).delete();
    showToast("✅ Đã xóa bình luận");
    const animeId = new URLSearchParams(location.search).get("id");
    if (animeId) loadComments(animeId);
  } catch(e) {
    showToast("❌ Lỗi xóa bình luận");
  }
}

// ========== VOTE SYSTEM ==========

async function loadVotes(animeId) {
  const display = document.getElementById("voteDisplay");
  if (!display) return;

  if (!FIREBASE_READY) {
    const anime = HARDCODED_ANIME[animeId];
    if (anime && anime.rating) {
      display.innerHTML = "⭐ " + anime.rating + " (" + (anime.voteCount || 0) + " lượt)";
    } else {
      display.innerHTML = "⭐ ...";
    }
    return { avg: anime ? anime.rating : 0, count: anime ? anime.voteCount : 0 };
  }

  try {
    const snapshot = await db.collection("votes").where("animeId", "==", animeId).get();
    let totalStars = 0, count = 0;
    snapshot.forEach(doc => { totalStars += doc.data().stars; count++; });
    const avg = count > 0 ? (totalStars / count).toFixed(1) : "0.0";
    display.innerHTML = "⭐ " + avg + " (" + count + " lượt)";
    return { avg, count, totalStars };
  } catch(e) {
    console.error("[HH3DTQ] loadVotes error:", e);
    display.innerHTML = "⭐ ...";
  }
}

async function submitVote(animeId, stars) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình. Vote demo: ⭐" + stars); return; }
  if (!currentUser) { showToast("❌ Vui lòng đăng nhập để vote"); return; }
  try {
    const existing = await db.collection("votes")
      .where("animeId", "==", animeId)
      .where("userId", "==", currentUser.uid)
      .limit(1).get();

    if (!existing.empty) {
      await db.collection("votes").doc(existing.docs[0].id).update({ stars });
    } else {
      await db.collection("votes").add({
        animeId, userId: currentUser.uid, stars,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    showToast("✅ Đã vote " + stars + " sao");
    loadVotes(animeId);
  } catch(e) {
    showToast("❌ Lỗi vote: " + e.message);
  }
}

async function adminUpdateVoteCount(animeId, newCount) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình"); return; }
  if (!isAdmin) { showToast("❌ Chỉ admin mới sửa được"); return; }
  try {
    await db.collection("anime").doc(animeId).update({
      voteCountOverride: parseInt(newCount)
    });
    showToast("✅ Đã cập nhật số vote");
    loadVotes(animeId);
  } catch(e) {
    showToast("❌ Lỗi cập nhật");
  }
}

// ========== EPISODE SYSTEM ==========

async function loadEpisodes(animeId, type) {
  const container = document.getElementById("episodesContainer");
  if (!container) return;
  container.innerHTML = '<div class="loading">⏳ Đang tải tập phim...</div>';

  if (!FIREBASE_READY) {
    const anime = HARDCODED_ANIME[animeId];
    const totalEp = anime ? anime.totalEp : 52;
    const currentEp = anime ? anime.currentEp : 26;
    var html = '<div class="episode-list">';
    var limit = Math.min(currentEp, 30);
    for (var i = 1; i <= limit; i++) {
      var epType = i % 3 === 0 ? "thuyetminh" : "vietsub";
      html += '<div class="episode-item">' +
        '<span class="ep-num">Tập ' + i + '</span>' +
        '<span class="ep-badge ' + epType + '">' + (epType === "vietsub" ? "VietSub" : "Thuyết Minh") + '</span>' +
        '<a href="javascript:void(0)" class="ep-link" onclick="showToast(\'⚠ Firebase chưa được cấu hình. Liên hệ admin qua Telegram: @scanhihi\')">▶ Xem</a>' +
        '</div>';
    }
    html += '</div>';
    if (!type || type === "all") {
      html += '<p style="text-align:center;font-size:12px;color:#666;margin-top:12px;">Hiển thị demo ' + limit + '/' + totalEp + ' tập. <button onclick="showToast(\'⚠ Firebase chưa được cấu hình. Vui lòng liên hệ admin.\')" style="background:none;color:#f5a623;border:none;cursor:pointer;text-decoration:underline;font-family:inherit;">ℹ️ Tại sao?</button></p>';
    }
    container.innerHTML = html;
    return;
  }

  try {
    let query = db.collection("episodes").where("animeId", "==", animeId);
    if (type === "vietsub") query = query.where("type", "==", "vietsub");
    else if (type === "thuyetminh") query = query.where("type", "==", "thuyetminh");

    const snapshot = await query.orderBy("episodeNumber", "asc").get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="no-data">📺 Chưa có tập nào</p>';
      return;
    }

    var html2 = '<div class="episode-list">';
    snapshot.forEach(function(doc) {
      const ep = doc.data();
      html2 += '<div class="episode-item">' +
        '<span class="ep-num">Tập ' + ep.episodeNumber + '</span>' +
        '<span class="ep-badge ' + ep.type + '">' + (ep.type === "vietsub" ? "VietSub" : "Thuyết Minh") + '</span>' +
        '<a href="' + (ep.url || "javascript:void(0)") + '" target="_blank" class="ep-link">▶ Xem</a>' +
        (isAdmin ? '<button class="btn-delete" onclick="deleteEpisode(\'' + doc.id + '\')" style="background:none;border:none;color:#e74c3c;cursor:pointer;margin-top:5px;">🗑</button>' : "") +
        '</div>';
    });
    html2 += '</div>';
    container.innerHTML = html2;
  } catch(e) {
    container.innerHTML = '<div class="error">⚠ Không thể tải tập phim<div style="font-size:12px;color:#888;margin-top:5px;">' + escapeHtml(e.message) + '</div>' +
      '<button onclick="loadEpisodes(\'' + animeId + '\',\'' + (type || "all") + '\')" style="margin-top:10px;background:#f5a623;color:#000;border:none;padding:8px 16px;border-radius:5px;cursor:pointer;font-weight:600;font-family:inherit;">🔄 Thử lại</button></div>';
    console.error("[HH3DTQ] loadEpisodes error:", e);
  }
}

async function addEpisode(animeId, episodeNumber, type, url) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình"); return; }
  if (!isAdmin) { showToast("❌ Chỉ admin mới thêm được"); return; }
  try {
    await db.collection("episodes").add({
      animeId, episodeNumber: parseInt(episodeNumber),
      type, url,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast("✅ Đã thêm tập");
    loadEpisodes(animeId);
  } catch(e) {
    showToast("❌ Lỗi thêm tập: " + e.message);
  }
}

async function deleteEpisode(epId) {
  if (!FIREBASE_READY) { showToast("⚠ Firebase chưa được cấu hình"); return; }
  if (!isAdmin) return;
  if (!confirm("Xóa tập này?")) return;
  try {
    await db.collection("episodes").doc(epId).delete();
    showToast("✅ Đã xóa tập");
    const animeId = new URLSearchParams(location.search).get("id");
    if (animeId) loadEpisodes(animeId);
  } catch(e) { showToast("❌ Lỗi xóa"); }
}

// ========== HELPER FUNCTIONS ==========

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = "position:fixed;bottom:20px;right:20px;background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);border:1px solid #333;max-width:350px;transition:opacity 0.3s;";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function() { toast.style.opacity = "0"; }, 4000);
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.remove("active"); document.body.style.overflow = ""; }
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add("active"); document.body.style.overflow = "hidden"; }
}

function formatTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Vừa xong";
  if (diff < 3600000) return Math.floor(diff/60000) + " phút trước";
  if (diff < 86400000) return Math.floor(diff/3600000) + " giờ trước";
  return d.toLocaleDateString("vi-VN");
}

function initUserDropdown() {
  const dropdown = document.querySelector(".user-dropdown");
  const toggle = document.querySelector(".user-dropdown-toggle");
  if (toggle && dropdown) {
    toggle.addEventListener("click", function(e) { e.preventDefault(); e.stopPropagation(); dropdown.classList.toggle("active"); });
    document.addEventListener("click", function() { dropdown.classList.remove("active"); });
  }
}

function initLoginModal() {
  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) {
    btnLogin.addEventListener("click", function(e) { e.preventDefault(); openModal("loginModal"); });
  }
  document.querySelectorAll(".modal-close").forEach(function(btn) {
    btn.addEventListener("click", function() {
      const overlay = btn.closest(".modal-overlay");
      if (overlay) closeModal(overlay.id);
    });
  });
  document.querySelectorAll(".modal-overlay").forEach(function(overlay) {
    overlay.addEventListener("click", function(e) { if (e.target === overlay) closeModal(overlay.id); });
  });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", function() {
  initLoginModal();
  initScheduleTabs();
  initGenreDropdown();
  // Add feedback to all javascript:void(0) links that don't have handlers
  document.querySelectorAll('a[href="javascript:void(0)"]').forEach(function(a) {
    if (!a.hasAttribute("data-has-handler")) {
      a.addEventListener("click", function(e) {
        var text = a.textContent.trim();
        if (text && text !== "▾" && text !== "✕" && !a.closest(".user-dropdown") && !a.closest(".genre-dropdown")) {
          showToast('⏳ Chức năng "' + text + '" đang được phát triển');
        }
      });
      a.setAttribute("data-has-handler", "1");
    }
  });
});

function initScheduleTabs() {
  document.querySelectorAll(".schedule-tab").forEach(function(tab) {
    tab.addEventListener("click", function() {
      document.querySelectorAll(".schedule-tab").forEach(function(t) { t.classList.remove("active"); });
      this.classList.add("active");
    });
  });
}

function initGenreDropdown() {
  document.querySelectorAll(".has-dropdown > a").forEach(function(link) {
    link.addEventListener("click", function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dd = this.nextElementSibling;
        if (dd) dd.style.display = dd.style.display === "block" ? "none" : "block";
      }
    });
  });
}

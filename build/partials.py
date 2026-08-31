#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""HH3DTQ HTML partials. Every page is a thin shell that loads data at runtime
via js/data.js + js/render.js. No hardcoded series, slugs, or page counts."""
import sys, json
sys.stdout.reconfigure(encoding='utf-8')

GENRES = [
    ("tu-tien", "Tu Tiên"), ("tien-hiep", "Tiên Hiệp"),
    ("huyen-huyen", "Huyền Huyễn"), ("do-thi", "Đô Thị"),
    ("trung-sinh", "Trùng Sinh"), ("hai-huoc", "Hài Hước"),
    ("kiem-hiep", "Kiếm Hiệp"), ("co-trang", "Cổ Trang"),
    ("xuyen-khong", "Xuyên Không"),
]

NAV = [
    ("index.html", "Trang chủ"),
    (None, "Thể Loại"),
    ("top-xem-nhieu.html", "Top Xem Nhiều"),
    ("lich-chieu.html", "Lịch Chiếu"),
    ("hoan-thanh.html", "Hoàn Thành"),
    ("moi-cap-nhat.html", "Mới Cập Nhật"),
]

def head(title, desc, rel=""):
    """Generate <head> with OG meta, favicon, CSS."""
    return f"""  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="keywords" content="hh3dtq, hh3d, phim hoạt hình 3D, donghua, hoạt hình Trung Quốc, tu tiên, huyền huyễn, 4K, thuyết minh, vietsub">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="HH3DTQ">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{desc}">
  <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎬</text></svg>">
  <link rel="stylesheet" href="{rel}css/style.css">"""

def header(active, rel=""):
    """Generate full header with logo, nav, genre dropdown."""
    nav_html = []
    for href, label in NAV:
        if href is None:
            dd = []
            for gslug, gname in GENRES:
                dd.append(f'<a href="{rel}category/{gslug}.html">{gname}</a>')
            nav_html.append(
                '<li class="has-dropdown">'
                f'<a href="javascript:void(0)">Thể Loại ▾</a>'
                f'<div class="genre-dropdown">{"".join(dd)}</div>'
                '</li>')
        else:
            cls = ' class="active"' if label == active else ''
            nav_html.append(f'<li><a href="{rel}{href}"{cls}>{label}</a></li>')

    return f"""<header class="site-header">
  <div class="container">
    <div class="header-top">
      <div class="logo">
        <a href="{rel}index.html">
          <img src="{rel}images/logo-1.webp" alt="HH3DTQ" onerror="this.style.display=&#39;none&#39;; this.nextElementSibling.style.display=&#39;block&#39;;">
          <span style="display:none; font-size:26px; font-weight:900; color:var(--accent); letter-spacing:2px;">HH3DTQ</span>
        </a>
        <div class="logo-text">
          <strong>HH3DTQ</strong>
          Phim Hoạt Hình 3D Trung Quốc 4K<br>Thuyết Minh VietSub
        </div>
      </div>
      <div class="header-actions">
        <a href="javascript:void(0)">Lịch sử</a>
        <a href="javascript:void(0)">Bookmark</a>
        <a href="javascript:void(0)" id="btnLogin" class="btn-login">Đăng nhập</a>
      </div>
    </div>
    <nav class="main-nav">
      <ul class="nav-list">
        {"".join(nav_html)}
      </ul>
    </nav>
  </div>
</header>"""

def searchbox(rel=""):
    """Search form that navigates to tim-kiem.html."""
    return f"""  <div class="search-box">
    <form onsubmit="window.location.href=&#39;{rel}tim-kiem.html?q=&#39;+encodeURIComponent(this.querySelector(&#39;input&#39;).value.trim());return false;">
      <input type="text" placeholder="Tìm kiếm phim…">
      <button type="submit">🔍 Tìm kiếm</button>
    </form>
  </div>"""

def footer(rel=""):
    """Footer with contact and links (matches original)."""
    flinks = [
        "hhkungfu","hhpanda","xoilac","GG88","Sunwin","CakhiaTV","Vebo","qq88","M7","new88",
        "f8bet","Socolive","Hitclub","Jun88","rophim","iwin68","gavangtv","Vip66","rakhoitv",
        "Go88","789Club","B52club","topbet","bong88","8day","RIKVIP","xoso66","ee88","s8net",
        "ao88game","uy88play","23win","188mfun","luck8386","SONCLUB","nohu90","MM88","say88",
        "XX88","FLY88","F168","Viva88","kubet","RR88","c168","Good88","zo88","HI88","sv88",
        "luongson","sao789","8XBET","mmlive","sin88","may88","9bet",
    ]
    fl = "".join(f'<a href="javascript:void(0)">{x}</a>' for x in flinks)
    return f"""<footer class="site-footer">
  <div class="container">
    <div class="footer-brand">
      <a href="{rel}index.html">
        <img src="{rel}images/logo-1.webp" alt="HH3DTQ" style="height:40px;margin:0 auto;" onerror="this.style.display=&#39;none&#39;; this.nextElementSibling.style.display=&#39;block&#39;;">
        <span style="display:none; font-size:22px; font-weight:900; color:var(--accent);">HH3DTQ</span>
      </a>
      <p class="copyright">Copyright © 2025 HH3DTQ - Phim Hoạt Hình 3D Trung Quốc 4K Thuyết Minh VietSub</p>
      <p class="contact">📱 Contact Telegram: <a href="https://t.me/scanhihi" target="_blank" rel="noopener">@scanhihi</a></p>
      <p style="font-size:12px;color:var(--text-muted);margin-top:4px;"><a href="javascript:void(0)" style="color:var(--text-muted);">Sitemap</a></p>
    </div>
    <div class="footer-links">{fl}</div>
    <div class="footer-bottom">
      <p>HH3DTQ - Kho phim hoạt hình 3D Trung Quốc chất lượng cao. Tất cả nội dung được sưu tầm từ internet.</p>
    </div>
  </div>
</footer>"""

def login_modal():
    """Login modal with auth tabs."""
    return """<div class="modal-overlay" id="loginModal">
  <div class="modal">
    <button class="modal-close">✕</button>
    <h2>🔐 Đăng nhập / Đăng ký</h2>
    <div class="tab-row" style="margin-bottom:15px;">
      <button class="tab-btn active" onclick="switchAuthTab(&#39;login&#39;,this)">Đăng nhập</button>
      <button class="tab-btn" onclick="switchAuthTab(&#39;register&#39;,this)">Đăng ký</button>
    </div>
    <div id="loginTab">
      <div class="tab-row" style="margin-bottom:10px;">
        <button class="tab-btn active" onclick="switchLoginMethod(&#39;email&#39;,this)" style="font-size:12px;">Email</button>
        <button class="tab-btn" onclick="switchLoginMethod(&#39;phone&#39;,this)" style="font-size:12px;">SĐT</button>
      </div>
      <form onsubmit="handleLogin(event);return false;">
        <div class="form-group" id="loginEmailGroup"><label>Email</label><input type="email" id="loginEmail" placeholder="email@example.com" required></div>
        <div class="form-group" id="loginPhoneGroup" style="display:none;"><label>Số điện thoại</label><input type="tel" id="loginPhone" placeholder="0912345678"></div>
        <div class="form-group"><label>Mật khẩu</label><input type="password" id="loginPassword" placeholder="Nhập mật khẩu" required></div>
        <button type="submit" class="btn-submit">Đăng nhập</button>
      </form>
    </div>
    <div id="registerTab" style="display:none;">
      <form onsubmit="handleRegister(event);return false;">
        <div class="form-group"><label>Tên hiển thị</label><input type="text" id="regName" placeholder="Tên của bạn" required></div>
        <div class="form-group"><label>Email</label><input type="email" id="regEmail" placeholder="email@example.com" required></div>
        <div class="form-group"><label>Số điện thoại (tùy chọn)</label><input type="tel" id="regPhone" placeholder="0912345678"></div>
        <div class="form-group"><label>Mật khẩu</label><input type="password" id="regPassword" placeholder="Tối thiểu 6 ký tự" required></div>
        <button type="submit" class="btn-submit">Đăng ký</button>
      </form>
    </div>
  </div>
</div>"""

def scripts(rel=""):
    """Common script includes for all pages."""
    return f"""  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <script src="{rel}js/app.js"></script>
  <script src="{rel}js/main.js"></script>
  <script src="{rel}js/image-map.js"></script>
  <script src="{rel}js/data.js"></script>
  <script src="{rel}js/render.js"></script>"""

def page_wrap(title, desc, active, rel, main_html, extra_script=""):
    """Wrap all partials into a complete HTML page."""
    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
{head(title, desc, rel)}
</head>
<body>

{header(active, rel)}

<main class="container main-content">
{searchbox(rel)}
{main_html}
</main>

{footer(rel)}

{login_modal()}

{scripts(rel)}
{extra_script}
</body>
</html>
"""

if __name__ == "__main__":
    print("partials.py loaded OK")
    print(f"  {len(GENRES)} genres, {len(NAV)} nav items")
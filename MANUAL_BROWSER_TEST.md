# HH3DTQ — Manual Browser Test Checklist

> **Generated**: 2026-08-31  
> **How to use**: Open `https://hh3dtq.site/` in Chrome/Firefox. Open DevTools Console (F12 → Console).  
> Follow each step below, record ACTUAL RESULT and any CONSOLE ERRORs.  
> Credentials: register a test account or use existing credentials.

---

## 1. HOMEPAGE LOAD

| Field | Value |
|-------|-------|
| **Step** | Mở `https://hh3dtq.site/` |
| **Expected** | Trang load không lỗi. Logo hiển thị "HH3DTQ" (text, không phải ảnh). Navigation có 6 mục: Trang chủ, Thể Loại, Top Xem Nhiều, Lịch Chiếu, Hoàn Thành, Mới Cập Nhật. Trending grid hiển thị phim. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 2. CLICK 5 PHIM KHÁC NHAU

| Field | Value |
|-------|-------|
| **Step** | Click lần lượt 5 phim bất kỳ trên homepage |
| **Expected** | Mỗi lần click mở `xem-phim.html?id=...` với đầy đủ thông tin: poster, title, rating, mô tả, danh sách tập. Không có lỗi `esc is not defined`. Không có blank page. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 3. MOVIE DETAIL LOAD

| Field | Value |
|-------|-------|
| **Step** | Sau khi mở detail page của một phim, kiểm tra tất cả thông tin |
| **Expected** | Hiển thị: poster, title, rating, other_name, status, mô tả, thể loại tags, danh sách tập với tab VietSub/Thuyết Minh. Có nút Bookmark. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 4. EPISODE COUNT

| Field | Value |
|-------|-------|
| **Step** | Đếm số tập hiển thị trong danh sách tập của phim |
| **Expected** | Số tập hiển thị khớp với thực tế (có thể kiểm tra với file JSON tại `data/series/{slug}.json`). Nếu admin đã thêm tập qua Firestore, số tập phải phản ánh Firestore. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 5. CLICK EP01 — PLAYER

| Field | Value |
|-------|-------|
| **Step** | Click "▶ Xem" trên Tập 1 |
| **Expected** | Mở `player.html?slug=...&ep=1`. Hiển thị iframe player, episode info (tên phim, tập, loại), episode navigation (prev/next buttons). Không có lỗi JS. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 6. CLICK EP02 — NAVIGATION

| Field | Value |
|-------|-------|
| **Step** | Trong player, click "Tập 2" từ episode navigation |
| **Expected** | Chuyển sang `player.html?slug=...&ep=2`. Player load tập mới. Title cập nhật. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 7. PLAYER FULL TEST

| Field | Value |
|-------|-------|
| **Step** | Test: prev button, next button, "« Đầu" button, "Cuối »" button, "← Quay lại trang phim" link |
| **Expected** | Tất cả buttons hoạt động đúng. Prev không đi xuống dưới 1. Next không vượt quá total. Đầu/Cuối nhảy đúng. Quay lại mở đúng detail page. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 8. HISTORY

| Field | Value |
|-------|-------|
| **Step** | Sau khi xem vài tập, click "Lịch sử" trên header |
| **Expected** | Modal hiển thị danh sách phim đã xem với: poster, title, tập đã xem, thời gian. Click item → mở đúng player page. Có nút xóa từng item và "Xóa tất cả". |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 9. BOOKMARK

| Field | Value |
|-------|-------|
| **Step** | Vào detail page một phim → click "☆ Bookmark". Sau đó click "Bookmark" trên header. |
| **Expected** | Nút đổi thành "★ Đã bookmark". Bookmark modal hiển thị phim đã bookmark. Click "★ Đã bookmark" lần nữa → bỏ bookmark. Modal update. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 10. REGISTER

| Field | Value |
|-------|-------|
| **Step** | Click "Đăng nhập" → tab "Đăng ký". Điền: tên, email mới, password (≥6 ký tự). Submit. |
| **Expected** | Đăng ký thành công → toast "✅ Đăng ký thành công!". Tự động login. Header hiển thị tên user. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 11. REGISTER — VALIDATION

| Field | Value |
|-------|-------|
| **Step** | Test: (a) email không hợp lệ, (b) password < 6 ký tự, (c) thiếu tên, (d) email đã tồn tại |
| **Expected** | Toast lỗi rõ ràng cho từng case: "❌ Email không hợp lệ", "❌ Mật khẩu tối thiểu 6 ký tự", "❌ Vui lòng nhập tên hiển thị", Firebase error cho email đã tồn tại. |
| **Actual** | (a) (b) (c) (d) |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 12. LOGIN

| Field | Value |
|-------|-------|
| **Step** | Logout nếu đang login. Click "Đăng nhập" → tab "Đăng nhập". Điền email + password đã register. Submit. |
| **Expected** | Toast "✅ Đăng nhập thành công!". Header hiển thị tên user + dropdown. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 13. LOGIN — ERROR CASES

| Field | Value |
|-------|-------|
| **Step** | Test: (a) sai password, (b) email không tồn tại, (c) email không hợp lệ |
| **Expected** | Toast lỗi Firebase rõ ràng (VD: "❌ Sai mật khẩu", "❌ Email không tồn tại"). |
| **Actual** | (a) (b) (c) |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 14. LOGOUT

| Field | Value |
|-------|-------|
| **Step** | Click user dropdown → "Đăng Xuất" |
| **Expected** | Toast "👋 Đã đăng xuất". Header trở về trạng thái chưa login (Lịch sử, Bookmark, Đăng nhập). |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 15. HISTORY PERSISTENCE

| Field | Value |
|-------|-------|
| **Step** | Login → xem vài phim → logout → login lại → click "Lịch sử" |
| **Expected** | History vẫn còn các phim đã xem (merge từ Firebase). |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 16. BOOKMARK PERSISTENCE

| Field | Value |
|-------|-------|
| **Step** | Login → bookmark vài phim → logout → login lại → click "Bookmark" |
| **Expected** | Bookmark vẫn còn (merge từ Firebase). |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 17. ADMIN LOGIN

| Field | Value |
|-------|-------|
| **Step** | Login với tài khoản admin → mở `admin.html` |
| **Expected** | Admin panel hiển thị: Dashboard (tổng quan), Anime, Episodes, Trending, Site Config, Comments, Users. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 18. ADMIN — ADD EPISODE

| Field | Value |
|-------|-------|
| **Step** | Admin → Episodes → chọn phim → điền: Số tập, Type (vietsub/thuyetminh), Label, URL → "Thêm Tập" |
| **Expected** | Toast "✅ Đã thêm tập X". Danh sách tập update. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 19. ADMIN — RELOAD EPISODE VERIFICATION

| Field | Value |
|-------|-------|
| **Step** | Sau khi thêm tập, reload admin page → vào Episodes → chọn phim đó |
| **Expected** | Tập vừa thêm vẫn tồn tại trong danh sách. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 20. ADMIN — FRONTEND EPISODE VERIFICATION

| Field | Value |
|-------|-------|
| **Step** | Mở tab mới / browser khác → vào detail page của phim vừa thêm tập |
| **Expected** | Tập mới xuất hiện trong danh sách tập (Firestore-first). |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 21. ADMIN — EDIT TRENDING

| Field | Value |
|-------|-------|
| **Step** | Admin → Trending → tìm phim → thêm vào Trending → sắp xếp thứ tự → "Lưu Trending" |
| **Expected** | Toast "✅ Đã lưu cấu hình Trending". |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 22. ADMIN — RELOAD TRENDING VERIFICATION

| Field | Value |
|-------|-------|
| **Step** | Reload admin → vào Trending |
| **Expected** | Trending list vẫn giữ đúng thứ tự đã lưu. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 23. ADMIN — HOMEPAGE TRENDING VERIFICATION

| Field | Value |
|-------|-------|
| **Step** | Mở tab mới → homepage `index.html` |
| **Expected** | Trending grid hiển thị đúng danh sách và thứ tự admin đã cấu hình. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 24. ADMIN — EDIT SITE CONFIG

| Field | Value |
|-------|-------|
| **Step** | Admin → Site Config → đổi siteName thành "TEST123" → "Lưu Cấu Hình" |
| **Expected** | Toast "✅ Đã lưu cấu hình Site". |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 25. ADMIN — RELOAD SITE CONFIG VERIFICATION

| Field | Value |
|-------|-------|
| **Step** | Reload admin → vào Site Config |
| **Expected** | siteName vẫn là "TEST123". |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 26. SITE CONFIG — FRONTEND VERIFICATION

| Field | Value |
|-------|-------|
| **Step** | Mở tab mới → homepage |
| **Expected** | Header logo và footer đều hiển thị "TEST123" (không phải HH3DTQ). Page title chứa TEST123. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 27. RESTORE SITE CONFIG

| Field | Value |
|-------|-------|
| **Step** | Admin → Site Config → đổi siteName về "HH3DTQ" → "Lưu Cấu Hình" |
| **Expected** | Reload homepage → logo trở lại "HH3DTQ". |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 28. PROFILE MODAL

| Field | Value |
|-------|-------|
| **Step** | Login → click user dropdown → "Thông tin cá nhân" |
| **Expected** | Modal hiển thị: tên, email, UID, ngày tham gia, số lượng history, số lượng bookmark. Không phải toast "đang được phát triển". |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 29. SEARCH

| Field | Value |
|-------|-------|
| **Step** | Từ homepage, gõ tên phim vào ô search → submit |
| **Expected** | Mở `tim-kiem.html?q=...`. Hiển thị kết quả phù hợp. Grid render đúng. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 30. CATEGORY PAGES

| Field | Value |
|-------|-------|
| **Step** | Hover "Thể Loại" → click từng thể loại (Tu Tiên, Tiên Hiệp, ...) |
| **Expected** | Mỗi trang load đúng category. Grid hiển thị phim thuộc thể loại đó. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 31. NAVIGATION LINKS

| Field | Value |
|-------|-------|
| **Step** | Click từng link: Top Xem Nhiều, Lịch Chiếu, Hoàn Thành, Mới Cập Nhật |
| **Expected** | Mỗi trang load đúng: Top Xem Nhiều (sort by rating), Lịch Chiếu (schedule tabs), Hoàn Thành (status=completed), Mới Cập Nhật (sort by date). |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 32. SITEMAP

| Field | Value |
|-------|-------|
| **Step** | Scroll xuống footer → click "Sitemap" |
| **Expected** | Mở `sitemap.html`. Hiển thị links đến tất cả trang chính và 9 category pages. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 33. MOBILE RESPONSIVE

| Field | Value |
|-------|-------|
| **Step** | Mở site trên mobile browser hoặc dùng Chrome DevTools mobile view |
| **Expected** | Layout responsive, navigation usable, player responsive, modals full-width. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## Summary

| Category | Total | Pass | Fail |
|----------|-------|------|------|
| Homepage | | | |
| Detail | | | |
| Player | | | |
| History | | | |
| Bookmark | | | |
| Auth | | | |
| Admin | | | |
| Config | | | |
| Navigation | | | |
| **TOTAL** | **33** | | |

---

## 34. FAVICON / BRAND ICON

| Field | Value |
|-------|-------|
| **Step** | Mở site trên browser. Kiểm tra tab icon. |
| **Expected** | Tab hiển thị icon film reel với H/3D (không phải emoji 🎬). Hiển thị rõ ở 16x16. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 35. FAVICON — ALL PAGES

| Field | Value |
|-------|-------|
| **Step** | Duyệt qua: index.html, xem-phim.html, player.html, admin.html, category pages |
| **Expected** | Tất cả trang đều hiển thị favicon mới. Admin có icon riêng (không phải ⚙). |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 36. APPLE TOUCH ICON

| Field | Value |
|-------|-------|
| **Step** | Thêm site vào home screen trên iOS (hoặc kiểm tra apple-touch-icon trong source) |
| **Expected** | Icon hiển thị đúng (180x180). |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 37. DATA ARCHITECTURE — METADATA FIRESTORE OVERRIDE

| Field | Value |
|-------|-------|
| **Step** | Admin → Anime → sửa title của một phim → Save. Mở detail page phim đó. |
| **Expected** | Title hiển thị giá trị mới (từ Firestore series/{slug}). Không phải giá trị cũ từ JSON. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 38. DATA ARCHITECTURE — EPISODE STATS

| Field | Value |
|-------|-------|
| **Step** | Mở detail page một phim. Kiểm tra Console → tìm `_episode_source` và `available_episode_count`. |
| **Expected** | `_episode_source` = "firestore" hoặc "json_fallback". `available_episode_count` = số tập thực tế. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 39. DATA ARCHITECTURE — FALLBACK WARNING

| Field | Value |
|-------|-------|
| **Step** | Disconnect network (DevTools → Network → Offline) → reload detail page. |
| **Expected** | Console hiển thị warning: "[HH3DTQ] Using JSON fallback...". Trang vẫn hiển thị dữ liệu từ JSON. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 40. ADMIN AUDIT LOG

| Field | Value |
|-------|-------|
| **Step** | Admin → thực hiện một action (sửa anime, thêm tập, sửa trending, sửa site config). Kiểm tra Firestore `audit_log` collection. |
| **Expected** | Collection `audit_log` có document mới với: timestamp, admin_uid, admin_email, action, target, detail, result. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 41. ADMIN AUTH — NON-ADMIN ACCESS

| Field | Value |
|-------|-------|
| **Step** | Login với tài khoản thường (không phải admin). Mở admin.html. |
| **Expected** | Admin panel không load. Không thấy dashboard, form, buttons. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 42. ADMIN AUTH — LOGOUT REVOKES

| Field | Value |
|-------|-------|
| **Step** | Login admin → admin.html hiển thị → logout → admin.html |
| **Expected** | Admin panel biến mất. Không thể truy cập admin functions. |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## 43. FOOTER PLACEHOLDER LINKS

| Field | Value |
|-------|-------|
| **Step** | Click một partner link bất kỳ trong footer |
| **Expected** | Không hiển thị toast "đang được phát triển". Link không làm gì (SEO backlink). |
| **Actual** | |
| **PASS/FAIL** | |
| **Console Error** | |

---

## Summary

| Category | Total | Pass | Fail |
|----------|-------|------|------|
| Homepage | | | |
| Detail | | | |
| Player | | | |
| History | | | |
| Bookmark | | | |
| Auth | | | |
| Admin | | | |
| Config | | | |
| Navigation | | | |
| Icon/Branding | | | |
| Data Architecture | | | |
| Admin Audit | | | |
| **TOTAL** | **43** | | |
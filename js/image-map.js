// Image URL map for all anime posters
// Maps slug to correct hoathinh3d.ee CDN URL
var hh3dtqImageMap = {
  'tien-nghich': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/tien-nghich-300x450.webp',
  'muc-than-ky': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/muc-than-ky-2-300x450.webp',
  'dau-pha-thuong-khung': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/dau-pha-thuong-khung-phan-5-gia-nam-hoc-vien-1-1-300x450.webp',
  'phan-nhan-tu-tien': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/pham-nhan-tu-tien-phan-4-300x450.webp',
  'the-gioi-hoan-my': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/The-Gioi-Hoan-My-poster-4-300x450.webp',
  'gia-thien': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Gia-Thien-300x450.webp',
  'dau-la-dai-luc-2': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Dau-La-Dai-Luc-2-Tuyet-The-Duong-Mon-1-300x450.webp',
  'thon-phe-tinh-khong': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Thon-Phe-Tinh-Khong-300x450.webp',
  'thuong-nguyen-do': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/photo_2026-03-13_09-30-47-300x450.webp',
  'van-tham-bat-tri-mong': 'https://hoathinh3d.ee/wp-content/uploads/2025/07/Van-Tham-Bat-Tri-Mong-1-300x450.webp',
  'tru-tien': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Tru-Tien-Phan-3-300x450.jpg',
  'vo-luyen-dinh-phong': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Vo-Than-Chua-Te-300x450.webp',
  'nghich-thien-ta-than': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Nghich-Thien-Ta-Than-3D-300x450.webp',
  'dai-chua-te': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Dai-Chua-Te-2-300x450.webp',
  'van-gioi-doc-ton': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Van-Gioi-Doc-Ton-300x450.webp',
  'vo-thuong-than-de': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Vo-Thuong-Than-De-300x450.webp',
  'than-an-ky': 'https://hoathinh3d.ee/wp-content/uploads/2024/11/Yeu-Than-Ky-Poster-5-300x450.jpg',
  'than-tai-dau-chiem-long': 'https://hoathinh3d.ee/wp-content/uploads/2026/07/Than-Tai-Dau-Chiem-Long-300x450.jpg',
  'thai-co-than-ton': 'https://hoathinh3d.ee/wp-content/uploads/2026/07/Thai-Co-Than-Ton-300x450.png',
  'quang-am-chi-ngoai': 'https://hoathinh3d.ee/wp-content/uploads/2025/12/Quang-Am-Chi-Ngoai-1-300x450.webp',
  'trach-nhat-phi-thang': 'https://hoathinh3d.ee/wp-content/uploads/2026/07/Trach-Nhat-Phi-Thang-4-300x450.jpg',
  'nguoi-dai-dien-thoi-gian': 'https://hoathinh3d.ee/wp-content/uploads/2026/08/Nguoi-Dai-Dien-Thoi-Gian-Phan-3-300x450.jpg',
  'son-hai-kinh': 'https://hoathinh3d.ee/wp-content/uploads/2026/07/Son-Hai-Kinh-Thiet-Lap-Lai-Trat-Tu-300x450.jpg',
  'phap-su-tu-linh': 'https://hoathinh3d.ee/wp-content/uploads/2026/07/Phap-Su-Tu-Linh-Ta-Chinh-La-Thien-Tai-300x450.png',
  'hoc-vien-cao-vo': 'https://hoathinh3d.ee/wp-content/uploads/2026/07/hocviencaovo-300x450.jpg',
  'dao-yeu-hanh': 'https://hoathinh3d.ee/wp-content/uploads/2026/03/Dao-Yeu-Hanh-300x450.webp',
  'con-ra-the-thong-gi-nua': 'https://hoathinh3d.ee/wp-content/uploads/2026/08/Con-Ra-The-Thong-Gi-Nua-Phan-2-300x450.jpg'
};

function getAnimeImage(slug) {
  return hh3dtqImageMap[slug] || ('https://hoathinh3d.ee/wp-content/uploads/2024/11/' + slug + '-300x450.webp');
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.anime-card .card-img img, .episode-card .card-img img').forEach(function(img) {
    var baseSrc = img.src;
    for (var key in hh3dtqImageMap) {
      if (baseSrc.indexOf(key) !== -1) {
        img.src = hh3dtqImageMap[key];
        break;
      }
    }
    if (img.src.indexOf('2025/06/') !== -1) {
      img.src = img.src.replace('2025/06/', '2024/11/');
    }
    img.onerror = function() {
      this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="%231a1a1a" width="300" height="450"/><text fill="%23f5a623" x="150" y="225" text-anchor="middle" font-size="40">🎬</text></svg>';
    };
  });
});

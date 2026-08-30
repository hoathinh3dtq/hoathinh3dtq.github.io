// Image URL map for all anime posters
// Maps slug to correct hoathinh3d.ee CDN URL
var hh3dtqImageMap = {
  'tien-nghich': 'images/tien-nghich-300x450.webp',
  'muc-than-ky': 'images/muc-than-ky-2-300x450.webp',
  'dau-pha-thuong-khung': 'images/dau-pha-thuong-khung-phan-5-gia-nam-hoc-vien-1-1-300x450.webp',
  'phan-nhan-tu-tien': 'images/pham-nhan-tu-tien-phan-4-300x450.webp',
  'the-gioi-hoan-my': 'images/The-Gioi-Hoan-My-poster-4-300x450.webp',
  'gia-thien': 'images/Gia-Thien-300x450.webp',
  'dau-la-dai-luc-2': 'images/Dau-La-Dai-Luc-2-Tuyet-The-Duong-Mon-1-300x450.webp',
  'thon-phe-tinh-khong': 'images/Thon-Phe-Tinh-Khong-300x450.webp',
  'thuong-nguyen-do': 'images/photo_2026-03-13_09-30-47-300x450.webp',
  'van-tham-bat-tri-mong': 'images/Van-Tham-Bat-Tri-Mong-1-300x450.webp',
  'tru-tien': 'images/Tru-Tien-Phan-3-300x450.jpg',
  'vo-luyen-dinh-phong': 'images/Vo-Than-Chua-Te-300x450.webp',
  'nghich-thien-ta-than': 'images/Nghich-Thien-Ta-Than-3D-300x450.webp',
  'dai-chua-te': 'images/Dai-Chua-Te-2-300x450.webp',
  'van-gioi-doc-ton': 'images/Van-Gioi-Doc-Ton-300x450.webp',
  'vo-thuong-than-de': 'images/Vo-Thuong-Than-De-300x450.webp',
  'than-an-ky': 'images/Yeu-Than-Ky-Poster-5-300x450.jpg',
  'than-tai-dau-chiem-long': 'images/Than-Tai-Dau-Chiem-Long-300x450.jpg',
  'thai-co-than-ton': 'images/Thai-Co-Than-Ton-300x450.png',
  'quang-am-chi-ngoai': 'images/Quang-Am-Chi-Ngoai-1-300x450.webp',
  'trach-nhat-phi-thang': 'images/Trach-Nhat-Phi-Thang-4-300x450.jpg',
  'nguoi-dai-dien-thoi-gian': 'images/Nguoi-Dai-Dien-Thoi-Gian-Phan-3-300x450.jpg',
  'son-hai-kinh': 'images/Son-Hai-Kinh-Thiet-Lap-Lai-Trat-Tu-300x450.jpg',
  'phap-su-tu-linh': 'images/Phap-Su-Tu-Linh-Ta-Chinh-La-Thien-Tai-300x450.png',
  'hoc-vien-cao-vo': 'images/hocviencaovo-300x450.jpg',
  'dao-yeu-hanh': 'images/Dao-Yeu-Hanh-300x450.webp',
  'con-ra-the-thong-gi-nua': 'images/Con-Ra-The-Thong-Gi-Nua-Phan-2-300x450.jpg'
};

function getAnimeImage(slug) {
  return hh3dtqImageMap[slug] || ('images/' + slug + '-300x450.webp');
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

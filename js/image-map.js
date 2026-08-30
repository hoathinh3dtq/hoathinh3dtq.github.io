/* === HH3DTQ - Image URL Mapping === */
// Maps anime slugs to local image files
// Auto-generated - all images served locally from images/

var ANIME_IMAGE_MAP = {
  "dai-chua-te": "images/Dai-Chua-Te-2-300x450.webp",
  "dau-la-dai-luc-2": "images/Dau-La-Dai-Luc-2-Tuyet-The-Duong-Mon-1-300x450.webp",
  "dau-pha-thuong-khung": "images/dau-pha-thuong-khung-phan-5-gia-nam-hoc-vien-1-1-300x450.webp",
  "gia-thien": "images/Gia-Thien-300x450.webp",
  "kiem-lai": "images/Gia-Thien-300x450.webp",
  "linh-kiem-ton": "images/Vo-Thuong-Than-De-300x450.webp",
  "muc-than-ky": "images/muc-than-ky-2-300x450.webp",
  "nghich-thien-ta-than": "images/Nghich-Thien-Ta-Than-3D-300x450.webp",
  "nguyen-ton": "images/Than-Y-Co-Dai-O-Do-Thi-300x450.webp",
  "nhat-the-doc-ton": "images/Nghich-Thien-Chi-Ton-300x450.webp",
  "phan-nhan-tu-tien": "images/pham-nhan-tu-tien-phan-4-300x450.webp",
  "than-mu": "images/Thai-Co-Than-Ton-300x450.png",
  "the-gioi-hoan-my": "images/The-Gioi-Hoan-My-poster-4-300x450.webp",
  "thon-phe-tinh-khong": "images/Thon-Phe-Tinh-Khong-300x450.webp",
  "thuong-nguyen-do": "images/photo_2026-03-13_09-30-47-300x450.webp",
  "tien-nghich": "images/tien-nghich-300x450.webp",
  "tru-tien": "images/Tru-Tien-Phan-3-300x450.jpg",
  "van-co-than-de": "images/Vo-Thuong-Than-De-300x450.webp",
  "van-gioi-doc-ton": "images/Van-Gioi-Doc-Ton-300x450.webp",
  "van-tham-bat-tri-mong": "images/Van-Tham-Bat-Tri-Mong-1-300x450.webp",
  "vo-dong-can-khon": "images/Tuyet-The-Chien-Hon-3D-300x450.webp",
  "vo-luyen-dinh-phong": "images/Vo-Than-Chua-Te-300x450.webp",
};

function getAnimeImage(slug) {
  if (ANIME_IMAGE_MAP[slug]) return ANIME_IMAGE_MAP[slug];
  // Try common patterns
  return "images/" + slug + "-300x450.webp";
}

// Fix all img src at runtime
document.addEventListener("DOMContentLoaded", function() {
  // Replace any remaining CDN URLs
  var imgs = document.querySelectorAll('img[src*="hoathinh3d"], img[src*="wp-content"]');
  imgs.forEach(function(img) {
    var src = img.getAttribute("src");
    // Try to extract slug from URL
    var match = src.match(/uploads\/\d+\/\d+\/([^\/]+)-300x450/);
    if (match) {
      var slug = match[1];
      if (ANIME_IMAGE_MAP[slug]) {
        img.src = ANIME_IMAGE_MAP[slug];
      }
    }
    img.onerror = function() {
      this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22><rect fill=%22%23111%22 width=%22300%22 height=%22450%22/><text fill=%22%23f5a623%22 x=%22150%22 y=%22225%22 text-anchor=%22middle%22 font-size=%2240%22>🎬</text></svg>';
    };
  });
  
  // Add error fallback to all images
  document.querySelectorAll('img').forEach(function(img) {
    if (!img.hasAttribute('data-error-bound')) {
      img.setAttribute('data-error-bound', '1');
      img.addEventListener('error', function() {
        this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22><rect fill=%22%23111%22 width=%22300%22 height=%22450%22/><text fill=%22%23f5a623%22 x=%22150%22 y=%22225%22 text-anchor=%22middle%22 font-size=%2240%22>🎬</text></svg>';
      });
    }
  });
});

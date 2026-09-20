/* ============================================================
   Bobby's Brigade — Photo gallery
   Reads the "Photos" tab of the same Google Sheet used for
   Events, via the same Apps Script Web App. See README.
   ============================================================ */

var GALLERY_API_URL = "https://script.google.com/macros/s/AKfycbxPMHFY2pmKaIkmGSqrEEhVBRV3USMG6sVvDB9YYcS8YKOwfeIC41XFJQgkagVABPho/exec";
var galleryPhotos = [];

function escapeHtmlG(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderGallery(photos, yearFilter) {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  var filtered = yearFilter && yearFilter !== 'all'
    ? photos.filter(function (p) { return p.year === yearFilter; })
    : photos;

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state">No photos yet for this year.</div>';
    return;
  }

  grid.innerHTML = filtered.map(function (p) {
    return (
      '<figure class="gallery-item" data-reveal>' +
        '<img src="' + escapeHtmlG(p.image) + '" alt="' + escapeHtmlG(p.caption || 'Bobby\u2019s Brigade event photo') + '" loading="lazy">' +
        (p.caption ? '<figcaption>' + escapeHtmlG(p.caption) + (p.year ? ' <span class="gallery-year">' + escapeHtmlG(p.year) + '</span>' : '') + '</figcaption>' : '')  +
      '</figure>'
    );
  }).join('');
}

function buildYearFilters(photos) {
  var bar = document.getElementById('gallery-filters');
  if (!bar) return;

  var years = Array.from(new Set(photos.map(function (p) { return p.year; }).filter(Boolean)));
  years.sort().reverse();

  if (!years.length) { bar.innerHTML = ''; return; }

  var buttons = ['<button class="filter-btn active" data-year="all">All Years</button>']
    .concat(years.map(function (y) {
      return '<button class="filter-btn" data-year="' + escapeHtmlG(y) + '">' + escapeHtmlG(y) + '</button>';
    }));
  bar.innerHTML = buttons.join('');

  bar.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      bar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderGallery(galleryPhotos, btn.getAttribute('data-year'));
    });
  });
}

function loadGallery() {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;

  if (!GALLERY_API_URL || GALLERY_API_URL.indexOf('PASTE_YOUR') === 0) {
    grid.innerHTML = '<div class="empty-state">Photos will appear here once the Google Sheet is connected \u2014 see setup instructions.</div>';
    return;
  }

  fetch(GALLERY_API_URL + '?action=photos')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      galleryPhotos = data.photos || [];
      buildYearFilters(galleryPhotos);
      renderGallery(galleryPhotos, 'all');
    })
    .catch(function () {
      grid.innerHTML = '<div class="empty-state">Couldn\'t load photos right now \u2014 please check back shortly.</div>';
    });
}

document.addEventListener('DOMContentLoaded', loadGallery);

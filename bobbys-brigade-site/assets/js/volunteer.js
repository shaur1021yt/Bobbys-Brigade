/* ============================================================
   Bobby's Brigade — Volunteer portal
   Reads events from, and writes signups to, a single Google Sheet
   via an Apps Script Web App. See README-google-sheets.md.
   ============================================================ */

// SETUP: paste your deployed Apps Script Web App URL here.
// It ends in /exec — see README-google-sheets.md for how to get it.
var SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxPMHFY2pmKaIkmGSqrEEhVBRV3USMG6sVvDB9YYcS8YKOwfeIC41XFJQgkagVABPho/exec";

var MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
var currentEvents = [];

function toDate(str) {
  var d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderEvents(events) {
  var container = document.getElementById('events-list');
  var select = document.getElementById('signup-event');
  if (!container) return;

  if (!events.length) {
    container.innerHTML = '<div class="empty-state">No events posted yet — check back soon, or follow us on Facebook / Instagram for the next announcement.</div>';
    if (select) select.innerHTML = '<option value="">No events posted yet</option>';
    return;
  }

  events.sort(function (a, b) {
    var da = toDate(a.date), db = toDate(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da - db;
  });

  container.innerHTML = events.map(function (ev) {
    var d = toDate(ev.date);
    var mon = d ? MONTHS[d.getMonth()] : '\u2014';
    var day = d ? d.getDate() : '?';
    var imageHtml = ev.image
      ? '<img src="' + escapeHtml(ev.image) + '" alt="' + escapeHtml(ev.name) + '" style="width:100%;height:150px;object-fit:cover;border-radius:10px;margin-bottom:14px;">'
      : '';
    return (
      '<div class="event-card" data-reveal>' +
        '<div class="event-date"><span class="mon">' + mon + '</span><span class="day">' + day + '</span></div>' +
        '<div class="event-body" style="width:100%;">' +
          imageHtml +
          '<h3>' + escapeHtml(ev.name) + '</h3>' +
          '<div class="event-meta">' +
            (ev.date ? '<span>\uD83D\uDCC5 ' + escapeHtml(ev.date) + '</span>' : '') +
            (ev.time ? '<span>\uD83D\uDD52 ' + escapeHtml(ev.time) + '</span>' : '') +
            (ev.location ? '<span>\uD83D\uDCCD ' + escapeHtml(ev.location) + '</span>' : '') +
          '</div>' +
          (ev.description ? '<p>' + escapeHtml(ev.description) + '</p>' : '') +
        '</div>' +
      '</div>'
    );
  }).join('');

  if (select) {
    select.innerHTML = events.map(function (ev) {
      return '<option value="' + escapeHtml(ev.name) + '">' + escapeHtml(ev.name) + '</option>';
    }).join('');
  }
}

function loadEvents() {
  var container = document.getElementById('events-list');
  if (!container) return;

  if (!SHEET_API_URL || SHEET_API_URL.indexOf('PASTE_YOUR') === 0) {
    container.innerHTML = '<div class="empty-state">Events will appear here once the Google Sheet is connected — see setup instructions.</div>';
    return;
  }

  fetch(SHEET_API_URL + '?action=events')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      currentEvents = data.events || [];
      renderEvents(currentEvents);
    })
    .catch(function () {
      container.innerHTML = '<div class="empty-state">Couldn\'t load events right now — please check back shortly.</div>';
    });
}

function handleSignupSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var statusEl = document.getElementById('signup-status');
  var submitBtn = form.querySelector('button[type="submit"]');

  if (!SHEET_API_URL || SHEET_API_URL.indexOf('PASTE_YOUR') === 0) {
    statusEl.textContent = 'Signup isn\u2019t connected yet — please check back soon.';
    statusEl.style.color = '#b23b3b';
    return;
  }

  var formData = new FormData(form);
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing you up\u2026';

  // Apps Script Web Apps don't return CORS headers, so we send the
  // request in no-cors mode. We can't read the response, but the
  // submission still goes through and the row still gets written.
  fetch(SHEET_API_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).then(function () {
    statusEl.textContent = '\u2705 You\u2019re signed up! We\u2019ll be in touch with details.';
    statusEl.style.color = '#1a7f4b';
    form.reset();
  }).catch(function () {
    statusEl.textContent = 'Something went wrong \u2014 please try again or contact us directly.';
    statusEl.style.color = '#b23b3b';
  }).finally(function () {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadEvents();
  var form = document.getElementById('signup-form');
  if (form) form.addEventListener('submit', handleSignupSubmit);
});

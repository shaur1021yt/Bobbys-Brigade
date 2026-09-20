/**
 * Bobby's Brigade — Volunteer Portal backend
 * ------------------------------------------------
 * Paste this whole file into Extensions > Apps Script in the
 * Google Sheet you want to use, then deploy as a Web App.
 * Full step-by-step is in README-google-sheets.md.
 *
 * Sheet requirements:
 *  - A tab named exactly "Events" with header row:
 *      Event Name | Date | Time | Location | Description | Image URL
 *  - Nothing else required — signup tabs are created automatically.
 */

var EVENTS_TAB_NAME = "Events";
var PHOTOS_TAB_NAME = "Photos";

// ---------- Handles the site READING data (GET) ----------
function doGet(e) {
  var action = (e.parameter.action || "events").toLowerCase();
  if (action === "photos") {
    return getPhotos();
  }
  return getEvents();
}

function getEvents() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(EVENTS_TAB_NAME);
  if (!sheet) {
    return jsonResponse({ error: "Events tab not found" });
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return jsonResponse({ events: [] });
  }

  var headers = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var idx = {
    name: headers.indexOf("event name"),
    date: headers.indexOf("date"),
    time: headers.indexOf("time"),
    location: headers.indexOf("location"),
    description: headers.indexOf("description"),
    image: headers.indexOf("image url")
  };

  var events = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[idx.name]) continue; // skip blank rows
    events.push({
      name: String(row[idx.name] || ""),
      date: formatDateCell(row[idx.date]),
      time: String(idx.time > -1 ? row[idx.time] : ""),
      location: String(idx.location > -1 ? row[idx.location] : ""),
      description: String(idx.description > -1 ? row[idx.description] : ""),
      image: String(idx.image > -1 ? row[idx.image] : "")
    });
  }

  return jsonResponse({ events: events });
}

function getPhotos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(PHOTOS_TAB_NAME);
  if (!sheet) {
    return jsonResponse({ photos: [] });
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) {
    return jsonResponse({ photos: [] });
  }

  var headers = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var idx = {
    image: headers.indexOf("image url"),
    caption: headers.indexOf("caption"),
    year: headers.indexOf("year")
  };

  var photos = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[idx.image]) continue; // skip blank rows
    photos.push({
      image: String(row[idx.image] || ""),
      caption: String(idx.caption > -1 ? row[idx.caption] : ""),
      year: String(idx.year > -1 ? row[idx.year] : "")
    });
  }

  return jsonResponse({ photos: photos });
}

// ---------- Handles the site WRITING a signup (POST) ----------
function doPost(e) {
  var params = e.parameter;
  var eventName = (params.eventName || "General Signup").toString().trim();
  var name = (params.name || "").toString().trim();
  var email = (params.email || "").toString().trim();
  var phone = (params.phone || "").toString().trim();
  var notes = (params.notes || "").toString().trim();

  if (!name || !email) {
    return jsonResponse({ success: false, error: "Name and email are required." });
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabName = safeTabName(eventName);
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Notes"]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
  }

  sheet.appendRow([new Date(), name, email, phone, notes]);

  return jsonResponse({ success: true });
}

// ---------- Optional: auto-create an empty signup tab the moment
// a new event is typed into the Events tab, so it's ready before
// anyone signs up. Set this as an installable trigger (see README). ----------
function onEventsEdited(e) {
  var sheet = e.range.getSheet();
  if (sheet.getName() !== EVENTS_TAB_NAME) return;
  if (e.range.getRow() === 1) return; // header row

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h).trim().toLowerCase(); });
  var nameCol = headers.indexOf("event name") + 1;
  if (nameCol === 0) return;

  var eventName = sheet.getRange(e.range.getRow(), nameCol).getValue();
  if (!eventName) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabName = safeTabName(eventName);
  if (!ss.getSheetByName(tabName)) {
    var newSheet = ss.insertSheet(tabName);
    newSheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Notes"]);
    newSheet.getRange(1, 1, 1, 5).setFontWeight("bold");
  }
}

// ---------- Helpers ----------
function safeTabName(name) {
  var clean = name.replace(/[\[\]\*\?\/\\:]/g, "").trim();
  if (clean.length > 90) clean = clean.substring(0, 90);
  return clean || "Signups";
}

function formatDateCell(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value || "");
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

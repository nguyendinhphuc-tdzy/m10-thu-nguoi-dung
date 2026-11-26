/**
 * Thử với người dùng M10 (P03 "Made in…?", Nhóm 02): bản người thử tự làm.
 * Gắn script này vào một Google Sheet của nhóm (Tiện ích mở rộng > Apps Script),
 * rồi Triển khai > Tùy chọn triển khai mới > Ứng dụng web: "Thực thi với tư cách: Tôi", "Ai có quyền truy cập: Bất kỳ ai".
 * Sheet tự tạo 3 trang tính: sessions (mỗi người một dòng), responses (mỗi nhiệm vụ một dòng), contacts (liên hệ, không gắn mã).
 * Trang không chứa đáp án; notebooks/M10/07_evaluation_M10.ipynb chấm từ trang tính responses.
 */
const APP = "m10-tu-lam-1.0";
const SESS_COLS = ["user_id", "mode", "status", "started_at", "finished_at", "user_type", "seen_group_charts",
  "did_other_test", "eligible", "screen", "viewport", "user_agent", "app_version", "final_q1", "final_q2", "final_q3"];
const RESP_COLS = ["user_id", "mode", "user_type", "task_id", "answer_country", "answer_country_other", "answer_section",
  "answer_number", "answer_choice", "answer_reason", "answer_text", "method", "difficulty", "hints", "hint_at_s",
  "seconds", "load_s", "timed_out", "skipped", "left_page", "charts_used", "app_version", "saved_at"];
const TASK_IDS = ["F5", "T1", "T2", "T3", "T4", "T5"];

/** Nhận dữ liệu từ trang chạy trên GitHub Pages: body JSON {fn, args}. Chỉ cho gọi các hàm dưới đây. */
const API_FNS = {startSession: startSession, logIneligible: logIneligible, saveSession: saveSession,
  withdraw: withdraw, saveContact: saveContact};
function doPost(e) {
  let out;
  try {
    const req = JSON.parse(e.postData.contents);
    const fn = API_FNS[req.fn];
    if (!fn) throw new Error("Không có hàm " + req.fn);
    out = {ok: true, result: fn.apply(null, Array.isArray(req.args) ? req.args : [])};
  } catch (err) {
    out = {ok: false, error: String(err && err.message || err)};
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("M10 API đang chạy. Trang cho người thử nằm trên GitHub Pages.");
}

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function rows_(sh, ncol) {
  const n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, ncol).getValues() : [];
}

function sessionRow_(code, status, m, now) {
  return [code, s_(m.mode), status, now, "", s_(m.user_type), s_(m.seen_group_charts), s_(m.did_other_test),
    s_(m.eligible), s_(m.screen), s_(m.viewport), s_(m.user_agent), s_(m.app_version) || APP, "", "", ""];
}

/** Cấp mã U1, U2… (người thử thật) hoặc P1, P2… (chạy thử, link có ?pilot=1). */
function startSession(meta) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_("sessions", SESS_COLS);
    const vals = rows_(sh, SESS_COLS.length);
    const m = meta || {};
    const prefix = m.mode === "pilot" ? "P" : "U";
    const n = vals.filter(function (r) { return String(r[0]).charAt(0) === prefix; }).length + 1;
    const code = prefix + n;
    sh.appendRow(sessionRow_(code, "đang làm", m, new Date()));
    return {participant: code};
  } finally {
    lock.releaseLock();
  }
}

/** Người không đủ điều kiện (đã xem biểu đồ của nhóm hoặc đã làm bài thử khác): chỉ ghi để đếm, mã X1, X2… */
function logIneligible(meta) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_("sessions", SESS_COLS);
    const vals = rows_(sh, SESS_COLS.length);
    const n = vals.filter(function (r) { return String(r[0]).charAt(0) === "X"; }).length + 1;
    sh.appendRow(sessionRow_("X" + n, "không đủ điều kiện", meta || {}, new Date()));
    return {ok: true};
  } finally {
    lock.releaseLock();
  }
}

/** Lưu 6 dòng (F5, T1 đến T5) một lần khi người thử bấm Gửi. Từ chối nếu mã không có hoặc đã lưu. */
function saveSession(code, rows, fin) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_("sessions", SESS_COLS);
    const vals = rows_(sh, SESS_COLS.length);
    const i = vals.findIndex(function (r) { return r[0] === code; });
    if (i < 0) throw new Error("Không có mã " + code);
    if (vals[i][2] === "hoàn tất") throw new Error("Mã " + code + " đã được lưu");
    if (!Array.isArray(rows) || rows.length !== TASK_IDS.length) throw new Error("Cần đúng " + TASK_IDS.length + " dòng");
    const ids = rows.map(function (r) { return r.task_id; }).join(",");
    if (ids !== TASK_IDS.join(",")) throw new Error("Thứ tự nhiệm vụ không đúng: " + ids);
    const now = new Date();
    const out = rows.map(function (r) {
      return RESP_COLS.map(function (c) {
        if (c === "saved_at") return now;
        if (c === "user_id") return code;
        const v = r[c];
        return v === undefined || v === null ? "" : (typeof v === "number" ? v : s_(v, 2000));
      });
    });
    const rs = sheet_("responses", RESP_COLS);
    rs.getRange(rs.getLastRow() + 1, 1, out.length, RESP_COLS.length).setValues(out);
    const f = fin || {};
    sh.getRange(i + 2, 3, 1, 3).setValues([["hoàn tất", vals[i][3], now]]);
    sh.getRange(i + 2, 14, 1, 3).setValues([[s_(f.final_q1, 2000), s_(f.final_q2, 2000), s_(f.final_q3, 2000)]]);
    return {ok: true};
  } finally {
    lock.releaseLock();
  }
}

/** Người thử bấm Dừng: đánh dấu, không lưu câu trả lời; mã không cấp lại. */
function withdraw(code) {
  const sh = sheet_("sessions", SESS_COLS);
  const vals = rows_(sh, SESS_COLS.length);
  const i = vals.findIndex(function (r) { return r[0] === code; });
  if (i >= 0 && vals[i][2] === "đang làm") sh.getRange(i + 2, 3).setValue("đã dừng");
  return {ok: true};
}

/** Liên hệ để giảng viên xác minh: lưu riêng, không có mã người thử, chỉ có ngày. */
function saveContact(contact) {
  const sh = sheet_("contacts", ["date", "contact"]);
  sh.appendRow([Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy"), s_(contact, 120)]);
  return {ok: true};
}

function s_(v, n) { return v === undefined || v === null ? "" : String(v).slice(0, n || 500); }

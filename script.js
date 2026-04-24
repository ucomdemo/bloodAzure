const STORAGE_KEY = "bp-records";
const THEME_KEY = "theme";

const form = document.getElementById("bp-form");
const list = document.getElementById("record-list");
const emptyState = document.getElementById("empty-state");
const clearAllButton = document.getElementById("clear-all");
const formMessage = document.getElementById("form-message");
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀" : "🌙";
  themeToggle.setAttribute("aria-label", theme === "dark" ? "切換淺色模式" : "切換深色模式");
}

applyTheme(localStorage.getItem(THEME_KEY) || "light");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

let records = loadRecords();
renderRecords();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const systolic = Number(form.systolic.value.trim());
  const diastolic = Number(form.diastolic.value.trim());
  const pulse = Number(form.pulse.value.trim());
  const medication = form.medication.value;
  const note = form.note.value.trim();

  if (!isValidReading(systolic, diastolic, pulse)) {
    formMessage.textContent = "請輸入有效的數值（需大於 0，且收縮壓應高於舒張壓）。";
    return;
  }

  const now = new Date();
  const record = {
    id: crypto.randomUUID(),
    systolic,
    diastolic,
    pulse,
    medication,
    note,
    createdAt: now.toISOString()
  };

  records.unshift(record);
  saveRecords();
  renderRecords();

  form.reset();
  form.medication.value = "無";
  formMessage.style.color = "var(--accent)";
  formMessage.textContent = "已新增紀錄。";
});

clearAllButton.addEventListener("click", () => {
  if (!records.length) {
    return;
  }

  const ok = confirm("確定要清除全部血壓紀錄嗎？");
  if (!ok) {
    return;
  }

  records = [];
  saveRecords();
  renderRecords();
  formMessage.style.color = "var(--accent)";
  formMessage.textContent = "已清除全部紀錄。";
});

function isValidReading(systolic, diastolic, pulse) {
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic) || !Number.isFinite(pulse)) {
    return false;
  }

  if (systolic <= 0 || diastolic <= 0 || pulse <= 0) {
    return false;
  }

  return systolic > diastolic;
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function renderRecords() {
  list.innerHTML = "";

  if (!records.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  const fragment = document.createDocumentFragment();

  for (const record of records) {
    const item = document.createElement("li");
    item.className = "record-item";

    const time = formatDateTime(record.createdAt);
    const note = record.note ? `備註：${escapeHTML(record.note)}` : "備註：-";

    item.innerHTML = `
      <div class="record-main">
        <span class="bp">${record.systolic}/${record.diastolic} mmHg</span>
        <span class="pulse">脈搏 ${record.pulse} bpm</span>
        <span class="med">藥物：${escapeHTML(record.medication)}</span>
        <span class="time">${time}</span>
      </div>
      <p class="note">${note}</p>
    `;

    fragment.appendChild(item);
  }

  list.appendChild(fragment);
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "時間格式錯誤";
  }

  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function escapeHTML(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

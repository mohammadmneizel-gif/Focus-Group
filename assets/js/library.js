/* ===========================================================
   Online Focus Group — Library Page Logic
   Lists active scripts from the backend, lets the participant
   pick one, and sends them into the reader.
   =========================================================== */

// ---------- 1. Guard ----------
const fullName = sessionStorage.getItem("ofg_fullName");
const phone = sessionStorage.getItem("ofg_phone");
const ndaAccepted = sessionStorage.getItem("ofg_ndaAccepted");
const sessionToken = sessionStorage.getItem("ofg_sessionToken");

if (!fullName || !phone) {
  window.location.href = "index.html";
} else if (ndaAccepted !== "Yes") {
  window.location.href = "nda.html";
}

// ---------- 2. Translations ----------
const translations = {
  ar: {
    eyebrow: "مجموعة تركيز خاصة", title: "النصوص المتاحة", subtitle: "اختر نصاً لقراءته",
    emptyState: "لا توجد نصوص متاحة حالياً", cta: "اضغط للقراءة", reviewed: "تم التقييم",
    toggleLabel: "English"
  },
  en: {
    eyebrow: "Private Focus Group", title: "Available Scripts", subtitle: "Choose one to read",
    emptyState: "No scripts are available right now", cta: "Tap to read", reviewed: "Reviewed",
    toggleLabel: "العربية"
  }
};

let currentLang = sessionStorage.getItem("ofg_lang") || "ar";

function applyLanguage(lang) {
  currentLang = lang;
  const html = document.documentElement;
  html.setAttribute("lang", lang);
  html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  const dict = translations[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  document.getElementById("langToggle").textContent = dict.toggleLabel;
  sessionStorage.setItem("ofg_lang", lang);
  renderScripts(); // re-render so card labels update too
}

document.getElementById("langToggle").addEventListener("click", () => {
  applyLanguage(currentLang === "ar" ? "en" : "ar");
});

// ---------- 3. Fetch and render scripts ----------
let scriptsCache = [];

async function loadLibrary() {
  const result = await listScripts(sessionToken);

  if (!result.success || !result.scripts.length) {
    document.getElementById("emptyState").hidden = false;
    return;
  }

  scriptsCache = result.scripts;
  renderScripts();
}

function renderScripts() {
  const grid = document.getElementById("scriptGrid");
  grid.innerHTML = "";

  const completed = JSON.parse(sessionStorage.getItem("ofg_completedScripts") || "[]");
  const dict = translations[currentLang];

  scriptsCache.forEach((script) => {
    const card = document.createElement("div");
    card.className = "script-card";

    const isDone = completed.includes(script.scriptId);

    card.innerHTML = `
      ${isDone ? `<span class="script-card__badge">${dict.reviewed}</span>` : ""}
      <div class="script-card__icon">📖</div>
      <div class="script-card__title">${script.title}</div>
      <div class="script-card__cta">${dict.cta}</div>
    `;

    card.addEventListener("click", () => {
      sessionStorage.setItem("ofg_scriptId", script.scriptId); sessionStorage.setItem("ofg_scriptTitle", script.title);
      window.location.href = "reader.html";
    });

    grid.appendChild(card);
  });
}

applyLanguage(currentLang);
loadLibrary();
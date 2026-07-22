/* ===========================================================
   Online Focus Group — Flipbook Reader Logic
   Pulls the real script (chosen in library.html) from Google
   Drive via the backend, rendered with PDF.js.
   =========================================================== */

if (typeof pdfjsLib === "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("loadingIndicator");
    if (el) el.textContent = "تعذر تحميل مكتبة عرض الملفات (PDF.js). جرّب تعطيل أي مانع إعلانات ثم أعد تحميل الصفحة. / Failed to load the PDF viewer library — try disabling any ad blocker, then reload.";
  });
  throw new Error("pdfjsLib failed to load — check the Network tab for a blocked or failed request to jsdelivr.net");
}

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ---------- 1. Guard: read every session value FIRST, then check ----------
const fullName = sessionStorage.getItem("ofg_fullName");
const phone = sessionStorage.getItem("ofg_phone");
const ndaAccepted = sessionStorage.getItem("ofg_ndaAccepted");
const sessionToken = sessionStorage.getItem("ofg_sessionToken");
const scriptId = sessionStorage.getItem("ofg_scriptId");

if (!fullName || !phone) {
  window.location.href = "index.html";
} else if (ndaAccepted !== "Yes") {
  window.location.href = "nda.html";
} else if (!scriptId) {
  window.location.href = "library.html";
}

// ---------- 2. Elements ----------
const loadingIndicator = document.getElementById("loadingIndicator");
const pageEl = document.getElementById("pageCurrent");
const pageContent = document.getElementById("pageContent");
const watermarkEl = document.getElementById("watermark");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressFill = document.getElementById("progressFill");
const pageIndicator = document.getElementById("pageIndicator");

let pageImages = [];
let pageNotes = JSON.parse(sessionStorage.getItem("ofg_pageNotes") || "{}");
let currentIndex = 0;
const noteInput = document.getElementById("pageNote");

noteInput.addEventListener("input", () => {
  pageNotes[currentIndex] = noteInput.value;
  sessionStorage.setItem("ofg_pageNotes", JSON.stringify(pageNotes));
});
let zoomLevel = 1;
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.1;

// ---------- 3. Fetch and render the script ----------
async function loadScript() {
  let result;
  try {
    result = await getScriptContent(sessionToken, scriptId);
  } catch (err) {
    loadingIndicator.textContent = "تعذر الاتصال بالخادم. / Could not connect to the server.";
    return;
  }

  if (!result.success) {
    loadingIndicator.textContent = "تعذر تحميل النص: " + result.error;
    return;
  }

  document.getElementById("scriptTitle").textContent = result.title;

  // Decode base64 -> binary for PDF.js
  const binary = atob(result.pdfBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const renderScale = 2; // higher = sharper, especially useful for zoom

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: renderScale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    pageImages.push(canvas.toDataURL("image/png"));
  }

  loadingIndicator.hidden = true;
  pageEl.hidden = false;
  buildWatermark();
  render();
}

// ---------- 4. Watermark ----------
function buildWatermark() {
  watermarkEl.innerHTML = "";
  for (let i = 0; i < 24; i++) {
    const span = document.createElement("span");
    span.textContent = fullName;
    watermarkEl.appendChild(span);
  }
}

// ---------- 5. Render ----------
function render() {
  pageContent.innerHTML = `<img src="${pageImages[currentIndex]}" alt="page ${currentIndex + 1}" draggable="false" style="width: 100%; height: auto; display: block; pointer-events: none; -webkit-user-drag: none; user-select: none;">`;
  pageContent.style.transform = "none";
  const img = pageContent.querySelector("img");
  if (img) {
    img.style.width = `${zoomLevel * 100}%`;
    img.style.maxWidth = "none";
    img.style.margin = "0 auto";
  }

  noteInput.value = pageNotes[currentIndex] || "";
  noteInput.value = pageNotes[currentIndex] || "";
  progressFill.style.width = `${((currentIndex + 1) / pageImages.length) * 100}%`;
  pageIndicator.textContent = `${currentIndex + 1} / ${pageImages.length}`;

  prevBtn.disabled = currentIndex === 0;
  updateNextButtonState();
}

function updateNextButtonState() {
  const isLastPage = currentIndex === pageImages.length - 1;
  const isRTL = document.documentElement.getAttribute("dir") === "rtl";
  const arrow = nextBtn.querySelector(".nav-btn__arrow");

  nextBtn.classList.toggle("nav-btn--finish", isLastPage);
  arrow.textContent = isLastPage ? "✓" : "›";
  nextBtn.setAttribute("aria-label", isLastPage
    ? (isRTL ? "إنهاء والانتقال إلى التقييم" : "Finish and give feedback")
    : "Next page");
}

// ---------- 6. Flip navigation ----------
function goTo(newIndex, direction) {
  if (newIndex < 0 || newIndex > pageImages.length - 1) return;

  const outClass = direction === "forward" ? "flip-out-forward" : "flip-out-back";
  const inClass = direction === "forward" ? "flip-in-forward" : "flip-in-back";

  pageEl.classList.add(outClass);

  setTimeout(() => {
    currentIndex = newIndex;
    render();
    pageEl.classList.remove(outClass);
    pageEl.classList.add(inClass);
    setTimeout(() => pageEl.classList.remove(inClass), 320);
  }, 300);
}

function nextPage() {
  if (pageImages.length === 0) return;
  if (currentIndex === pageImages.length - 1) {
    finishReading();
    return;
  }
  goTo(currentIndex + 1, "forward");
}
function prevPage() {
  if (pageImages.length === 0) return;
  goTo(currentIndex - 1, "back");
}

function finishReading() {
  window.location.href = "feedback.html";
}

nextBtn.addEventListener("click", nextPage);
prevBtn.addEventListener("click", prevPage);

// ---------- 7. Keyboard navigation ----------
document.addEventListener("keydown", (e) => {
  const isRTL = document.documentElement.getAttribute("dir") === "rtl";
  if (e.key === "ArrowLeft") isRTL ? nextPage() : prevPage();
  else if (e.key === "ArrowRight") isRTL ? prevPage() : nextPage();
});

// ---------- 8. Touch swipe ----------
let touchStartX = 0;
document.querySelector(".book").addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.querySelector(".book").addEventListener("touchend", (e) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  const isRTL = document.documentElement.getAttribute("dir") === "rtl";
  if (Math.abs(deltaX) < 50) return;
  if (deltaX < 0) isRTL ? prevPage() : nextPage();
  else isRTL ? nextPage() : prevPage();
}, { passive: true });

// ---------- 9. Zoom ----------
document.getElementById("zoomInBtn").addEventListener("click", () => {
  zoomLevel = Math.min(ZOOM_MAX, +(zoomLevel + ZOOM_STEP).toFixed(2));
  pageContent.style.transform = "none";
  const img = pageContent.querySelector("img");
  if (img) {
    img.style.width = `${zoomLevel * 100}%`;
    img.style.maxWidth = "none";
    img.style.margin = "0 auto";
  }
});
document.getElementById("zoomOutBtn").addEventListener("click", () => {
  zoomLevel = Math.max(ZOOM_MIN, +(zoomLevel - ZOOM_STEP).toFixed(2));
  pageContent.style.transform = "none";
  const img = pageContent.querySelector("img");
  if (img) {
    img.style.width = `${zoomLevel * 100}%`;
    img.style.maxWidth = "none";
    img.style.margin = "0 auto";
  }
});

// ---------- 10. Language toggle ----------
document.getElementById("langToggle").addEventListener("click", () => {
  const html = document.documentElement;
  const isAr = html.getAttribute("lang") === "ar";
  html.setAttribute("lang", isAr ? "en" : "ar");
  html.setAttribute("dir", isAr ? "ltr" : "rtl");
  document.getElementById("langToggle").textContent = isAr ? "العربية" : "English";
  sessionStorage.setItem("ofg_lang", isAr ? "en" : "ar");
});

const savedLang = sessionStorage.getItem("ofg_lang");
if (savedLang) {
  document.documentElement.setAttribute("lang", savedLang);
  document.documentElement.setAttribute("dir", savedLang === "ar" ? "rtl" : "ltr");
  document.getElementById("langToggle").textContent = savedLang === "ar" ? "English" : "العربية";
}

// ---------- 11. Kick off & Security ----------
document.addEventListener("contextmenu", (e) => e.preventDefault());
sessionStorage.setItem("ofg_readingStart", new Date().toISOString());
loadScript();
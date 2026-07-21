/* ===========================================================
   Online Focus Group — Feedback Page Logic
   Handles: guarding access, sliders, recommend pills,
   assembling the full submission record, and (placeholder)
   submission.

   PLACEHOLDER NOTICE: submitRecord() below just logs the
   finished record to the console and shows the thank-you
   screen. In the backend phase, this function will be
   replaced with a real call that sends the record to Google
   Sheets — nothing else in this file needs to change.
   =========================================================== */

// ---------- 1. Guard ----------
const fullName = sessionStorage.getItem("ofg_fullName");
const phone = sessionStorage.getItem("ofg_phone");
const ndaAccepted = sessionStorage.getItem("ofg_ndaAccepted");

const scriptId = sessionStorage.getItem("ofg_scriptId");

if (!fullName || !phone) {
  window.location.href = "index.html";
} else if (ndaAccepted !== "Yes") {
  window.location.href = "nda.html";
} else if (!scriptId) {
  window.location.href = "library.html";
}

// ---------- 2. Translations ----------
const translations = {
  ar: {
    eyebrow: "استمارة التقييم", title: "رأيك يهمنا", subtitle: "يرجى تعبئة الاستمارة التالية بصدق",
    overall: "التقييم العام", sectionRatings: "تقييمات تفصيلية",
    story: "القصة", characters: "الشخصيات", dialogue: "الحوار", pacing: "الإيقاع",
    beginning: "البداية", middle: "المنتصف", ending: "النهاية",
    emotionalImpact: "التأثير العاطفي", originality: "الأصالة",
    recommend: "هل توصي بهذا العمل؟", yes: "نعم", maybe: "ربما", no: "لا",
    sectionOpen: "أسئلة مفتوحة",
    favoriteMoment: "أفضل لحظة في النص", leastFavoriteMoment: "أقل لحظة إعجاباً",
    confusingParts: "أجزاء غير واضحة", suggestions: "اقتراحات", additionalComments: "ملاحظات إضافية",
    submitBtn: "إرسال التقييم", thankYouTitle: "شكراً لك", thankYouSubtitle: "تم استلام تقييمك بنجاح",
    backToLibrary: "العودة إلى النصوص",
    toggleLabel: "English"
  },
  en: {
    eyebrow: "Feedback Form", title: "We'd Love Your Thoughts", subtitle: "Please fill out the form below honestly",
    overall: "Overall Rating", sectionRatings: "Detailed Ratings",
    story: "Story", characters: "Characters", dialogue: "Dialogue", pacing: "Pacing",
    beginning: "Beginning", middle: "Middle", ending: "Ending",
    emotionalImpact: "Emotional Impact", originality: "Originality",
    recommend: "Would you recommend it?", yes: "Yes", maybe: "Maybe", no: "No",
    sectionOpen: "Open Questions",
    favoriteMoment: "Favorite Moment", leastFavoriteMoment: "Least Favorite Moment",
    confusingParts: "Confusing Parts", suggestions: "Suggestions", additionalComments: "Additional Comments",
    submitBtn: "Submit Feedback", thankYouTitle: "Thank You", thankYouSubtitle: "Your feedback has been received",
    backToLibrary: "Back to Scripts",
    toggleLabel: "العربية"
  }
};

function applyLanguage(lang) {
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
}

document.getElementById("langToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("lang");
  applyLanguage(current === "ar" ? "en" : "ar");
});

const savedLang = sessionStorage.getItem("ofg_lang");
if (savedLang) applyLanguage(savedLang);

// ---------- 3. Sliders: live value display ----------
const sliderIds = ["overall", "story", "characters", "dialogue", "pacing",
  "beginning", "middle", "ending", "emotionalImpact", "originality"];

sliderIds.forEach((id) => {
  const input = document.getElementById(id);
  const display = document.getElementById(`val_${id}`);
  input.addEventListener("input", () => { display.textContent = input.value; });
});

// ---------- 4. Recommend pill group ----------
const recommendGroup = document.getElementById("recommendGroup");
const recommendInput = document.getElementById("recommend");

recommendGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill-btn");
  if (!btn) return;
  recommendGroup.querySelectorAll(".pill-btn").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  recommendInput.value = btn.getAttribute("data-value");
});

// ---------- 5. Device / browser detection ----------
function detectDeviceType() {
  const width = window.innerWidth;
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua) && width < 768) return "Mobile";
  if (/Tablet|iPad/i.test(ua) || (width >= 768 && width < 1024)) return "Tablet";
  return "Desktop";
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Firefox/")) return "Firefox";
  return "Other";
}

// ---------- 6. Submit ----------
const form = document.getElementById("feedbackForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const readingStart = sessionStorage.getItem("ofg_readingStart");
  const now = new Date();
  const readingDurationSeconds = readingStart
    ? Math.round((now - new Date(readingStart)) / 1000)
    : null;

  const record = {
    // Participant / NDA / Script (carried from earlier steps)
    scriptId: scriptId,
    fullName: fullName,
    phone: phone,
    ndaAccepted: ndaAccepted,
    ndaDate: sessionStorage.getItem("ofg_ndaDate"),
    ndaTime: sessionStorage.getItem("ofg_ndaTime"),

    // Ratings
    overall: document.getElementById("overall").value,
    story: document.getElementById("story").value,
    characters: document.getElementById("characters").value,
    dialogue: document.getElementById("dialogue").value,
    pacing: document.getElementById("pacing").value,
    beginning: document.getElementById("beginning").value,
    middle: document.getElementById("middle").value,
    ending: document.getElementById("ending").value,
    emotionalImpact: document.getElementById("emotionalImpact").value,
    originality: document.getElementById("originality").value,
    recommend: recommendInput.value || "Not answered",

    // Open text
    favoriteMoment: document.getElementById("favoriteMoment").value.trim(),
    leastFavoriteMoment: document.getElementById("leastFavoriteMoment").value.trim(),
    confusingParts: document.getElementById("confusingParts").value.trim(),
    suggestions: document.getElementById("suggestions").value.trim(),
    additionalComments: document.getElementById("additionalComments").value.trim(),

    // Meta
    completionTime: now.toISOString(),
    readingDurationSeconds: readingDurationSeconds,
    browser: detectBrowser(),
    deviceType: detectDeviceType()
  };

  submitRecord(record);
});

async function submitRecord(record) {
  const submitBtn = form.querySelector(".btn-primary");
  submitBtn.disabled = true;

  record.sessionToken = sessionStorage.getItem("ofg_sessionToken");

  try {
    const result = await submitFeedback(record);

    if (!result.success) {
      alert("حدث خطأ، يرجى المحاولة مرة أخرى. / Something went wrong, please try again.");
      submitBtn.disabled = false;
      return;
    }

    // Mark this script as completed so the library can show a badge for it
    const completed = JSON.parse(sessionStorage.getItem("ofg_completedScripts") || "[]");
    if (!completed.includes(scriptId)) completed.push(scriptId);
    sessionStorage.setItem("ofg_completedScripts", JSON.stringify(completed));

    // Clear the current script selection so returning to the library
    // (or reopening the reader) requires picking again
    sessionStorage.removeItem("ofg_scriptId");

    form.hidden = true;
    document.getElementById("thankYou").hidden = false;

    document.getElementById("backToLibraryBtn").addEventListener("click", () => {
      window.location.href = "library.html";
    });

  } catch (err) {
    alert("تعذر الاتصال بالخادم. / Could not connect to the server.");
    submitBtn.disabled = false;
  }
}
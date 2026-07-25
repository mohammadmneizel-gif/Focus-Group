/* ===========================================================
   Online Focus Group — Feedback Page Logic
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
    overall: "التقييم العام", overallHint: "1 = ضعيف جداً · 5 = ممتاز",
    sectionRatings: "تقييمات تفصيلية",
    story: "القصة", storyHint: "1 = غير مقنعة · 5 = مقنعة جداً",
    characters: "الشخصيات", charactersHint: "1 = غير مقنعة · 5 = قوية جداً",
    dialogue: "الحوار", dialogueHint: "1 = غير طبيعي · 5 = طبيعي جداً",
    pacing: "الإيقاع", pacingHint: "1 = غير متوازن · 5 = متوازن جداً",
    beginning: "البداية", beginningHint: "1 = ضعيفة · 5 = قوية جداً",
    middle: "المنتصف", middleHint: "1 = ضعيف · 5 = قوي جداً",
    ending: "النهاية", endingHint: "1 = ضعيفة · 5 = قوية جداً",
    emotionalImpact: "التأثير العاطفي", emotionalImpactHint: "1 = منعدم · 5 = قوي جداً",
    originality: "الأصالة", originalityHint: "1 = مكرر · 5 = مبتكر جداً",
    recommend: "هل توصي بهذا العمل؟", yes: "نعم", maybe: "ربما", no: "لا",
    sectionOpen: "أسئلة مفتوحة",
    favoriteMoment: "أفضل لحظة في النص", leastFavoriteMoment: "أقل لحظة إعجاباً",
    confusingParts: "أجزاء غير واضحة", suggestions: "اقتراحات",
    additionalCommentsOptional: "ملاحظات إضافية (اختياري)",
    submitBtn: "إرسال التقييم", backToScriptBtn: "العودة للنص",
    thankYouTitle: "شكراً لك", thankYouSubtitle: "تم استلام تقييمك بنجاح",
    backToLibrary: "العودة إلى مكتبة النصوص",
    requiredError: "هذا الحقل مطلوب", recommendError: "يرجى اختيار إجابة",
    pageNotesLabel: "ملاحظاتك أثناء القراءة (سيتم إرفاقها تلقائياً)",
    toggleLabel: "English"
  },
  en: {
    eyebrow: "Feedback Form", title: "We'd Love Your Thoughts", subtitle: "Please fill out the form below honestly",
    overall: "Overall Rating", overallHint: "1 = Very poor · 5 = Excellent",
    sectionRatings: "Detailed Ratings",
    story: "Story", storyHint: "1 = Unconvincing · 5 = Very convincing",
    characters: "Characters", charactersHint: "1 = Unconvincing · 5 = Very strong",
    dialogue: "Dialogue", dialogueHint: "1 = Unnatural · 5 = Very natural",
    pacing: "Pacing", pacingHint: "1 = Unbalanced · 5 = Very balanced",
    beginning: "Beginning", beginningHint: "1 = Weak · 5 = Very strong",
    middle: "Middle", middleHint: "1 = Weak · 5 = Very strong",
    ending: "Ending", endingHint: "1 = Weak · 5 = Very strong",
    emotionalImpact: "Emotional Impact", emotionalImpactHint: "1 = None · 5 = Very strong",
    originality: "Originality", originalityHint: "1 = Repetitive · 5 = Very original",
    recommend: "Would you recommend it?", yes: "Yes", maybe: "Maybe", no: "No",
    sectionOpen: "Open Questions",
    favoriteMoment: "Favorite Moment", leastFavoriteMoment: "Least Favorite Moment",
    confusingParts: "Confusing Parts", suggestions: "Suggestions",
    additionalCommentsOptional: "Additional Comments (Optional)",
    submitBtn: "Submit Feedback", backToScriptBtn: "Back to Script",
    thankYouTitle: "Thank You", thankYouSubtitle: "Your feedback has been received",
    backToLibrary: "Back to Library",
    requiredError: "This field is required", recommendError: "Please select an answer",
    pageNotesLabel: "Your notes while reading (attached automatically)",
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

// ---------- 3. Page notes summary (read-only reference) ----------
const pageNotesObj = JSON.parse(sessionStorage.getItem("ofg_pageNotes") || "{}");
let compiledNotes = "";
for (const [page, note] of Object.entries(pageNotesObj)) {
  if (note.trim()) compiledNotes += `Page ${parseInt(page) + 1}:\n${note}\n\n`;
}
compiledNotes = compiledNotes.trim();

if (compiledNotes) {
  document.getElementById("pageNotesSummary").hidden = false;
  document.getElementById("pageNotesSummaryBody").textContent = compiledNotes;
}

// ---------- 4. Rating button groups ----------
const ratingIds = ["overall", "story", "characters", "dialogue", "pacing",
  "beginning", "middle", "ending", "emotionalImpact", "originality"];

document.querySelectorAll(".rating-btn-group").forEach((group) => {
  const targetId = group.getAttribute("data-target");
  const hiddenInput = document.getElementById(targetId);
  
  // Load saved rating on refresh
  const savedVal = sessionStorage.getItem("ofg_rating_" + targetId);
  if (savedVal) {
    hiddenInput.value = savedVal;
    const activeBtn = group.querySelector(`.rating-btn[data-value="${savedVal}"]`);
    if (activeBtn) activeBtn.classList.add("selected");
  }

  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".rating-btn");
    if (!btn) return;

    group.querySelectorAll(".rating-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    
    const val = btn.getAttribute("data-value");
    hiddenInput.value = val;
    sessionStorage.setItem("ofg_rating_" + targetId, val); // Save instantly
    
    group.closest(".rating-field").classList.remove("has-error");
  });
});

// ---------- 5. Recommend pill group ----------
const recommendGroup = document.getElementById("recommendGroup");
const recommendInput = document.getElementById("recommend");

// Load saved recommendation on refresh
const savedRec = sessionStorage.getItem("ofg_rating_recommend");
if (savedRec) {
  recommendInput.value = savedRec;
  const activeRecBtn = recommendGroup.querySelector(`.pill-btn[data-value="${savedRec}"]`);
  if (activeRecBtn) activeRecBtn.classList.add("selected");
}

recommendGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill-btn");
  if (!btn) return;
  recommendGroup.querySelectorAll(".pill-btn").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  
  const val = btn.getAttribute("data-value");
  recommendInput.value = val;
  sessionStorage.setItem("ofg_rating_recommend", val); // Save instantly
  
  document.getElementById("recommendField").classList.remove("has-error");
});

// ---------- 6. Validation (everything mandatory except Additional Comments) ----------
const requiredTextFieldIds = ["favoriteMoment", "leastFavoriteMoment", "confusingParts", "suggestions"];

requiredTextFieldIds.forEach((id) => {
  document.getElementById(id).addEventListener("input", (e) => {
    if (e.target.value.trim().length > 0) {
      e.target.closest(".field").classList.remove("has-error");
    }
  });
});

function validateForm() {
  let isValid = true;

  ratingIds.forEach((id) => {
    const hiddenInput = document.getElementById(id);
    const fieldWrap = hiddenInput.closest(".rating-field");
    const filled = hiddenInput.value !== "";
    fieldWrap.classList.toggle("has-error", !filled);
    if (!filled) isValid = false;
  });

  requiredTextFieldIds.forEach((id) => {
    const input = document.getElementById(id);
    const fieldWrap = input.closest(".field");
    const filled = input.value.trim().length > 0;
    fieldWrap.classList.toggle("has-error", !filled);
    if (!filled) isValid = false;
  });

  const recommendField = document.getElementById("recommendField");
  const recommendFilled = !!recommendInput.value;
  recommendField.classList.toggle("has-error", !recommendFilled);
  if (!recommendFilled) isValid = false;

  if (!isValid) {
    const firstError = form.querySelector(".has-error");
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return isValid;
}

// ---------- 7. Device / browser detection ----------
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

// ---------- 8. Auto-save text drafts (survives accidental reload) ----------
const textFieldsToSave = ["favoriteMoment", "leastFavoriteMoment", "confusingParts", "suggestions", "additionalComments"];
textFieldsToSave.forEach((id) => {
  const el = document.getElementById(id);
  const saved = sessionStorage.getItem("ofg_draft_" + id);
  if (saved) el.value = saved;
  el.addEventListener("input", () => sessionStorage.setItem("ofg_draft_" + id, el.value));
});

// ---------- 9. Submit & Back ----------
const form = document.getElementById("feedbackForm");
document.getElementById("backToScriptBtn").addEventListener("click", () => {
  window.location.href = "reader.html";
});
document.getElementById("backToLibraryTopBtn").addEventListener("click", () => {
  window.location.href = "library.html";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const readingStart = sessionStorage.getItem("ofg_readingStart");
  const now = new Date();
  const readingDurationSeconds = readingStart
    ? Math.round((now - new Date(readingStart)) / 1000)
    : null;

  const record = {
    scriptId: scriptId,
    scriptTitle: sessionStorage.getItem("ofg_scriptTitle"),
    fullName: fullName,
    phone: phone,
    ndaAccepted: ndaAccepted,
    ndaDate: sessionStorage.getItem("ofg_ndaDate"),
    ndaTime: sessionStorage.getItem("ofg_ndaTime"),

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

    favoriteMoment: document.getElementById("favoriteMoment").value.trim(),
    leastFavoriteMoment: document.getElementById("leastFavoriteMoment").value.trim(),
    confusingParts: document.getElementById("confusingParts").value.trim(),
    suggestions: document.getElementById("suggestions").value.trim(),
    pageNotes: compiledNotes,
    additionalComments: document.getElementById("additionalComments").value.trim(),

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

    const completed = JSON.parse(sessionStorage.getItem("ofg_completedScripts") || "[]");
    if (!completed.includes(scriptId)) completed.push(scriptId);
    sessionStorage.setItem("ofg_completedScripts", JSON.stringify(completed));

    sessionStorage.removeItem("ofg_scriptId");
    sessionStorage.removeItem("ofg_pageNotes");
    textFieldsToSave.forEach((id) => sessionStorage.removeItem("ofg_draft_" + id));
    ratingIds.forEach((id) => sessionStorage.removeItem("ofg_rating_" + id));
    sessionStorage.removeItem("ofg_rating_recommend");

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
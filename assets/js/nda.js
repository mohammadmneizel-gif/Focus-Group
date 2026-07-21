/* ===========================================================
   Online Focus Group — NDA Page Logic
   Handles: language toggle, guarding against skipped steps,
   enabling Continue only once the checkbox is checked, and
   recording the NDA acceptance (name, phone, date, time).
   Note: this does NOT talk to the backend yet — that's added
   in a later phase. For now the record is kept in the browser.
   =========================================================== */

// ---------- 1. Guard: must have completed the entry step first ----------
const fullName = sessionStorage.getItem("ofg_fullName");
const phone = sessionStorage.getItem("ofg_phone");

if (!fullName || !phone) {
  window.location.href = "index.html";
}

// ---------- 2. Translations ----------
const translations = {
  ar: {
    eyebrow: "اتفاقية عدم إفشاء",
    title: "قبل المتابعة",
    subtitle: "يرجى قراءة الاتفاقية التالية بعناية قبل المتابعة إلى النص",
    checkboxLabel: "لقد قرأت هذه الاتفاقية وأوافق عليها",
    continueBtn: "متابعة إلى النص",
    toggleLabel: "English"
  },
  en: {
    eyebrow: "Non-Disclosure Agreement",
    title: "Before You Continue",
    subtitle: "Please read the following agreement carefully before continuing to the script",
    checkboxLabel: "I have read and agree to the NDA",
    continueBtn: "Continue to Script",
    toggleLabel: "العربية",
    // English translations of the NDA paragraphs
    ndaP1: "The participant (\"the Recipient\") agrees to maintain full confidentiality of any script or creative content accessed through this platform, as part of a private, unannounced focus group.",
    ndaP2: "The Recipient agrees not to copy, photograph, record, share, or republish any part of the content in any form — including screenshots, photographing the screen with another device, copying text, or any other method.",
    ndaP3: "The Recipient acknowledges that this content is unpublished, and that any disclosure or leak may cause harm to the owning party and may carry legal liability.",
    ndaP4: "The organizing party reserves the right to trace any copy of the content bearing a participant-specific watermark, for intellectual property protection purposes.",
    ndaP5: "By agreeing below, the Recipient confirms they have read and understood this agreement and agree to be fully bound by its terms."
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

// ---------- 3. Checkbox enables Continue ----------
const checkbox = document.getElementById("ndaCheckbox");
const continueBtn = document.getElementById("continueBtn");

checkbox.addEventListener("change", () => {
  continueBtn.disabled = !checkbox.checked;
});

// ---------- 4. Record NDA acceptance and move on ----------
continueBtn.addEventListener("click", async () => {
  if (!checkbox.checked) return;

  const sessionToken = sessionStorage.getItem("ofg_sessionToken");
  continueBtn.disabled = true;

  try {
    const result = await acceptNda(sessionToken);

    if (!result.success) {
      alert("حدث خطأ، يرجى المحاولة مرة أخرى. / Something went wrong, please try again.");
      continueBtn.disabled = false;
      return;
    }

    const now = new Date();
    sessionStorage.setItem("ofg_ndaAccepted", "Yes");
    sessionStorage.setItem("ofg_ndaDate", now.toISOString().split("T")[0]);
    sessionStorage.setItem("ofg_ndaTime", now.toTimeString().split(" ")[0]);

    window.location.href = "library.html";

  } catch (err) {
    alert("تعذر الاتصال بالخادم. / Could not connect to the server.");
    continueBtn.disabled = false;
  }
});
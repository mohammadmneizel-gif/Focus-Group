/* ===========================================================
   Online Focus Group — Entry Page Logic
   =========================================================== */

const translations = {
  ar: {
    eyebrow: "مجموعة تركيز خاصة", title: "مرحباً بك", subtitle: "يرجى إدخال بياناتك للمتابعة",
    nameLabel: "الاسم الكامل", namePlaceholder: "مثال: أحمد الخالدي", nameError: "يرجى إدخال الاسم الكامل",
    phoneLabel: "رقم الهاتف", phonePlaceholder: "مثال: 07XXXXXXXX", phoneError: "يرجى إدخال رقم هاتف صحيح",
    submitBtn: "متابعة", footnote: "محتوى هذه الصفحة سري ومخصص للمشاركين المدعوين فقط",
    toggleLabel: "English"
  },
  en: {
    eyebrow: "Private Focus Group", title: "Welcome", subtitle: "Please enter your details to continue",
    nameLabel: "Full Name", namePlaceholder: "e.g. Ahmad Khaldi", nameError: "Please enter your full name",
    phoneLabel: "Phone Number", phonePlaceholder: "e.g. 07XXXXXXXX", phoneError: "Please enter a valid phone number",
    submitBtn: "Continue", footnote: "This page's content is confidential and for invited participants only",
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
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
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

const form = document.getElementById("entryForm");
const nameField = document.getElementById("nameField");
const phoneField = document.getElementById("phoneField");
const nameInput = document.getElementById("fullName");
const phoneInput = document.getElementById("phoneNumber");

function isValidName(value) {
  const trimmed = value.trim();
  return trimmed.length >= 3 && trimmed.split(/\s+/).length >= 2;
}

function isValidPhone(value) {
  const cleaned = value.replace(/[\s-]/g, "");
  return /^(07\d{8}|\+9627\d{8})$/.test(cleaned);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameOk = isValidName(nameInput.value);
  const phoneOk = isValidPhone(phoneInput.value);

  nameField.classList.toggle("has-error", !nameOk);
  phoneField.classList.toggle("has-error", !phoneOk);

  if (!nameOk || !phoneOk) return;

  const submitBtn = form.querySelector(".btn-primary");
  submitBtn.disabled = true;

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const lang = document.documentElement.getAttribute("lang") || "ar";

  try {
    const result = await registerParticipant(name, phone, lang);

    if (!result.success) {
      alert("حدث خطأ، يرجى المحاولة مرة أخرى. / Something went wrong, please try again.");
      submitBtn.disabled = false;
      return;
    }

    sessionStorage.setItem("ofg_fullName", name);
    sessionStorage.setItem("ofg_phone", phone);
    sessionStorage.setItem("ofg_sessionToken", result.sessionToken);

    window.location.href = "nda.html";

  } catch (err) {
    alert("تعذر الاتصال بالخادم. / Could not connect to the server.");
    submitBtn.disabled = false;
  }
});
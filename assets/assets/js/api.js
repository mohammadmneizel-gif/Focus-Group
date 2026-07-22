/* ===========================================================
   Online Focus Group — Backend communication
   This is the ONLY file that talks to the Apps Script backend.
   Every other page calls the functions below instead of using
   fetch() directly.

   >>> PASTE YOUR WEB APP URL BELOW, replacing the placeholder <
   =========================================================== */

const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxhCt7yQZQfUTj4JQjiQyJf8dGpxkwnxziD31iiESlFZDCbhQhGuOG9cyvcdqWP5wau/exec";

async function callBackend(action, payload) {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      // text/plain avoids a CORS preflight request, which Apps Script
      // Web Apps don't handle well. The backend still parses this as JSON.
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({ action, ...payload })
  });

  return response.json();
}

// ---------- Public API used by the pages ----------

function registerParticipant(fullName, phone, language) {
  return callBackend("registerParticipant", { fullName, phone, language });
}

function acceptNda(sessionToken) {
  return callBackend("acceptNda", { sessionToken });
}

function listScripts(sessionToken) {
  return callBackend("listScripts", { sessionToken });
}

function getScriptContent(sessionToken, scriptId) {
  return callBackend("getScript", { sessionToken, scriptId });
}

function submitFeedback(record) {
  return callBackend("submitFeedback", record);
}
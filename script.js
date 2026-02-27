const params = new URLSearchParams(window.location.search);
const TRACKING_ENDPOINT = "https://script.google.com/macros/s/AKfycbzoBA-4YHuqbDUa5Fc_3k0PhEz1KCyhlg0PTyQCKkRY6E4Vd6uYRHijWzJdHBuZIO7Y/exec";

const KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","ref","fbclid"];
KEYS.forEach(k => {
  const el = document.getElementById(k);
  if (el) el.value = params.get(k) || "";
});

function getOrCreate(key, factory) {
  let v = localStorage.getItem(key);
  if (!v) {
    v = factory();
    localStorage.setItem(key, v);
  }
  return v;
}

const sessionId = getOrCreate("alax1_session_id", () => `sess_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);
const clickId = params.get("fbclid") || getOrCreate("alax1_click_id", () => `click_${Date.now()}_${Math.random().toString(36).slice(2,8)}`);

function payloadBase() {
  return {
    session_id: sessionId,
    click_id: clickId,
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    fbclid: params.get("fbclid") || "",
    referrer_code: params.get("ref") || "",
    page_url: window.location.href,
    campaign: params.get("utm_campaign") || "",
    adset: params.get("utm_content") || "",
    ad: params.get("utm_term") || ""
  };
}

async function track(event_name, extra = {}) {
  const body = JSON.stringify({ event_name, ...payloadBase(), ...extra });
  try {
    await fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      mode: "no-cors"
    });
  } catch (_) {
    // best effort tracking
  }
}

track("lp_view");

const cta = document.querySelector('a[href="#reserve"]');
if (cta) {
  cta.addEventListener("click", () => track("cta_click"));
}

const form = document.getElementById("reserveForm");
if (form) {
  const emailInput = form.querySelector('input[name="email"]');

  const markStart = () => track("form_start", { email: (emailInput?.value || "").trim() });
  emailInput?.addEventListener("focus", markStart, { once: true });

  form.addEventListener("submit", () => {
    track("form_redirect", { email: (emailInput?.value || "").trim() });
  });
}

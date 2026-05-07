const search = new URLSearchParams(window.location.search);
const shell = document.getElementById("billing-success-shell");
const copy = document.getElementById("billing-success-copy");
const sessionId = String(search.get("session_id") || "").trim();

activateBilling();

async function activateBilling() {
  if (!sessionId) {
    renderState("No pude encontrar la compra.", "Puedes volver a la landing o escribirnos para revisarlo.");
    return;
  }

  try {
    const response = await fetch(`/api/billing/session?session_id=${encodeURIComponent(sessionId)}`, {
      headers: { Accept: "application/json" },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.activatePro) {
      throw new Error(payload?.error || "Todavia no pude confirmar la compra.");
    }

    promoteLocalBilling(payload.plan);
    renderState(
      "HoySi Pro ya esta activo.",
      payload.plan === "yearly"
        ? "Tu navegador ya quedo con Pro anual. Te voy a llevar a la app."
        : "Tu navegador ya quedo con Pro mensual. Te voy a llevar a la app.",
    );

    window.setTimeout(() => {
      window.location.replace("/?billing=success");
    }, 1800);
  } catch (error) {
    renderState("Todavia no pude activarlo sola.", `${error?.message || "Hubo un problema."} Si hace falta, escribenos y lo revisamos.`);
  }
}

function promoteLocalBilling(plan) {
  const keys = ["hoysi-state-v3", "hoysi-state-v2", "hoysi-state-v1"];
  let keyToUse = "hoysi-state-v3";
  let nextState = null;

  for (const key of keys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      nextState = JSON.parse(raw);
      keyToUse = key;
      break;
    } catch (error) {
      continue;
    }
  }

  if (!nextState || typeof nextState !== "object") {
    nextState = {};
  }

  nextState.billing = {
    tier: "pro",
    plan: plan === "yearly" ? "yearly" : "monthly",
    trialStartedAt: "",
    trialEndsAt: "",
    trialUsed: true,
    aiWindowStartedAt: new Date().toISOString(),
    aiQuestionsUsed: 0,
  };

  window.localStorage.setItem(keyToUse, JSON.stringify(nextState));
}

function renderState(title, message) {
  if (shell) {
    const heading = shell.querySelector("h1");
    if (heading) {
      heading.textContent = title;
    }
  }

  if (copy) {
    copy.textContent = message;
  }
}
